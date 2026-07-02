import { Ban, CheckCircle2, ChevronLeft, ChevronRight, CircleDotDashed, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BodyMetricType, BodyRecord, Meal, Workout } from '../types/models';
import { addMonths, getMonthDays, monthKey, nowISO, todayISO } from '../utils/date';
import { bodyMetricLabels, bodyMetricUnits, makeCalendarDay, normalizeNumber } from '../utils/math';

type EditorState = {
  id?: string;
  date: string;
  type: BodyMetricType;
  value: string;
};

type ChartPoint = {
  id: string;
  date: string;
  value: number;
};

type DateDraft = {
  yy: string;
  month: string;
  day: string;
};

type HoverPoint = {
  point: ChartPoint;
  x: number;
  y: number;
};

const metricOptions: BodyMetricType[] = ['weight', 'bodyFat', 'waist', 'chest'];

function metricColor(type: BodyMetricType) {
  return {
    weight: '#7c8cff',
    chest: '#42d392',
    waist: '#4da3ff',
    bodyFat: '#ffb86b'
  }[type];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function makeMonthDate(year: number, month: number) {
  const safeYear = Number.isFinite(year) ? clamp(Math.trunc(year), 1900, 2100) : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? clamp(Math.trunc(month), 1, 12) : 1;
  return new Date(safeYear, safeMonth - 1, 1).toISOString().slice(0, 10);
}

function dateToDraft(dateISO: string): DateDraft {
  const [year, month, day] = dateISO.split('-').map(Number);
  return {
    yy: pad2(year % 100),
    month: pad2(month),
    day: pad2(day)
  };
}

function draftToDate(draft: DateDraft) {
  const yy = clamp(Math.trunc(Number(draft.yy)), 1, 99);
  const month = clamp(Math.trunc(Number(draft.month)), 1, 12);
  const lastDay = new Date(2000 + yy, month, 0).getDate();
  const day = clamp(Math.trunc(Number(draft.day)), 1, lastDay);
  return `${2000 + yy}-${pad2(month)}-${pad2(day)}`;
}

function shiftDays(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function minRecordDate(records: BodyRecord[]) {
  return records.length > 0
    ? records.map((record) => record.date).sort((a, b) => a.localeCompare(b))[0]
    : undefined;
}

function maxRecordDate(records: BodyRecord[]) {
  return records.length > 0
    ? records.map((record) => record.date).sort((a, b) => b.localeCompare(a))[0]
    : undefined;
}

function formatShortDate(dateISO: string) {
  return dateISO.slice(2).replace(/-/g, '/');
}

function axisDomain(records: BodyRecord[], type: BodyMetricType): [number, number] {
  const values = records
    .filter((record) => record.type === type && record.value > 0)
    .map((record) => record.value);

  if (values.length === 0) return [1, 10];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [Math.max(1, Math.floor(min - 1)), Math.ceil(max + 1)];
  }

  return [Math.max(1, Math.floor(min)), Math.ceil(max)];
}

function DateRangePicker({
  label,
  value,
  onCommit
}: {
  label: string;
  value: string;
  onCommit: (nextDate: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateDraft>(() => dateToDraft(value));

  const commit = () => {
    const nextDate = draftToDate(draft);
    onCommit(nextDate);
    setDraft(dateToDraft(nextDate));
    setOpen(false);
  };

  return (
    <div
      className="range-date-control"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) commit();
      }}
    >
      <span>{label}</span>
      <button
        type="button"
        className="date-chip"
        onClick={() => {
          setDraft(dateToDraft(value));
          setOpen(true);
        }}
      >
        {formatShortDate(value)}
      </button>
      {open && (
        <div className="date-popover">
          <input
            autoFocus
            aria-label={`${label}年份`}
            type="number"
            min="1"
            max="99"
            value={draft.yy}
            onChange={(event) => setDraft({ ...draft, yy: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span>年</span>
          <input
            aria-label={`${label}月份`}
            type="number"
            min="1"
            max="12"
            value={draft.month}
            onChange={(event) => setDraft({ ...draft, month: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span>月</span>
          <input
            aria-label={`${label}日期`}
            type="number"
            min="1"
            value={draft.day}
            onChange={(event) => setDraft({ ...draft, day: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span>日</span>
        </div>
      )}
    </div>
  );
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
  const today = todayISO();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<BodyMetricType>('weight');
  const [hoverPoint, setHoverPoint] = useState<HoverPoint | null>(null);
  const [rangeStart, setRangeStart] = useState(() => minRecordDate(records) ?? shiftDays(today, -180));
  const [rangeEnd, setRangeEnd] = useState(() => maxRecordDate(records) ?? today);
  const [calendarDate, setCalendarDate] = useState(today);
  const [calendarEditor, setCalendarEditor] = useState<'year' | 'month' | null>(null);
  const { days, firstWeekday, year, month } = getMonthDays(calendarDate);
  const [yearDraft, setYearDraft] = useState(String(year));
  const [monthDraft, setMonthDraft] = useState(String(month));

  const chartData = useMemo<ChartPoint[]>(() => {
    return records
      .filter((record) => record.type === selectedMetric && record.date >= rangeStart && record.date <= rangeEnd)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((record) => ({ id: record.id, date: record.date, value: record.value }));
  }, [records, selectedMetric, rangeStart, rangeEnd]);

  const yDomain = useMemo(() => axisDomain(records, selectedMetric), [records, selectedMetric]);
  const lastChartPointId = chartData.length > 0 ? chartData[chartData.length - 1].id : undefined;

  const openCreateEditor = () => {
    setEditor({ date: todayISO(), type: selectedMetric, value: '' });
  };

  const openPointEditor = (payload?: Partial<ChartPoint>) => {
    if (!payload?.id) return;
    const existing = records.find((record) => record.id === payload.id);
    if (!existing) return;

    setEditor({
      id: existing.id,
      date: existing.date,
      type: existing.type,
      value: String(existing.value)
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

    if (editor.date < rangeStart) setRangeStart(editor.date);
    if (editor.date > rangeEnd) setRangeEnd(editor.date);
    setHoverPoint(null);
    setSelectedMetric(editor.type);
    setEditor(null);
  };

  const commitCalendarDate = () => {
    const parsedYear = Number(yearDraft);
    const parsedMonth = Number(monthDraft);

    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth) || parsedYear < 1 || parsedMonth < 1 || parsedMonth > 12) {
      setYearDraft(String(year));
      setMonthDraft(String(month));
      setCalendarEditor(null);
      return;
    }

    const nextDate = makeMonthDate(parsedYear, parsedMonth);
    const next = getMonthDays(nextDate);
    setCalendarDate(nextDate);
    setYearDraft(String(next.year));
    setMonthDraft(String(next.month));
    setCalendarEditor(null);
  };

  const openCalendarEditor = (type: 'year' | 'month') => {
    setYearDraft(String(year));
    setMonthDraft(String(month));
    setCalendarEditor(type);
  };

  const commitRangeStart = (nextDate: string) => {
    if (nextDate > rangeEnd) {
      setRangeStart(nextDate);
      setRangeEnd(nextDate);
    } else {
      setRangeStart(nextDate);
    }
  };

  const commitRangeEnd = (nextDate: string) => {
    if (nextDate < rangeStart) {
      setRangeStart(nextDate);
      setRangeEnd(nextDate);
    } else {
      setRangeEnd(nextDate);
    }
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
        <div className="chart-toolbar">
          <div>
            <h3>{bodyMetricLabels[selectedMetric]}趋势</h3>
            <p>{bodyMetricLabels[selectedMetric]} · {bodyMetricUnits[selectedMetric]}</p>
          </div>
          <div className="metric-tabs">
            {metricOptions.map((type) => (
              <button
                type="button"
                key={type}
                className={selectedMetric === type ? 'active' : ''}
                onClick={() => setSelectedMetric(type)}
              >
                {bodyMetricLabels[type]}
              </button>
            ))}
          </div>
          <div className="range-controls">
            <DateRangePicker label="起始" value={rangeStart} onCommit={commitRangeStart} />
            <DateRangePicker label="终止" value={rangeEnd} onCommit={commitRangeEnd} />
          </div>
        </div>
        <div className="chart-stage">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart key={`${selectedMetric}-${rangeStart}-${rangeEnd}-${chartData.length}`} data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              angle={-35}
              textAnchor="end"
              height={68}
              stroke="rgba(255,255,255,.45)"
            />
            <YAxis domain={yDomain} allowDataOverflow={false} stroke="rgba(255,255,255,.45)" />
            <Tooltip
              cursor={{ stroke: 'rgba(124, 140, 255, .24)', strokeWidth: 1 }}
              content={() => null}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={bodyMetricLabels[selectedMetric]}
              stroke={metricColor(selectedMetric)}
              strokeWidth={2}
              dot={(props: unknown) => {
                const { cx, cy, stroke, payload } = props as { cx?: number; cy?: number; stroke?: string; payload?: ChartPoint };
                if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#15181d"
                    stroke={stroke ?? metricColor(selectedMetric)}
                    strokeWidth={2}
                    className="chart-click-dot"
                    onMouseEnter={() => {
                      if (payload) setHoverPoint({ point: payload, x: cx, y: cy });
                    }}
                  />
                );
              }}
              activeDot={(props: unknown) => {
                const { cx, cy, stroke, payload } = props as { cx?: number; cy?: number; stroke?: string; payload?: ChartPoint };
                if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill="#15181d"
                    stroke={stroke ?? metricColor(selectedMetric)}
                    strokeWidth={2}
                    className="chart-click-dot"
                    onMouseEnter={() => {
                      if (payload) setHoverPoint({ point: payload, x: cx, y: cy });
                    }}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        {hoverPoint && (
          <button
            type="button"
            className={`point-floating-card ${hoverPoint.point.id === lastChartPointId ? 'left' : 'right'} ${hoverPoint.y > 250 ? 'up' : 'down'}`}
            style={{ left: hoverPoint.x, top: hoverPoint.y }}
            onClick={() => openPointEditor(hoverPoint.point)}
          >
            <span>{formatShortDate(hoverPoint.point.date)}</span>
            <strong>{hoverPoint.point.value} {bodyMetricUnits[selectedMetric]}</strong>
            <em>点击修改</em>
          </button>
        )}
        </div>
      </div>

      <div className="calendar-card">
        <div className="calendar-title">
          <div className="calendar-date-editor">
            <span>完成情况</span>
            <div
              className="calendar-edit-wrap"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) commitCalendarDate();
              }}
            >
              <button type="button" className="calendar-value-card" onClick={() => openCalendarEditor('year')}>
                {year}
              </button>
              {calendarEditor === 'year' && (
                <input
                  autoFocus
                  className="calendar-popup-input"
                  type="number"
                  min="1"
                  max="9999"
                  value={yearDraft}
                  onChange={(event) => setYearDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur();
                  }}
                />
              )}
            </div>
            <span>年</span>
            <div
              className="calendar-edit-wrap"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) commitCalendarDate();
              }}
            >
              <button type="button" className="calendar-value-card" onClick={() => openCalendarEditor('month')}>
                {month}
              </button>
              {calendarEditor === 'month' && (
                <input
                  autoFocus
                  className="calendar-popup-input month"
                  type="number"
                  min="1"
                  max="12"
                  value={monthDraft}
                  onChange={(event) => setMonthDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur();
                  }}
                />
              )}
            </div>
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
