import type Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);

    CREATE TABLE IF NOT EXISTS meal_items (
      id TEXT PRIMARY KEY,
      meal_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount TEXT NOT NULL DEFAULT '',
      calories REAL NOT NULL DEFAULT 0,
      protein REAL NOT NULL DEFAULT 0,
      carbs REAL NOT NULL DEFAULT 0,
      fat REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON meal_items(meal_id);

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      duration_minutes REAL NOT NULL DEFAULT 0,
      estimated_calories REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);

    CREATE TABLE IF NOT EXISTS workout_items (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL,
      name TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_workout_items_workout_id ON workout_items(workout_id);

    CREATE TABLE IF NOT EXISTS body_records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('weight', 'chest', 'waist', 'bodyFat')),
      value REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (date, type)
    );

    CREATE INDEX IF NOT EXISTS idx_body_records_date ON body_records(date);
    CREATE INDEX IF NOT EXISTS idx_body_records_type_date ON body_records(type, date);

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES ('bmr', '1760', ?)
    ON CONFLICT(key) DO NOTHING
  `).run(now);
}
