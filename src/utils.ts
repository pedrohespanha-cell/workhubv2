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
  const padTime = (t: string) => t.length === 5 ? `${t}:00` : t;
  const s = new Date(`2000-01-01T${padTime(start)}`);
  let e = new Date(`2000-01-01T${padTime(end)}`);
  
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;

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
  const dateStr = d.includes('T') ? d : `${d}T12:00:00`;
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    return d || '1970-01-01';
  }

  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  date.setDate(diff);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  
  return `${y}-${m}-${dayOfMonth}`;
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
export function convertTo24Hour(timeStr: string) {
  if (!timeStr) return "07:00"; // Default
  let t = timeStr.trim().toUpperCase();
  
  // Handle cases like "9:00" without AM/PM or leading zero
  if (!t.includes('AM') && !t.includes('PM')) {
    const parts = t.replace(/[^0-9:]/g, '').split(':');
    if (parts.length === 0) return "07:00";
    let h = parseInt(parts[0]) || 0;
    let m = parseInt(parts[1]) || 0;
    
    // Simple heuristic: if hours < 7 and no AM/PM, it's probably PM (e.g. 1:00 -> 13:00)
    // but the user wants global 24h, so we just pad it.
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const isPM = t.includes('PM');
  const isAM = t.includes('AM');
  const cleanTime = t.replace(/(AM|PM)/g, '').trim();
  const parts = cleanTime.split(':');
  let hours = parseInt(parts[0]) || 0;
  let minutes = parseInt(parts[1]) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function standardizePosition(pos: string): string {
  const p = pos.trim().toLowerCase();
  if (p.includes('rigging')) return 'Rigging LX';
  if (p.includes('shooting')) return 'Shooting LX';
  // Fallback to Rigging LX if it seems to be an electric/lx role but unspecified
  if (p.includes('lx') || p.includes('electric') || p.includes('lighting')) return 'Rigging LX';
  return pos; // Keep original if no match
}
