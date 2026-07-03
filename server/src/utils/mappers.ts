type MealRow = {
  id: string;
  date: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type MealItemRow = {
  id: string;
  meal_id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  updated_at: string;
};

type WorkoutRow = {
  id: string;
  date: string;
  title: string;
  duration_minutes: number;
  estimated_calories: number;
  created_at: string;
  updated_at: string;
};

type WorkoutItemRow = {
  id: string;
  workout_id: string;
  name: string;
  detail: string;
  note: string;
  created_at: string;
  updated_at: string;
};

type BodyRecordRow = {
  id: string;
  date: string;
  type: 'weight' | 'chest' | 'waist' | 'bodyFat';
  value: number;
  created_at: string;
  updated_at: string;
};

export function mapMealItem(row: MealItemRow) {
  return {
    id: row.id,
    mealId: row.meal_id,
    name: row.name,
    amount: row.amount,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapMeal(row: MealRow, items: MealItemRow[] = []) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    items: items.map(mapMealItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapWorkoutItem(row: WorkoutItemRow) {
  return {
    id: row.id,
    workoutId: row.workout_id,
    name: row.name,
    detail: row.detail,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapWorkout(row: WorkoutRow, items: WorkoutItemRow[] = []) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    durationMinutes: row.duration_minutes,
    estimatedCalories: row.estimated_calories,
    items: items.map(mapWorkoutItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapBodyRecord(row: BodyRecordRow) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    value: row.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
