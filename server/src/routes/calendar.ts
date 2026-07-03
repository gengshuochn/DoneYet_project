import { Router } from 'express';
import { getDatabase } from '../db/index.js';
import { badRequest, toNumber } from '../utils/http.js';
import { getDailySummary } from './summary.js';

export const calendarRouter = Router();

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

calendarRouter.get('/', (req, res) => {
  const year = toNumber(req.query.year);
  const month = toNumber(req.query.month);
  if (year < 1 || month < 1 || month > 12) return badRequest(res, 'valid year and month are required');

  const db = getDatabase();
  const lastDay = new Date(year, month, 0).getDate();
  const mealCount = db.prepare('SELECT COUNT(*) AS count FROM meals WHERE date = ?');
  const workoutStatus = db.prepare(
    `SELECT
      COUNT(w.id) AS workoutCount,
      COALESCE(SUM(w.estimated_calories), 0) AS calories,
      COUNT(wi.id) AS itemCount
     FROM workouts w
     LEFT JOIN workout_items wi ON wi.workout_id = w.id
     WHERE w.date = ?`
  );

  const days = Array.from({ length: lastDay }, (_, index) => {
    const date = `${year}-${pad2(month)}-${pad2(index + 1)}`;
    const summary = getDailySummary(date);
    const meals = mealCount.get(date) as { count: number };
    const workouts = workoutStatus.get(date) as { workoutCount: number; calories: number; itemCount: number };
    const hasDiet = meals.count > 0;
    const hasWorkout = workouts.calories > 0 || workouts.itemCount > 0;
    const status = hasDiet && hasWorkout ? 'complete' : hasDiet || hasWorkout ? 'partial' : 'missed';

    return {
      date,
      calorieBalance: summary.calorieBalance,
      hasDiet,
      hasWorkout,
      status
    };
  });

  res.json(days);
});
