import { Check, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { NutritionTotals } from '../types/models';
import { formatDisplayDate } from '../utils/date';
import { normalizeNumber } from '../utils/math';

type Props = {
  date: string;
  bmr: number;
  onBmrChange: (value: number) => void;
  intake: NutritionTotals;
  workoutBurn: number;
};

const pixelLetters: Record<string, string[]> = {
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  o: ['00000', '01110', '10001', '10001', '10001', '10001', '01110'],
  n: ['00000', '11110', '10001', '10001', '10001', '10001', '10001'],
  e: ['00000', '01110', '10001', '11111', '10000', '10001', '01110'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  t: ['00100', '00100', '11111', '00100', '00100', '00101', '00010']
};

function PixelLogo() {
  return (
    <div className="pixel-word" aria-label="DoneYet" role="img">
      {'DoneYet'.split('').map((letter, letterIndex) => (
        <div className="pixel-letter" key={`${letter}-${letterIndex}`}>
          {pixelLetters[letter].flatMap((row, rowIndex) =>
            row.split('').map((cell, colIndex) => (
              <span
                className={cell === '1' ? 'pixel-cell on' : 'pixel-cell'}
                key={`${rowIndex}-${colIndex}`}
              />
            ))
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone
}: {
  label: string;
  value: number | string;
  unit?: string;
  tone?: 'positive' | 'negative';
}) {
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

function BmrStat({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const save = () => {
    onChange(normalizeNumber(draft));
    setEditing(false);
  };

  return (
    <div className="stat-card bmr-card">
      <div className="stat-card-head">
        <span>基础代谢</span>
        <button
          type="button"
          className="mini-icon-button"
          onClick={() => {
            if (editing) {
              save();
            } else {
              setDraft(String(value));
              setEditing(true);
            }
          }}
          aria-label={editing ? '保存基础代谢' : '修改基础代谢'}
        >
          {editing ? <Check size={14} /> : <Pencil size={14} />}
        </button>
      </div>
      {editing ? (
        <input
          className="stat-inline-input"
          type="number"
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save();
          }}
        />
      ) : (
        <strong>
          {Math.round(value)}
          <em>kcal</em>
        </strong>
      )}
    </div>
  );
}

export function TopStats({ date, bmr, onBmrChange, intake, workoutBurn }: Props) {
  const balance = Math.round(intake.calories - bmr - workoutBurn);

  return (
    <header className="topbar">
      <div className="brand-panel">
        <PixelLogo />
        <p>{formatDisplayDate(date)}</p>
      </div>
      <div className="stats-grid">
        <BmrStat value={bmr} onChange={onBmrChange} />
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
