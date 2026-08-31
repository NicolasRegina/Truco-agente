import http from 'http';
import { WebSocketServer } from 'ws';
import { RoomManager } from './roomManager';
import { setupSocketHandler } from './socketHandler';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = http.createServer((req, res) => {
  // Simple CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
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
  console.log(`[Truco Server] Authoritative WebSocket server running on port ${PORT}`);
});
