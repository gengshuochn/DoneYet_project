import { Ban, CheckCircle2, ChevronLeft, ChevronRight, CircleDotDashed, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BodyMetricType, BodyRecord, Meal, Workout } from '../types/models';
import { addMonths, getMonthDays, monthKey, nowISO, todayISO } from '../utils/date';
import { bodyMetricLabels, bodyMetricUnits, makeBodyChartData, makeCalendarDay, normalizeNumber } from '../utils/math';

type EditorState = {
  id?: string;
  date: string;
  type: BodyMetricType;
  value: string;
};

type ChartDotPayload = {
  date?: string;
  [key: string]: unknown;
};

type ChartDotProps = {
  cx?: number;
  cy?: number;
  stroke?: string;
  payload?: ChartDotPayload;
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

function makeMonthDate(year: number, month: number) {
  const safeYear = Number.isFinite(year) ? Math.max(1900, Math.min(2100, Math.trunc(year))) : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? Math.max(1, Math.min(12, Math.trunc(month))) : 1;
  return new Date(safeYear, safeMonth - 1, 1).toISOString().slice(0, 10);
}

export function DataModule({
  records,
  setRecords,
  meals,
  workouts,
  bmr
}: {
  records: BodyRecord[];
  setRecords: (records: BodyRecord[]) => void;
  meals: Meal[];
  workouts: Workout[];
  bmr: number;
}) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [calendarDate, setCalendarDate] = useState(todayISO());
  const { days, firstWeekday, year, month } = getMonthDays(calendarDate);
  const [yearDraft, setYearDraft] = useState(String(year));
  const [monthDraft, setMonthDraft] = useState(String(month));
  const chartData = useMemo(() => makeBodyChartData(records), [records]);

  useEffect(() => {
    setYearDraft(String(year));
    setMonthDraft(String(month));
  }, [year, month]);

  const openCreateEditor = () => {
    setEditor({ date: todayISO(), type: 'weight', value: '' });
  };

  const openPointEditor = (type: BodyMetricType, payload: ChartDotPayload) => {
    if (!payload.date || typeof payload[type] !== 'number') return;
    const existing = records.find((record) => record.date === payload.date && record.type === type);
    setEditor({
      id: existing?.id,
      date: payload.date,
      type,
      value: String(payload[type])
    });
  };

  const renderMetricDot = (type: BodyMetricType) => (props: unknown) => {
    const { cx, cy, stroke, payload } = props as ChartDotProps;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#15181d"
        stroke={stroke ?? metricColor(type)}
        strokeWidth={2}
        className="chart-click-dot"
        onClick={() => {
          if (payload) openPointEditor(type, payload);
        }}
      />
    );
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

    setEditor(null);
  };

  const commitCalendarDate = () => {
    setCalendarDate(makeMonthDate(Number(yearDraft), Number(monthDraft)));
  };

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
          <div className="metric-editor-card">
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

      <div className="chart-card body-chart-card">
        <h3>身体指标趋势</h3>
        <ResponsiveContainer width="100%" height={420}>
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
                dot={renderMetricDot(type)}
                activeDot={{
                  r: 7,
                  onClick: (props: unknown) => {
                    const payload = (props as { payload?: ChartDotPayload }).payload;
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
          <div className="calendar-date-editor">
            <span>完成情况</span>
            <input
              aria-label="日历年份"
              className="calendar-inline-input year"
              type="number"
              value={yearDraft}
              onChange={(event) => setYearDraft(event.target.value)}
              onBlur={commitCalendarDate}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
            <span>年</span>
            <input
              aria-label="日历月份"
              className="calendar-inline-input month"
              type="number"
              min="1"
              max="12"
              value={monthDraft}
              onChange={(event) => setMonthDraft(event.target.value)}
              onBlur={commitCalendarDate}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
            <span>月</span>
          </div>
          <div className="calendar-actions">
            <button type="button" className="icon-button" onClick={() => setCalendarDate(addMonths(calendarDate, -1))} aria-label="上个月">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="icon-button" onClick={() => setCalendarDate(todayISO())} aria-label="回到本月">
              <RotateCcw size={17} />
            </button>
            <button type="button" className="icon-button" onClick={() => setCalendarDate(addMonths(calendarDate, 1))} aria-label="下个月">
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
              <div className={`calendar-day ${status.status}`} key={day}>
                <div className="day-head">
                  <strong>{Number(day.slice(-2))}</strong>
                  {status.status === 'complete' ? <CheckCircle2 size={18} /> : status.status === 'partial' ? <CircleDotDashed size={18} /> : <Ban size={18} />}
                </div>
                <span>{status.calorieBalance > 0 ? '+' : ''}{status.calorieBalance} kcal</span>
              </div>
            );
          })}
        </div>
        <div className="calendar-legend">
          <span><CheckCircle2 size={15} />饮食和训练</span>
          <span><CircleDotDashed size={15} />完成一项</span>
          <span><Ban size={15} />未记录</span>
          <span>{monthKey(calendarDate)}</span>
        </div>
      </div>
    </section>
  );
}
