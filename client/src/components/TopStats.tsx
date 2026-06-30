import type { NutritionTotals } from '../types/models';
import { formatDisplayDate } from '../utils/date';

type Props = {
  date: string;
  bmr: number;
  intake: NutritionTotals;
  workoutBurn: number;
};

function Stat({ label, value, unit, tone }: { label: string; value: number | string; unit?: string; tone?: 'positive' | 'negative' }) {
  return (
    <div className={`stat-card ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>
        {value}
        {unit && <em>{unit}</em>}
      </strong>
    </div>
  );
}

export function TopStats({ date, bmr, intake, workoutBurn }: Props) {
  const balance = Math.round(intake.calories - bmr - workoutBurn);

  return (
    <header className="topbar">
      <div className="brand-panel">
        <div className="logo">DY</div>
        <div>
          <h1>DoneYet</h1>
          <p>{formatDisplayDate(date)}</p>
        </div>
      </div>
      <div className="stats-grid">
        <Stat label="基础代谢" value={Math.round(bmr)} unit="kcal" />
        <Stat label="摄入热量" value={Math.round(intake.calories)} unit="kcal" />
        <Stat label="蛋白质" value={Math.round(intake.protein)} unit="g" />
        <Stat label="碳水" value={Math.round(intake.carbs)} unit="g" />
        <Stat label="脂肪" value={Math.round(intake.fat)} unit="g" />
        <Stat label="运动消耗" value={Math.round(workoutBurn)} unit="kcal" />
        <Stat label={balance >= 0 ? '热量盈余' : '热量缺口'} value={balance >= 0 ? `+${balance}` : balance} unit="kcal" tone={balance > 0 ? 'negative' : 'positive'} />
      </div>
    </header>
  );
}
