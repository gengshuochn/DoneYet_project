import cors from 'cors';
import express from 'express';
import { bodyRecordsRouter } from './routes/bodyRecords.js';
import { calendarRouter } from './routes/calendar.js';
import { healthRouter } from './routes/health.js';
import { mealItemsRouter, mealsRouter } from './routes/meals.js';
import { settingsRouter } from './routes/settings.js';
import { summaryRouter } from './routes/summary.js';
import { workoutItemsRouter, workoutsRouter } from './routes/workouts.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/meals', mealsRouter);
  app.use('/api/meal-items', mealItemsRouter);
  app.use('/api/workouts', workoutsRouter);
  app.use('/api/workout-items', workoutItemsRouter);
  app.use('/api/body-records', bodyRecordsRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/summary', summaryRouter);
  app.use('/api/calendar', calendarRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
