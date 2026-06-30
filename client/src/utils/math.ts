import type { BodyRecord, CalendarDay, Meal, NutritionTotals, Workout } from '../types/models';

export const zeroNutrition: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

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

export function latestBodyRecord(records: BodyRecord[], date?: string) {
  return [...records]
    .filter((record) => !date || record.date <= date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function makeCalendarDay(date: string, meals: Meal[], workouts: Workout[], records: BodyRecord[]): CalendarDay {
  const dayMeals = meals.filter((meal) => meal.date === date);
  const dayWorkouts = workouts.filter((workout) => workout.date === date);
  const intake = sumMeals(dayMeals);
  const exerciseCalories = sumWorkoutBurn(dayWorkouts);
  const bmr = latestBodyRecord(records, date)?.bmr ?? 0;
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
