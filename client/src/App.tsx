import { useEffect, useMemo, useState } from 'react';
import { DataModule } from './components/DataModule';
import { DietModule } from './components/DietModule';
import { FitnessModule } from './components/FitnessModule';
import { Tabs } from './components/Tabs';
import { TopStats } from './components/TopStats';
import { backendApi } from './api/client';
import type { BodyRecord, Meal, TabKey, Workout } from './types/models';
import { todayISO } from './utils/date';
import { sumMeals, sumWorkoutBurn } from './utils/math';
import './styles.css';

const today = todayISO();
const defaultBmr = 1760;

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('diet');
  const [selectedDate, setSelectedDate] = useState(today);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [bmr, setBmr] = useState(defaultBmr);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadPageData() {
      try {
        setIsLoading(true);
        const [nextMeals, nextWorkouts, nextRecords, nextBmr] = await Promise.all([
          backendApi.getMeals(selectedDate),
          backendApi.getWorkouts(selectedDate),
          backendApi.getBodyRecords(),
          backendApi.getBmr()
        ]);

        if (ignore) return;
        setMeals(nextMeals);
        setWorkouts(nextWorkouts);
        setRecords(nextRecords);
        setBmr(nextBmr.bmr);
        setApiError(null);
      } catch (error) {
        if (!ignore) setApiError(error instanceof Error ? error.message : 'API request failed');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadPageData();

    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  const updateBmr = async (value: number) => {
    const response = await backendApi.updateBmr(value);
    setBmr(response.bmr);
  };

  const dayMeals = useMemo(() => meals.filter((meal) => meal.date === selectedDate), [meals, selectedDate]);
  const dayWorkouts = useMemo(() => workouts.filter((workout) => workout.date === selectedDate), [workouts, selectedDate]);
  const intake = useMemo(() => sumMeals(dayMeals), [dayMeals]);
  const workoutBurn = useMemo(() => sumWorkoutBurn(dayWorkouts), [dayWorkouts]);

  return (
    <main className="app-shell">
      <TopStats date={selectedDate} bmr={bmr} onBmrChange={updateBmr} intake={intake} workoutBurn={workoutBurn} />
      {(apiError || isLoading) && (
        <div className={`api-status ${apiError ? 'error' : ''}`}>
          {apiError ?? 'Loading API data...'}
        </div>
      )}
      <div className="toolbar-row">
        <Tabs active={activeTab} onChange={setActiveTab} />
        {activeTab !== 'data' && (
          <label className="date-picker">
            日期
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
        )}
      </div>
      {activeTab === 'diet' && <DietModule date={selectedDate} meals={meals} setMeals={setMeals} />}
      {activeTab === 'fitness' && <FitnessModule date={selectedDate} workouts={workouts} setWorkouts={setWorkouts} />}
      {activeTab === 'data' && <DataModule records={records} setRecords={setRecords} />}
    </main>
  );
}

export default App;
