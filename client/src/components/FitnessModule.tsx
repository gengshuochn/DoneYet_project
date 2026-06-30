import { Plus, Trash2 } from 'lucide-react';
import type { Workout, WorkoutItem } from '../types/models';
import { nowISO } from '../utils/date';
import { normalizeNumber } from '../utils/math';

function stamp<T extends object>(value: T): T & { updatedAt: string } {
  return { ...value, updatedAt: nowISO() };
}

export function FitnessModule({ workouts, setWorkouts, date }: { workouts: Workout[]; setWorkouts: (items: Workout[]) => void; date: string }) {
  const dayWorkouts = workouts.filter((workout) => workout.date === date);

  const addWorkout = () => {
    const timestamp = nowISO();
    setWorkouts([
      ...workouts,
      {
        id: crypto.randomUUID(),
        date,
        title: '新训练',
        durationMinutes: 60,
        estimatedCalories: 0,
        items: [],
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]);
  };

  const updateWorkout = (workout: Workout) => setWorkouts(workouts.map((item) => (item.id === workout.id ? stamp(workout) : item)));
  const removeWorkout = (id: string) => {
    if (window.confirm('删除这张训练卡片？')) {
      setWorkouts(workouts.filter((workout) => workout.id !== id));
    }
  };

  const addItem = (workout: Workout) => {
    const timestamp = nowISO();
    updateWorkout({
      ...workout,
      items: [
        ...workout.items,
        { id: crypto.randomUUID(), workoutId: workout.id, name: '', detail: '', note: '', createdAt: timestamp, updatedAt: timestamp }
      ]
    });
  };

  const updateItem = (workout: Workout, item: WorkoutItem) => {
    updateWorkout({ ...workout, items: workout.items.map((old) => (old.id === item.id ? stamp(item) : old)) });
  };

  const removeItem = (workout: Workout, id: string) => {
    updateWorkout({ ...workout, items: workout.items.filter((item) => item.id !== id) });
  };

  return (
    <section className="module">
      <div className="section-title">
        <div>
          <p>FITNESS</p>
          <h2>训练记录</h2>
        </div>
        <button type="button" className="primary" onClick={addWorkout}>
          <Plus size={18} />
          新增训练
        </button>
      </div>

      {dayWorkouts.length === 0 && <div className="empty-state">今天还没有训练记录。</div>}

      <div className="card-list">
        {dayWorkouts.map((workout) => (
          <article className="record-card" key={workout.id}>
            <div className="card-head">
              <input
                className="title-input"
                value={workout.title}
                onChange={(event) => updateWorkout({ ...workout, title: event.target.value || '新训练' })}
              />
              <button type="button" className="icon-button danger" onClick={() => removeWorkout(workout.id)} aria-label="删除训练">
                <Trash2 size={17} />
              </button>
            </div>

            <div className="two-grid compact">
              <label>
                训练时长
                <input
                  type="number"
                  min="0"
                  value={workout.durationMinutes}
                  onChange={(event) => updateWorkout({ ...workout, durationMinutes: normalizeNumber(event.target.value) })}
                />
              </label>
              <label>
                热量消耗
                <input
                  type="number"
                  min="0"
                  value={workout.estimatedCalories}
                  onChange={(event) => updateWorkout({ ...workout, estimatedCalories: normalizeNumber(event.target.value) })}
                />
              </label>
            </div>

            <div className="workout-grid header">
              <span>动作名称</span>
              <span>训练详情</span>
              <span>备注</span>
              <span />
            </div>

            {workout.items.map((item) => (
              <div className="workout-grid" key={item.id}>
                <input placeholder="卧推" value={item.name} onChange={(event) => updateItem(workout, { ...item, name: event.target.value })} />
                <input placeholder="60kg x 8 x 4" value={item.detail} onChange={(event) => updateItem(workout, { ...item, detail: event.target.value })} />
                <input placeholder="RPE、状态、疼痛..." value={item.note} onChange={(event) => updateItem(workout, { ...item, note: event.target.value })} />
                <button type="button" className="icon-button danger" onClick={() => removeItem(workout, item.id)} aria-label="删除动作">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div className="card-actions">
              <button type="button" className="secondary" onClick={() => addItem(workout)}>
                <Plus size={16} />
                添加动作
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
