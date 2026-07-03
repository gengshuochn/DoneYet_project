import { Router } from 'express';
import { getDatabase } from '../db/index.js';
import { badRequest, conflict, createId, notFound, nowISO, toNumber } from '../utils/http.js';
import { mapBodyRecord } from '../utils/mappers.js';

const bodyTypes = new Set(['weight', 'chest', 'waist', 'bodyFat']);

export const bodyRecordsRouter = Router();

function getBodyRecord(id: string) {
  const row = getDatabase().prepare('SELECT * FROM body_records WHERE id = ?').get(id);
  return row ? mapBodyRecord(row as never) : undefined;
}

bodyRecordsRouter.get('/', (_req, res) => {
  const rows = getDatabase().prepare('SELECT * FROM body_records ORDER BY date ASC, type ASC').all();
  res.json(rows.map((row) => mapBodyRecord(row as never)));
});

bodyRecordsRouter.post('/', (req, res) => {
  const { date, type } = req.body as { date?: string; type?: string };
  if (!date || !type || !bodyTypes.has(type)) return badRequest(res, 'valid date and type are required');

  const db = getDatabase();
  const timestamp = nowISO();
  const id = createId();
  const value = toNumber(req.body.value);

  db.prepare(
    `INSERT INTO body_records (id, date, type, value, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(date, type) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(id, date, type, value, timestamp, timestamp);

  const row = db.prepare('SELECT * FROM body_records WHERE date = ? AND type = ?').get(date, type);
  res.status(201).json(mapBodyRecord(row as never));
});

bodyRecordsRouter.patch('/:id', (req, res) => {
  const db = getDatabase();
  const existing = getBodyRecord(req.params.id);
  if (!existing) return notFound(res);

  const nextDate = typeof req.body.date === 'string' ? req.body.date : existing.date;
  const nextType = typeof req.body.type === 'string' ? req.body.type : existing.type;
  if (!bodyTypes.has(nextType)) return badRequest(res, 'valid type is required');

  const duplicate = db
    .prepare('SELECT id FROM body_records WHERE date = ? AND type = ? AND id <> ?')
    .get(nextDate, nextType, req.params.id);
  if (duplicate) return conflict(res, 'A body record for this date and type already exists');

  db.prepare('UPDATE body_records SET date = ?, type = ?, value = ?, updated_at = ? WHERE id = ?').run(
    nextDate,
    nextType,
    toNumber(req.body.value ?? existing.value),
    nowISO(),
    req.params.id
  );

  res.json(getBodyRecord(req.params.id));
});

bodyRecordsRouter.delete('/:id', (req, res) => {
  const result = getDatabase().prepare('DELETE FROM body_records WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return notFound(res);
  res.status(204).end();
});
