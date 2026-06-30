import { Ban, CheckCircle2, ChevronLeft, ChevronRight, CircleDotDashed, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BodyMetricType, BodyRecord, Meal, Workout } from '../types/models';
import { addMonths, getMonthDays, monthKey, nowISO, todayISO } from '../utils/date';
import { bodyMetricLabels, bodyMetricUnits, latestMetric, makeBodyChartData, makeCalendarDay, normalizeNumber } from '../utils/math';

type EditorState = {
  id?: string;
  date: string;
  type: BodyMetricType;
  value: string;
};

const metricOptions: BodyMetricType[] = ['weight', 'chest', 'waist', 'bodyFat'];

function metricColor(type: BodyMetricType) {
  return {
    weight: '#7c8cff',
    chest: '#42d392',
    waist: '#4da3ff',
    bodyFat: '#ffb86b'
  }[type];
}

export function DataModule({
  records,
  setRecords,
  meals,
  workouts,
  date,
  setDate,
  bmr
}: {
  records: BodyRecord[];
  setRecords: (records: BodyRecord[]) => void;
  meals: Meal[];
  workouts: Workout[];
  date: string;
  setDate: (date: string) => void;
  bmr: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const chartData = useMemo(() => makeBodyChartData(records), [records]);
  const { days, firstWeekday, year, month } = getMonthDays(date);

  const openCreateEditor = () => {
    setEditor({ date, type: 'weight', value: '' });
  };

  const openPointEditor = (type: BodyMetricType, payload: { date?: string; [key: string]: unknown }) => {
    if (!payload.date || typeof payload[type] !== 'number') return;
    const existing = records.find((record) => record.date === payload.date && record.type === type);
    setEditor({
      id: existing?.id,
      date: payload.date,
      type,
      value: String(payload[type])
    });
  };

  const saveEditor = () => {
    if (!editor) return;
    const value = normalizeNumber(editor.value);
    const timestamp = nowISO();

    if (editor.id) {
      setRecords(
        records.map((record) =>
          record.id === editor.id
            ? { ...record, date: editor.date, type: editor.type, value, updatedAt: timestamp }
            : record
        )
      );
    } else {
      const existing = records.find((record) => record.date === editor.date && record.type === editor.type);
      if (existing) {
        setRecords(records.map((record) => (record.id === existing.id ? { ...record, value, updatedAt: timestamp } : record)));
      } else {
        setRecords([
          ...records,
          {
            id: crypto.randomUUID(),
            date: editor.date,
            type: editor.type,
            value,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ]);
      }
    }

    setDate(editor.date);
    setEditor(null);
  };

  const latestValues = metricOptions.map((type) => {
    const record = latestMetric(records, type, date);
    return { type, value: record?.value };
  });

  return (
    <section className="module data-module">
      <div className="section-title">
        <div>
          <p>DATA</p>
          <h2>身体数据</h2>
        </div>
        <button type="button" className="primary" onClick={openCreateEditor}>
          <Plus size={18} />
          添加数据
        </button>
      </div>

      {editor && (
        <div
          className="metric-editor-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) saveEditor();
          }}
        >
          <div className="metric-editor-card" ref={editorRef}>
            <div className="editor-head">
              <h3>{editor.id ? '修改身体数据' : '添加身体数据'}</h3>
              <button type="button" className="icon-button" onClick={() => setEditor(null)} aria-label="关闭编辑卡片">
                <X size={17} />
              </button>
            </div>
            <div className="editor-grid">
              <label>
                时间
                <input type="date" value={editor.date} onChange={(event) => setEditor({ ...editor, date: event.target.value })} />
              </label>
              <label>
                类型
                <select value={editor.type} onChange={(event) => setEditor({ ...editor, type: event.target.value as BodyMetricType })}>
                  {metricOptions.map((type) => (
                    <option key={type} value={type}>
                      {bodyMetricLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                数值
                <input
                  type="number"
                  autoFocus
                  value={editor.value}
                  placeholder={bodyMetricUnits[editor.type]}
                  onChange={(event) => setEditor({ ...editor, value: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') saveEditor();
                  }}
                />
              </label>
            </div>
            <div className="editor-actions">
              <button type="button" className="primary" onClick={saveEditor}>
                <Save size={17} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="summary-row four">
        {latestValues.map((item) => (
          <div className="summary-card" key={item.type}>
            <span>{bodyMetricLabels[item.type]}</span>
            <strong>{item.value === undefined ? '-' : `${item.value} ${bodyMetricUnits[item.type]}`}</strong>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <h3>身体指标趋势</h3>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,.45)" />
            <YAxis stroke="rgba(255,255,255,.45)" />
            <Tooltip contentStyle={{ background: '#11151c', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
            {metricOptions.map((type) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                name={bodyMetricLabels[type]}
                stroke={metricColor(type)}
                strokeWidth={2}
                connectNulls
                activeDot={{
                  r: 6,
                  onClick: (props: unknown) => {
                    const payload = (props as { payload?: { date?: string; [key: string]: unknown } }).payload;
                    if (payload) openPointEditor(type, payload);
                  }
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
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
            const status = makeCalendarDay(day, meals, workouts, bmr);
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
