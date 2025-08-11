import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'path';

let db: any = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: join(process.cwd(), 'meetup.db'),
      driver: sqlite3.Database
    });

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    sender_id TEXT,
    sender_name TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    participant_id TEXT,
    participant_name TEXT,
    latitude REAL,
    longitude REAL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );
`);

// Clean up old sessions (older than 24 hours)
db.exec(`
  DELETE FROM sessions WHERE created_at < datetime('now', '-1 day');
  DELETE FROM messages WHERE session_id NOT IN (SELECT id FROM sessions);
  DELETE FROM locations WHERE session_id NOT IN (SELECT id FROM sessions);
`);

  }
  return db;
}

export default getDb;
