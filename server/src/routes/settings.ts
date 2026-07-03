import { Router } from 'express';
import { getDatabase } from '../db/index.js';
import { badRequest, nowISO, toNumber } from '../utils/http.js';

export const settingsRouter = Router();

function readBmr() {
  const row = getDatabase().prepare("SELECT value FROM app_settings WHERE key = 'bmr'").get() as { value: string } | undefined;
  return toNumber(row?.value, 1760);
}

settingsRouter.get('/bmr', (_req, res) => {
  res.json({ bmr: readBmr() });
});

settingsRouter.patch('/bmr', (req, res) => {
  const bmr = toNumber(req.body.bmr);
  if (bmr <= 0) return badRequest(res, 'bmr must be a positive number');

  getDatabase()
    .prepare(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('bmr', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .run(String(bmr), nowISO());

  res.json({ bmr });
});
