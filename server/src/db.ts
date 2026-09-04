import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Resolve data directory robustly whether executed from repo root or server workspace
const dataDir = process.cwd().endsWith('server')
  ? path.resolve(process.cwd(), 'data')
  : path.resolve(process.cwd(), 'server/data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'truco.db');

export const db = new DatabaseSync(DB_PATH);

export function initDatabase() {
  // Set pragmatic settings for high performance and durability
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      device_token TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      coins INTEGER DEFAULT 0,
      coins_earned_today INTEGER DEFAULT 0,
      last_earn_date TEXT NOT NULL,
      equipped_title TEXT DEFAULT 'Novato de Pulpería',
      equipped_border TEXT DEFAULT 'default',
      equipped_mate TEXT DEFAULT 'calabaza',
      equipped_card_back TEXT DEFAULT 'clasico',
      unlocked_items TEXT NOT NULL,
      sync_code TEXT UNIQUE NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS player_missions (
      device_token TEXT NOT NULL,
      date TEXT NOT NULL,
      mission_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      target INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      claimed INTEGER DEFAULT 0,
      PRIMARY KEY (device_token, date, mission_id)
    );

    CREATE TABLE IF NOT EXISTS sync_tokens (
      code TEXT PRIMARY KEY,
      source_device_token TEXT NOT NULL,
      target_device_token TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sync_tokens_source ON sync_tokens(source_device_token);
  `);
}
