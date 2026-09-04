import http from 'http';
import { WebSocketServer } from 'ws';
import { RoomManager } from './roomManager';
import { setupSocketHandler } from './socketHandler';
import { initDatabase } from './db';
import { ProfileService } from './profileService';

// Initialize SQLite database
initDatabase();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Guard against giant payloads
      if (body.length > 1e6) req.destroy();
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

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

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
      const name = parsedUrl.searchParams.get('name') || 'Gaucho';

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

    if (pathname === '/api/profile/match-result' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { token, won, matchEvents } = body;

      if (!token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing token' }));
        return;
      }

      const result = ProfileService.recordMatchResult(token, Boolean(won), matchEvents || []);
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
