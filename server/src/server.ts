import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './roomManager';
import { setupSocketHandler } from './socketHandler';
import { initDatabase, closeDatabase } from './db';
import { ProfileService } from './profileService';

// Initialize SQLite database
initDatabase();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Resolve client dist path robustly across local run and build dirs
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist')
];
const clientDistPath = clientDistCandidates.find(p => fs.existsSync(p)) || clientDistCandidates[0];

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

function serveStaticFile(req: http.IncomingMessage, res: http.ServerResponse, pathname: string) {
  if (!fs.existsSync(clientDistPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - Frontend dist no encontrado. Ejecutá npm run build antes de iniciar el servidor.');
    return;
  }

  // Remove leading slash and sanitize path
  let relativePath = pathname.replace(/^\/+/, '');
  if (!relativePath) {
    relativePath = 'index.html';
  }

  let filePath = path.resolve(clientDistPath, relativePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(clientDistPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 - Prohibido');
    return;
  }

  // If file does not exist or is a directory, fallback to index.html for SPA routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.resolve(clientDistPath, 'index.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - No encontrado');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isHtml = ext === '.html';
  const isAsset = filePath.includes(path.join('assets', ''));

  // Cache headers: immutable for fingerprinted assets, no-cache for HTML/SEO
  const cacheControl = isAsset
    ? 'public, max-age=31536000, immutable'
    : isHtml || ext === '.txt' || ext === '.xml'
    ? 'no-cache, no-store, must-revalidate'
    : 'public, max-age=86400';

  const acceptEncoding = (req.headers['accept-encoding'] as string) || '';
  const canGzip = !['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.ogg'].includes(ext) && acceptEncoding.includes('gzip');

  try {
    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);

    if (canGzip) {
      const gzipped = zlib.gzipSync(fileBuffer);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', gzipped.length);
      res.writeHead(200);
      res.end(gzipped);
    } else {
      res.setHeader('Content-Length', fileBuffer.length);
      res.writeHead(200);
      res.end(fileBuffer);
    }
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error interno del servidor: ' + err.message);
  }
}


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

const roomManager = new RoomManager();
let wss: WebSocketServer;

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

  // Health check with operational telemetry
  if (pathname === '/health' || pathname === '/api/health') {
    const memory = process.memoryUsage();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      version: '1.0.0',
      time: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      roomsActive: roomManager.getActiveRoomCount(),
      connectedSockets: wss ? wss.clients.size : 0,
      memory: {
        rssMB: Math.round(memory.rss / 1024 / 1024),
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024)
      }
    }));
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

  // Serve static assets and SPA fallback for all frontend GET/HEAD requests
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStaticFile(req, res, pathname);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 - No encontrado');
});

wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  setupSocketHandler(ws, roomManager);
});

// Graceful Shutdown Handlers (SIGTERM / SIGINT)
let isShuttingDown = false;

function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Server] Señal ${signal} recibida. Iniciando cierre ordenado (Graceful Shutdown)...`);

  // Stop accepting new HTTP connections
  server.close(() => {
    console.log('[Server] Servidor HTTP cerrado para nuevas conexiones.');
  });

  // Notify active rooms and clear timers
  roomManager.closeAllRooms('El servidor se está reiniciando para una actualización. Por favor reconectate en unos segundos.');

  // Close active WebSockets with 1001 (Going Away)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Servidor reiniciándose');
    }
  }

  wss.close(() => {
    console.log('[Server] Servidor WebSocket cerrado.');
  });

  // Close SQLite database cleanly
  closeDatabase();

  console.log('[Server] Cierre ordenado finalizado.');
  setTimeout(() => {
    process.exit(0);
  }, 250);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(PORT, () => {
  console.log(`[Truco Server] Authoritative WebSocket & SQLite server running on port ${PORT}`);
  console.log(`[Truco Server] Frontend servido desde: ${clientDistPath}`);
});

