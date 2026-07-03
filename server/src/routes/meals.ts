import { Router } from 'express';
import { getDatabase } from '../db/index.js';
import { badRequest, createId, notFound, nowISO, toNumber } from '../utils/http.js';
import { mapMeal, mapMealItem } from '../utils/mappers.js';

export const mealsRouter = Router();
export const mealItemsRouter = Router();

function getMeal(id: string) {
  const db = getDatabase();
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
  if (!meal) return undefined;
  const items = db.prepare('SELECT * FROM meal_items WHERE meal_id = ? ORDER BY created_at ASC').all(id);
  return mapMeal(meal as never, items as never[]);
}

mealsRouter.get('/', (req, res) => {
  const date = String(req.query.date ?? '');
  if (!date) return badRequest(res, 'date is required');

  const db = getDatabase();
  const meals = db.prepare('SELECT * FROM meals WHERE date = ? ORDER BY created_at ASC').all(date);
  const items = db.prepare('SELECT * FROM meal_items WHERE meal_id = ? ORDER BY created_at ASC');

  res.json(meals.map((meal) => mapMeal(meal as never, items.all((meal as { id: string }).id) as never[])));
});

mealsRouter.post('/', (req, res) => {
  const { date, title } = req.body as { date?: string; title?: string };
  if (!date || !title) return badRequest(res, 'date and title are required');

  const db = getDatabase();
  const timestamp = nowISO();
  const id = createId();
  db.prepare('INSERT INTO meals (id, date, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, date, title, timestamp, timestamp);

  res.status(201).json(getMeal(id));
});

mealsRouter.patch('/:id', (req, res) => {
  const existing = getMeal(req.params.id);
  if (!existing) return notFound(res);

  const title = typeof req.body.title === 'string' ? req.body.title : existing.title;
  const timestamp = nowISO();
  getDatabase().prepare('UPDATE meals SET title = ?, updated_at = ? WHERE id = ?').run(title, timestamp, req.params.id);

  res.json(getMeal(req.params.id));
});

mealsRouter.delete('/:id', (req, res) => {
  const result = getDatabase().prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return notFound(res);
  res.status(204).end();
});

mealsRouter.post('/:mealId/items', (req, res) => {
  const meal = getMeal(req.params.mealId);
  if (!meal) return notFound(res, 'Meal not found');

  const { name = '', amount = '', calories = 0, protein = 0, carbs = 0, fat = 0 } = req.body as Record<string, unknown>;
  const timestamp = nowISO();
  const id = createId();
  getDatabase()
    .prepare(
      `INSERT INTO meal_items (id, meal_id, name, amount, calories, protein, carbs, fat, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, req.params.mealId, String(name), String(amount), toNumber(calories), toNumber(protein), toNumber(carbs), toNumber(fat), timestamp, timestamp);

  const item = getDatabase().prepare('SELECT * FROM meal_items WHERE id = ?').get(id);
  res.status(201).json(mapMealItem(item as never));
});

mealItemsRouter.patch('/:id', (req, res) => {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM meal_items WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!existing) return notFound(res);

  const timestamp = nowISO();
  db.prepare(
    `UPDATE meal_items
     SET name = ?, amount = ?, calories = ?, protein = ?, carbs = ?, fat = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    req.body.name ?? existing.name,
    req.body.amount ?? existing.amount,
    toNumber(req.body.calories ?? existing.calories),
    toNumber(req.body.protein ?? existing.protein),
    toNumber(req.body.carbs ?? existing.carbs),
    toNumber(req.body.fat ?? existing.fat),
    timestamp,
    req.params.id
  );

  const item = db.prepare('SELECT * FROM meal_items WHERE id = ?').get(req.params.id);
  res.json(mapMealItem(item as never));
});

mealItemsRouter.delete('/:id', (req, res) => {
  const result = getDatabase().prepare('DELETE FROM meal_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return notFound(res);
  res.status(204).end();
});
