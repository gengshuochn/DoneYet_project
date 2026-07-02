import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const dataDir = path.join(projectRoot, 'data');
const databasePath = process.env.DONEYET_DB_PATH ?? path.join(dataDir, 'doneyet.sqlite');

let database: Database.Database | undefined;

export function getDatabase() {
  if (!database) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    database = new Database(databasePath);
    database.pragma('foreign_keys = ON');
    database.pragma('journal_mode = WAL');
  }

  return database;
}

export function getDatabasePath() {
  return databasePath;
}
