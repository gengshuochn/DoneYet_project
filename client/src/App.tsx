import { useEffect, useMemo, useState } from 'react';
import { DataModule } from './components/DataModule';
import { DietModule } from './components/DietModule';
import { FitnessModule } from './components/FitnessModule';
import { Tabs } from './components/Tabs';
import { TopStats } from './components/TopStats';
import type { BodyRecord, Meal, TabKey, Workout } from './types/models';
import { nowISO, todayISO } from './utils/date';
import { latestBodyRecord, sumMeals, sumWorkoutBurn } from './utils/math';
import './styles.css';

const today = todayISO();

const initialRecords: BodyRecord[] = [
  {
    id: crypto.randomUUID(),
    date: today,
    weight: 76.2,
    chest: 96,
    waist: 83,
    bodyFat: 18.5,
    bmr: 1760,
    createdAt: nowISO(),
    updatedAt: nowISO()
  }
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
  const [records, setRecords] = useState<BodyRecord[]>(() => loadState('doneyet.records', initialRecords));

  useEffect(() => localStorage.setItem('doneyet.meals', JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem('doneyet.workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('doneyet.records', JSON.stringify(records)), [records]);

  const todayMeals = useMemo(() => meals.filter((meal) => meal.date === selectedDate), [meals, selectedDate]);
  const todayWorkouts = useMemo(() => workouts.filter((workout) => workout.date === selectedDate), [workouts, selectedDate]);
  const intake = useMemo(() => sumMeals(todayMeals), [todayMeals]);
  const workoutBurn = useMemo(() => sumWorkoutBurn(todayWorkouts), [todayWorkouts]);
  const bmr = latestBodyRecord(records, selectedDate)?.bmr ?? 0;

  return (
    <main className="app-shell">
      <TopStats date={selectedDate} bmr={bmr} intake={intake} workoutBurn={workoutBurn} />
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
