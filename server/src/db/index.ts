import { getDatabase, getDatabasePath } from './connection.js';
import { initializeSchema } from './schema.js';

export function initializeDatabase() {
  const db = getDatabase();
  initializeSchema(db);
  return db;
}

export { getDatabase, getDatabasePath };
