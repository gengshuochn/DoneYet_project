import { Router } from 'express';
import { getDatabasePath } from '../db/index.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'doneyet-api',
    databasePath: getDatabasePath(),
    timestamp: new Date().toISOString()
  });
});
