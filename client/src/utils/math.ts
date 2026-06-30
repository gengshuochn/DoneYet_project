import type { BodyMetricType, BodyRecord, CalendarDay, Meal, NutritionTotals, Workout } from '../types/models';

export const zeroNutrition: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export const bodyMetricLabels: Record<BodyMetricType, string> = {
  weight: '体重',
  chest: '胸围',
  waist: '腰围',
  bodyFat: '体脂'
};

export const bodyMetricUnits: Record<BodyMetricType, string> = {
  weight: 'kg',
  chest: 'cm',
  waist: 'cm',
  bodyFat: '%'
};

export function normalizeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function sumMealItems(items: Meal['items']): NutritionTotals {
  return items.reduce(
    (sum, item) => ({
      calories: sum.calories + normalizeNumber(item.calories),
      protein: sum.protein + normalizeNumber(item.protein),
      carbs: sum.carbs + normalizeNumber(item.carbs),
      fat: sum.fat + normalizeNumber(item.fat)
    }),
    zeroNutrition
  );
}

export function sumMeals(meals: Meal[]): NutritionTotals {
  return meals.reduce((sum, meal) => {
    const mealTotal = sumMealItems(meal.items);
    return {
      calories: sum.calories + mealTotal.calories,
      protein: sum.protein + mealTotal.protein,
      carbs: sum.carbs + mealTotal.carbs,
      fat: sum.fat + mealTotal.fat
    };
  }, zeroNutrition);
}

export function sumWorkoutBurn(workouts: Workout[]) {
  return workouts.reduce((sum, workout) => sum + normalizeNumber(workout.estimatedCalories), 0);
}

export function latestMetric(records: BodyRecord[], type: BodyMetricType, date?: string) {
  return [...records]
    .filter((record) => record.type === type && (!date || record.date <= date))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function makeBodyChartData(records: BodyRecord[]) {
  const byDate = new Map<string, { date: string; weight?: number; chest?: number; waist?: number; bodyFat?: number }>();

  [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((record) => {
      const entry = byDate.get(record.date) ?? { date: record.date };
      entry[record.type] = record.value;
      byDate.set(record.date, entry);
    });

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function makeCalendarDay(date: string, meals: Meal[], workouts: Workout[], bmr: number): CalendarDay {
  const dayMeals = meals.filter((meal) => meal.date === date);
  const dayWorkouts = workouts.filter((workout) => workout.date === date);
  const intake = sumMeals(dayMeals);
  const exerciseCalories = sumWorkoutBurn(dayWorkouts);
  const hasDiet = dayMeals.length > 0;
  const hasWorkout = dayWorkouts.some((workout) => workout.estimatedCalories > 0 || workout.items.length > 0);
  const status = hasDiet && hasWorkout ? 'complete' : hasDiet || hasWorkout ? 'partial' : 'missed';

  return {
    date,
    calorieBalance: Math.round(intake.calories - bmr - exerciseCalories),
    hasDiet,
    hasWorkout,
    status
  };
}
