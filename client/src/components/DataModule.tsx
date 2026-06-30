import { Plus, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BodyMetricType, BodyRecord } from '../types/models';
import { nowISO, todayISO } from '../utils/date';
import { bodyMetricLabels, bodyMetricUnits, makeBodyChartData, normalizeNumber } from '../utils/math';

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
  setRecords
}: {
  records: BodyRecord[];
  setRecords: (records: BodyRecord[]) => void;
}) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const chartData = useMemo(() => makeBodyChartData(records), [records]);

  const openCreateEditor = () => {
    setEditor({ date: todayISO(), type: 'weight', value: '' });
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

    setEditor(null);
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
                dot={{ r: 3 }}
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
    </section>
  );
}
