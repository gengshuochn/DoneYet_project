import { Router } from 'express';
import { getDatabase } from '../db/index.js';
import { badRequest, toNumber } from '../utils/http.js';

export const summaryRouter = Router();

export function getDailySummary(date: string) {
  const db = getDatabase();
  const nutrition = db
    .prepare(
      `SELECT
        COALESCE(SUM(mi.calories), 0) AS calories,
        COALESCE(SUM(mi.protein), 0) AS protein,
        COALESCE(SUM(mi.carbs), 0) AS carbs,
        COALESCE(SUM(mi.fat), 0) AS fat
       FROM meals m
       LEFT JOIN meal_items mi ON mi.meal_id = m.id
       WHERE m.date = ?`
    )
    .get(date) as { calories: number; protein: number; carbs: number; fat: number };
  const workout = db
    .prepare('SELECT COALESCE(SUM(estimated_calories), 0) AS exerciseCalories FROM workouts WHERE date = ?')
    .get(date) as { exerciseCalories: number };
  const setting = db.prepare("SELECT value FROM app_settings WHERE key = 'bmr'").get() as { value: string } | undefined;
  const bmr = toNumber(setting?.value, 1760);

  return {
    date,
    calories: toNumber(nutrition.calories),
    protein: toNumber(nutrition.protein),
    carbs: toNumber(nutrition.carbs),
    fat: toNumber(nutrition.fat),
    bmr,
    exerciseCalories: toNumber(workout.exerciseCalories),
    calorieBalance: Math.round(toNumber(nutrition.calories) - bmr - toNumber(workout.exerciseCalories))
  };
}

summaryRouter.get('/daily', (req, res) => {
  const date = String(req.query.date ?? '');
  if (!date) return badRequest(res, 'date is required');
  res.json(getDailySummary(date));
});
