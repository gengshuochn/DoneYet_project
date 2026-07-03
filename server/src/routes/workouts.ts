import { Router } from 'express';
import { getDatabase } from '../db/index.js';
import { badRequest, createId, notFound, nowISO, toNumber } from '../utils/http.js';
import { mapWorkout, mapWorkoutItem } from '../utils/mappers.js';

export const workoutsRouter = Router();
export const workoutItemsRouter = Router();

function getWorkout(id: string) {
  const db = getDatabase();
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
  if (!workout) return undefined;
  const items = db.prepare('SELECT * FROM workout_items WHERE workout_id = ? ORDER BY created_at ASC').all(id);
  return mapWorkout(workout as never, items as never[]);
}

workoutsRouter.get('/', (req, res) => {
  const date = String(req.query.date ?? '');
  if (!date) return badRequest(res, 'date is required');

  const db = getDatabase();
  const workouts = db.prepare('SELECT * FROM workouts WHERE date = ? ORDER BY created_at ASC').all(date);
  const items = db.prepare('SELECT * FROM workout_items WHERE workout_id = ? ORDER BY created_at ASC');

  res.json(workouts.map((workout) => mapWorkout(workout as never, items.all((workout as { id: string }).id) as never[])));
});

workoutsRouter.post('/', (req, res) => {
  const { date, title } = req.body as { date?: string; title?: string };
  if (!date || !title) return badRequest(res, 'date and title are required');

  const db = getDatabase();
  const timestamp = nowISO();
  const id = createId();
  db.prepare(
    `INSERT INTO workouts (id, date, title, duration_minutes, estimated_calories, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, date, title, toNumber(req.body.durationMinutes, 60), toNumber(req.body.estimatedCalories), timestamp, timestamp);

  res.status(201).json(getWorkout(id));
});

workoutsRouter.patch('/:id', (req, res) => {
  const existing = getWorkout(req.params.id);
  if (!existing) return notFound(res);

  const timestamp = nowISO();
  getDatabase()
    .prepare('UPDATE workouts SET title = ?, duration_minutes = ?, estimated_calories = ?, updated_at = ? WHERE id = ?')
    .run(
      req.body.title ?? existing.title,
      toNumber(req.body.durationMinutes ?? existing.durationMinutes),
      toNumber(req.body.estimatedCalories ?? existing.estimatedCalories),
      timestamp,
      req.params.id
    );

  res.json(getWorkout(req.params.id));
});

workoutsRouter.delete('/:id', (req, res) => {
  const result = getDatabase().prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return notFound(res);
  res.status(204).end();
});

workoutsRouter.post('/:workoutId/items', (req, res) => {
  const workout = getWorkout(req.params.workoutId);
  if (!workout) return notFound(res, 'Workout not found');

  const { name = '', detail = '', note = '' } = req.body as Record<string, unknown>;
  const timestamp = nowISO();
  const id = createId();
  getDatabase()
    .prepare(
      `INSERT INTO workout_items (id, workout_id, name, detail, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, req.params.workoutId, String(name), String(detail), String(note), timestamp, timestamp);

  const item = getDatabase().prepare('SELECT * FROM workout_items WHERE id = ?').get(id);
  res.status(201).json(mapWorkoutItem(item as never));
});

workoutItemsRouter.patch('/:id', (req, res) => {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM workout_items WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!existing) return notFound(res);

  const timestamp = nowISO();
  db.prepare(
    `UPDATE workout_items
     SET name = ?, detail = ?, note = ?, updated_at = ?
     WHERE id = ?`
  ).run(req.body.name ?? existing.name, req.body.detail ?? existing.detail, req.body.note ?? existing.note, timestamp, req.params.id);

  const item = db.prepare('SELECT * FROM workout_items WHERE id = ?').get(req.params.id);
  res.json(mapWorkoutItem(item as never));
});

workoutItemsRouter.delete('/:id', (req, res) => {
  const result = getDatabase().prepare('DELETE FROM workout_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return notFound(res);
  res.status(204).end();
});
