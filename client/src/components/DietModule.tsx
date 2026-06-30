import { Plus, Trash2 } from 'lucide-react';
import type { Meal, MealItem } from '../types/models';
import { nowISO } from '../utils/date';
import { normalizeNumber, sumMealItems } from '../utils/math';

const numberFields: Array<{ key: keyof Pick<MealItem, 'calories' | 'protein' | 'carbs' | 'fat'>; label: string }> = [
  { key: 'calories', label: '热量' },
  { key: 'protein', label: '蛋白' },
  { key: 'carbs', label: '碳水' },
  { key: 'fat', label: '脂肪' }
];

function stamp<T extends object>(value: T): T & { updatedAt: string } {
  return { ...value, updatedAt: nowISO() };
}

export function DietModule({ meals, setMeals, date }: { meals: Meal[]; setMeals: (meals: Meal[]) => void; date: string }) {
  const dayMeals = meals.filter((meal) => meal.date === date);

  const addMeal = () => {
    const timestamp = nowISO();
    setMeals([
      ...meals,
      {
        id: crypto.randomUUID(),
        date,
        title: '新饮食条目',
        items: [],
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]);
  };

  const updateMeal = (meal: Meal) => setMeals(meals.map((item) => (item.id === meal.id ? stamp(meal) : item)));
  const removeMeal = (id: string) => {
    if (window.confirm('删除这张饮食卡片？')) {
      setMeals(meals.filter((meal) => meal.id !== id));
    }
  };

  const addFood = (meal: Meal) => {
    const timestamp = nowISO();
    updateMeal({
      ...meal,
      items: [
        ...meal.items,
        {
          id: crypto.randomUUID(),
          mealId: meal.id,
          name: '',
          amount: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ]
    });
  };

  const updateFood = (meal: Meal, food: MealItem) => {
    updateMeal({ ...meal, items: meal.items.map((item) => (item.id === food.id ? stamp(food) : item)) });
  };

  const removeFood = (meal: Meal, foodId: string) => {
    updateMeal({ ...meal, items: meal.items.filter((food) => food.id !== foodId) });
  };

  return (
    <section className="module">
      <div className="section-title">
        <div>
          <p>DIET</p>
          <h2>饮食记录</h2>
        </div>
        <button type="button" className="primary" onClick={addMeal}>
          <Plus size={18} />
          新增饮食
        </button>
      </div>

      {dayMeals.length === 0 && <div className="empty-state">今天还没有饮食记录。</div>}

      <div className="card-list">
        {dayMeals.map((meal) => {
          const total = sumMealItems(meal.items);
          return (
            <article className="record-card" key={meal.id}>
              <div className="card-head">
                <input
                  className="title-input"
                  value={meal.title}
                  onChange={(event) => updateMeal({ ...meal, title: event.target.value || '新饮食条目' })}
                />
                <button type="button" className="icon-button danger" onClick={() => removeMeal(meal.id)} aria-label="删除饮食">
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="food-grid header">
                <span>名称</span>
                <span>数量</span>
                {numberFields.map((field) => (
                  <span key={field.key}>{field.label}</span>
                ))}
                <span />
              </div>

              {meal.items.map((food) => (
                <div className="food-grid" key={food.id}>
                  <input placeholder="鸡胸肉" value={food.name} onChange={(event) => updateFood(meal, { ...food, name: event.target.value })} />
                  <input placeholder="150g" value={food.amount} onChange={(event) => updateFood(meal, { ...food, amount: event.target.value })} />
                  {numberFields.map((field) => (
                    <input
                      key={field.key}
                      type="number"
                      min="0"
                      value={food[field.key]}
                      onChange={(event) => updateFood(meal, { ...food, [field.key]: normalizeNumber(event.target.value) })}
                    />
                  ))}
                  <button type="button" className="icon-button danger" onClick={() => removeFood(meal, food.id)} aria-label="删除食物">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="card-actions">
                <button type="button" className="secondary" onClick={() => addFood(meal)}>
                  <Plus size={16} />
                  添加食物
                </button>
              </div>

              <div className="mini-stats">
                <span>{Math.round(total.calories)} kcal</span>
                <span>P {Math.round(total.protein)}g</span>
                <span>C {Math.round(total.carbs)}g</span>
                <span>F {Math.round(total.fat)}g</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
