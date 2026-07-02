import { createApp } from './app.js';
import { getDatabasePath, initializeDatabase } from './db/index.js';

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

initializeDatabase();

const app = createApp();

app.listen(port, host, () => {
  console.log(`DoneYet API listening on http://${host}:${port}`);
  console.log(`SQLite database: ${getDatabasePath()}`);
});
