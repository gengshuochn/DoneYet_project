export type Id = string;

export type TabKey = 'diet' | 'fitness' | 'data';

export type MealItem = {
  id: Id;
  mealId: Id;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  updatedAt: string;
};

export type Meal = {
  id: Id;
  date: string;
  title: string;
  items: MealItem[];
  createdAt: string;
  updatedAt: string;
};

export type WorkoutItem = {
  id: Id;
  workoutId: Id;
  name: string;
  detail: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Workout = {
  id: Id;
  date: string;
  title: string;
  durationMinutes: number;
  estimatedCalories: number;
  items: WorkoutItem[];
  createdAt: string;
  updatedAt: string;
};

export type BodyRecord = {
  id: Id;
  date: string;
  weight: number;
  chest: number;
  waist: number;
  bodyFat: number;
  bmr: number;
  createdAt: string;
  updatedAt: string;
};

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailySummary = NutritionTotals & {
  date: string;
  bmr: number;
  exerciseCalories: number;
  calorieBalance: number;
};

export type CalendarDay = {
  date: string;
  calorieBalance: number;
  hasDiet: boolean;
  hasWorkout: boolean;
  status: 'complete' | 'partial' | 'missed';
};
