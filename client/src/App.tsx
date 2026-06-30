import { useEffect, useMemo, useState } from 'react';
import { DataModule } from './components/DataModule';
import { DietModule } from './components/DietModule';
import { FitnessModule } from './components/FitnessModule';
import { Tabs } from './components/Tabs';
import { TopStats } from './components/TopStats';
import type { BodyRecord, Meal, TabKey, Workout } from './types/models';
import { nowISO, todayISO } from './utils/date';
import { sumMeals, sumWorkoutBurn } from './utils/math';
import './styles.css';

const today = todayISO();
const defaultBmr = 1760;

const initialRecords: BodyRecord[] = [
  { id: crypto.randomUUID(), date: today, type: 'weight', value: 76.2, createdAt: nowISO(), updatedAt: nowISO() },
  { id: crypto.randomUUID(), date: today, type: 'chest', value: 96, createdAt: nowISO(), updatedAt: nowISO() },
  { id: crypto.randomUUID(), date: today, type: 'waist', value: 83, createdAt: nowISO(), updatedAt: nowISO() },
  { id: crypto.randomUUID(), date: today, type: 'bodyFat', value: 18.5, createdAt: nowISO(), updatedAt: nowISO() }
];

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('diet');
  const [selectedDate, setSelectedDate] = useState(today);
  const [meals, setMeals] = useState<Meal[]>(() => loadState('doneyet.meals', []));
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadState('doneyet.workouts', []));
  const [records, setRecords] = useState<BodyRecord[]>(() => loadState('doneyet.records.v2', initialRecords));
  const [bmr, setBmr] = useState(() => loadState('doneyet.bmr', defaultBmr));

  useEffect(() => localStorage.setItem('doneyet.meals', JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem('doneyet.workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('doneyet.records.v2', JSON.stringify(records)), [records]);
  useEffect(() => localStorage.setItem('doneyet.bmr', JSON.stringify(bmr)), [bmr]);

  const todayMeals = useMemo(() => meals.filter((meal) => meal.date === selectedDate), [meals, selectedDate]);
  const todayWorkouts = useMemo(() => workouts.filter((workout) => workout.date === selectedDate), [workouts, selectedDate]);
  const intake = useMemo(() => sumMeals(todayMeals), [todayMeals]);
  const workoutBurn = useMemo(() => sumWorkoutBurn(todayWorkouts), [todayWorkouts]);

  return (
    <main className="app-shell">
      <TopStats date={selectedDate} bmr={bmr} onBmrChange={setBmr} intake={intake} workoutBurn={workoutBurn} />
      <div className="toolbar-row">
        <Tabs active={activeTab} onChange={setActiveTab} />
        <label className="date-picker">
          日期
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
      </div>
      {activeTab === 'diet' && <DietModule date={selectedDate} meals={meals} setMeals={setMeals} />}
      {activeTab === 'fitness' && <FitnessModule date={selectedDate} workouts={workouts} setWorkouts={setWorkouts} />}
      {activeTab === 'data' && (
        <DataModule
          date={selectedDate}
          setDate={setSelectedDate}
          bmr={bmr}
          records={records}
          setRecords={setRecords}
          meals={meals}
          workouts={workouts}
        />
      )}
    </main>
  );
}

export default App;
