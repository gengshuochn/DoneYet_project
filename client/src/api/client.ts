import type { BodyRecord, CalendarDay, DailySummary, Meal, Workout } from '../types/models';

const API_BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const backendApi = {
  getMeals: (date: string) => request<Meal[]>(`/meals?date=${date}`),
  createMeal: (payload: Pick<Meal, 'date' | 'title'>) =>
    request<Meal>('/meals', { method: 'POST', body: JSON.stringify(payload) }),
  updateMeal: (id: string, payload: Partial<Pick<Meal, 'title'>>) =>
    request<Meal>(`/meals/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMeal: (id: string) => request<void>(`/meals/${id}`, { method: 'DELETE' }),
  createMealItem: (mealId: string, payload: Omit<Meal['items'][number], 'id' | 'mealId' | 'createdAt' | 'updatedAt'>) =>
    request<Meal['items'][number]>(`/meals/${mealId}/items`, { method: 'POST', body: JSON.stringify(payload) }),
  updateMealItem: (id: string, payload: Partial<Meal['items'][number]>) =>
    request<Meal['items'][number]>(`/meal-items/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMealItem: (id: string) => request<void>(`/meal-items/${id}`, { method: 'DELETE' }),

  getWorkouts: (date: string) => request<Workout[]>(`/workouts?date=${date}`),
  createWorkout: (payload: Pick<Workout, 'date' | 'title'>) =>
    request<Workout>('/workouts', { method: 'POST', body: JSON.stringify(payload) }),
  updateWorkout: (id: string, payload: Partial<Pick<Workout, 'title' | 'durationMinutes' | 'estimatedCalories'>>) =>
    request<Workout>(`/workouts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteWorkout: (id: string) => request<void>(`/workouts/${id}`, { method: 'DELETE' }),
  createWorkoutItem: (workoutId: string, payload: Omit<Workout['items'][number], 'id' | 'workoutId' | 'createdAt' | 'updatedAt'>) =>
    request<Workout['items'][number]>(`/workouts/${workoutId}/items`, { method: 'POST', body: JSON.stringify(payload) }),
  updateWorkoutItem: (id: string, payload: Partial<Workout['items'][number]>) =>
    request<Workout['items'][number]>(`/workout-items/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteWorkoutItem: (id: string) => request<void>(`/workout-items/${id}`, { method: 'DELETE' }),

  getBodyRecords: () => request<BodyRecord[]>('/body-records'),
  createBodyRecord: (payload: Pick<BodyRecord, 'date' | 'type' | 'value'>) =>
    request<BodyRecord>('/body-records', { method: 'POST', body: JSON.stringify(payload) }),
  updateBodyRecord: (id: string, payload: Partial<Pick<BodyRecord, 'date' | 'type' | 'value'>>) =>
    request<BodyRecord>(`/body-records/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteBodyRecord: (id: string) => request<void>(`/body-records/${id}`, { method: 'DELETE' }),
  getBmr: () => request<{ bmr: number }>('/settings/bmr'),
  updateBmr: (bmr: number) => request<{ bmr: number }>('/settings/bmr', { method: 'PATCH', body: JSON.stringify({ bmr }) }),

  getDailySummary: (date: string) => request<DailySummary>(`/summary/daily?date=${date}`),
  getCalendar: (year: number, month: number) => request<CalendarDay[]>(`/calendar?year=${year}&month=${month}`)
};

export type BackendApi = typeof backendApi;
