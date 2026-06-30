export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function nowISO() {
  return new Date().toISOString();
}

export function formatDisplayDate(dateISO: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).format(new Date(`${dateISO}T00:00:00`));
}

export function monthKey(dateISO: string) {
  return dateISO.slice(0, 7);
}

export function addMonths(dateISO: string, delta: number) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setMonth(date.getMonth() + delta);
  return date.toISOString().slice(0, 10);
}

export function getMonthDays(baseDateISO: string) {
  const base = new Date(`${baseDateISO}T00:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: string[] = [];

  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(year, month, day).toISOString().slice(0, 10));
  }

  return { days, firstWeekday: first.getDay(), year, month: month + 1 };
}
