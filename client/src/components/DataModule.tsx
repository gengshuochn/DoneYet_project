import { Ban, CheckCircle2, ChevronLeft, ChevronRight, CircleDotDashed, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BodyRecord, Meal, Workout } from '../types/models';
import { addMonths, getMonthDays, monthKey, nowISO, todayISO } from '../utils/date';
import { latestBodyRecord, makeCalendarDay, normalizeNumber } from '../utils/math';

function stamp<T extends object>(value: T): T & { updatedAt: string } {
  return { ...value, updatedAt: nowISO() };
}

export function DataModule({
  records,
  setRecords,
  meals,
  workouts,
  date,
  setDate
}: {
  records: BodyRecord[];
  setRecords: (records: BodyRecord[]) => void;
  meals: Meal[];
  workouts: Workout[];
  date: string;
  setDate: (date: string) => void;
}) {
  const latest = latestBodyRecord(records);
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const { days, firstWeekday, year, month } = getMonthDays(date);

  const addRecord = () => {
    const timestamp = nowISO();
    setRecords([
      ...records,
      {
        id: crypto.randomUUID(),
        date,
        weight: latest?.weight ?? 75,
        chest: latest?.chest ?? 95,
        waist: latest?.waist ?? 80,
        bodyFat: latest?.bodyFat ?? 18,
        bmr: latest?.bmr ?? 1700,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]);
  };

  const updateRecord = (record: BodyRecord) => setRecords(records.map((item) => (item.id === record.id ? stamp(record) : item)));
  const deleteRecord = (id: string) => {
    if (window.confirm('删除这条身体数据？')) {
      setRecords(records.filter((record) => record.id !== id));
    }
  };

  return (
    <section className="module data-module">
      <div className="section-title">
        <div>
          <p>DATA</p>
          <h2>身体数据</h2>
        </div>
        <button type="button" className="primary" onClick={addRecord}>
          <Plus size={18} />
          添加数据
        </button>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <span>当前体脂率</span>
          <strong>{latest ? `${latest.bodyFat}%` : '-'}</strong>
        </div>
        <div className="summary-card">
          <span>当前基础代谢</span>
          <strong>{latest ? `${latest.bmr} kcal` : '-'}</strong>
        </div>
      </div>

      <div className="chart-card">
        <h3>体重 / 胸围 / 腰围趋势</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={sortedRecords} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,.45)" />
            <YAxis stroke="rgba(255,255,255,.45)" />
            <Tooltip contentStyle={{ background: '#11151c', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
            <Line type="monotone" dataKey="weight" name="体重" stroke="#7c8cff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="chest" name="胸围" stroke="#42d392" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="waist" name="腰围" stroke="#4da3ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="records-table">
        {records.map((record) => (
          <div className="body-grid" key={record.id}>
            <label>
              日期
              <input type="date" value={record.date} onChange={(event) => updateRecord({ ...record, date: event.target.value })} />
            </label>
            <label>
              体重 kg
              <input type="number" value={record.weight} onChange={(event) => updateRecord({ ...record, weight: normalizeNumber(event.target.value) })} />
            </label>
            <label>
              胸围 cm
              <input type="number" value={record.chest} onChange={(event) => updateRecord({ ...record, chest: normalizeNumber(event.target.value) })} />
            </label>
            <label>
              腰围 cm
              <input type="number" value={record.waist} onChange={(event) => updateRecord({ ...record, waist: normalizeNumber(event.target.value) })} />
            </label>
            <label>
              体脂率 %
              <input type="number" value={record.bodyFat} onChange={(event) => updateRecord({ ...record, bodyFat: normalizeNumber(event.target.value) })} />
            </label>
            <label>
              BMR kcal
              <input type="number" value={record.bmr} onChange={(event) => updateRecord({ ...record, bmr: normalizeNumber(event.target.value) })} />
            </label>
            <button type="button" className="icon-button danger" onClick={() => deleteRecord(record.id)} aria-label="删除身体数据">
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="calendar-card">
        <div className="calendar-title">
          <h3>{year} 年 {month} 月完成日历</h3>
          <div className="calendar-actions">
            <button type="button" className="icon-button" onClick={() => setDate(addMonths(date, -1))} aria-label="上个月">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="icon-button" onClick={() => setDate(todayISO())} aria-label="回到本月">
              <RotateCcw size={17} />
            </button>
            <button type="button" className="icon-button" onClick={() => setDate(addMonths(date, 1))} aria-label="下个月">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="calendar-weekdays">
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div className="calendar-grid">
          {Array.from({ length: firstWeekday }).map((_, index) => <div key={`blank-${index}`} />)}
          {days.map((day) => {
            const status = makeCalendarDay(day, meals, workouts, records);
            return (
              <button type="button" className={`calendar-day ${status.status} ${day === date ? 'selected' : ''}`} key={day} onClick={() => setDate(day)}>
                <div className="day-head">
                  <strong>{Number(day.slice(-2))}</strong>
                  {status.status === 'complete' ? <CheckCircle2 size={18} /> : status.status === 'partial' ? <CircleDotDashed size={18} /> : <Ban size={18} />}
                </div>
                <span>{status.calorieBalance > 0 ? '+' : ''}{status.calorieBalance} kcal</span>
              </button>
            );
          })}
        </div>
        <div className="calendar-legend">
          <span><CheckCircle2 size={15} />饮食和训练</span>
          <span><CircleDotDashed size={15} />完成一项</span>
          <span><Ban size={15} />未记录</span>
          <span>{monthKey(date)}</span>
        </div>
      </div>
    </section>
  );
}
