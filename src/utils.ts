import { WagePeriod } from './types';

export function getISOWeek(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export function calculateHours(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(`2000-01-01T${start}`);
  let e = new Date(`2000-01-01T${end}`);
  if (e < s) e.setDate(e.getDate() + 1);
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60);
}

export function calculateOT(act: number, type: string) {
  if (!act || type === 'unknown') return act || 0;
  // Based on IATSE bounds:
  // <= 8: 1x
  // >8 to 12: 1.5x (max 4 hrs = 6)
  // >12 to 15: 2x (max 3 hrs = 6)
  // > 15: 3x
  let earned = act <= 8 ? act : act <= 12 ? 8 + (act - 8) * 1.5 : act <= 15 ? 8 + 6 + (act - 12) * 2 : 8 + 6 + 6 + (act - 15) * 3;
  const min = type === '8hr' ? 8 : type === '10hr' ? 11 : type === '12hr' ? 14 : 0;
  return Math.max(earned, min);
}

export function formatCurr(n: number | string) {
  const val = typeof n === 'string' ? parseFloat(n) : n;
  return isNaN(val) ? '$0.00' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function getWeekKey(d: string) {
  const date = new Date(d + 'T12:00:00');
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

export function getWeekDateRange(wKey: string) {
  const start = new Date(wKey + 'T12:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', fmt)} - ${end.toLocaleDateString('en-US', fmt)}, ${end.getFullYear()}`;
}

export const parseDates = (dateStr: string) => {
  if (!dateStr || dateStr.includes('TBA')) return { start: new Date(8640000000000000), end: new Date(8640000000000000) };
  const parts = dateStr.split(' to ');
  return { start: new Date(parts[0]), end: new Date(parts[1] || parts[0]) };
};

export function parseCSVLine(text: string) {
  let res = [], q = false, cur = "";
  for (let char of text) {
    if (char === '"') q = !q;
    else if (char === ',' && !q) { res.push(cur); cur = ""; }
    else cur += char;
  }
  res.push(cur);
  return res.map(s => s.replace(/^"|"$/g, '').trim());
}


