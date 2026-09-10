import http from 'http';
import { WebSocketServer } from 'ws';
import { RoomManager } from './roomManager';
import { setupSocketHandler } from './socketHandler';
import { initDatabase } from './db';
import { ProfileService } from './profileService';

// Initialize SQLite database
initDatabase();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const MAX_BODY_BYTES = 64 * 1024; // 64 KB max payload limit

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Guard against giant payloads (DoS prevention)
      if (body.length > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error('Payload demasiado grande'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// In-memory rate limiter for API endpoints (60 req/min per IP)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= maxRequests) {
    return true;
  }
  entry.count++;
  return false;
}

// Cleanup expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const server = http.createServer(async (req, res) => {
  // CORS and Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Hardening Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Rate Limiting check on all API routes
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (pathname.startsWith('/api/') && isRateLimited(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Demasiadas solicitudes. Por favor intentá más tarde.' }));
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  // --- Profile & Economy Endpoints ---
  try {
    if (pathname === '/api/profile' && req.method === 'GET') {
      const token = parsedUrl.searchParams.get('token');
      const name = parsedUrl.searchParams.get('name') || undefined;

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing token parameter' }));
        return;
      }

      const profile = ProfileService.getProfile(token, name);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(profile));
      return;
    }

    if (pathname === '/api/profile/heal' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        token,
        playerName,
        coins,
        coinsEarnedToday,
        unlockedItems,
        equippedTitle,
        equippedBorder,
        equippedMate,
        equippedCardBack,
        missions
      } = body;

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing token parameter' }));
        return;
      }

      const result = ProfileService.healOrRestorePlayer({
        deviceToken: token,
        playerName,
        coins,
        coinsEarnedToday,
        unlockedItems,
        equippedTitle,
        equippedBorder,
        equippedMate,
        equippedCardBack,
        missions
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/update-name' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, name } = body;

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing token' }));
        return;
      }

      const result = ProfileService.updatePlayerName(token, name);
      res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/match-result' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, won, matchEvents, isPrivateRoom, isForfeit, totalPointsScored } = body;

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing token' }));
        return;
      }

      const result = ProfileService.recordMatchResult(token, Boolean(won), matchEvents || [], {
        isPrivateRoom: Boolean(isPrivateRoom),
        isForfeit: Boolean(isForfeit),
        totalPointsScored: Number(totalPointsScored || 0)
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/record-event' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, eventKey, count } = body;

      if (!token || !eventKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.recordEvent(token, eventKey, count || 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/claim-mission' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, missionId } = body;

      if (!token || !missionId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.claimMission(token, missionId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/buy-item' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, itemId } = body;

      if (!token || !itemId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.buyItem(token, itemId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/equip-item' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, itemId } = body;

      if (!token || !itemId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.equipItem(token, itemId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/generate-sync-code' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token } = body;

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing token' }));
        return;
      }

      const result = ProfileService.generateEphemeralSyncCode(token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/request-link' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, code } = body;

      if (!token || !code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.requestDeviceLink(token, code);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/sync-status' && req.method === 'GET') {
      const code = parsedUrl.searchParams.get('code') || '';
      const token = parsedUrl.searchParams.get('token') || '';

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing code' }));
        return;
      }

      const result = ProfileService.checkSyncStatus(token, code);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/resolve-sync' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, code, action } = body;

      if (!token || !code || !action) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.resolveSyncRequest(token, code, action);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/profile/sync-device' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, syncCode } = body;

      if (!token || !syncCode) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing parameters' }));
        return;
      }

      const result = ProfileService.requestDeviceLink(token, syncCode);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }
  } catch (err: any) {
    console.error('API Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const wss = new WebSocketServer({ server });
const roomManager = new RoomManager();

wss.on('connection', (ws) => {
  setupSocketHandler(ws, roomManager);
});

server.listen(PORT, () => {
  console.log(`[Truco Server] Authoritative WebSocket & SQLite server running on port ${PORT}`);
});
