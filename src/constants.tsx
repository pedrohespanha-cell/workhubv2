import React from 'react';
import { WagePeriod, DashSettings } from './types';

export const WAGE_PERIODS: WagePeriod[] = [
  { start: "2023-04-02", end: "2024-03-30", idx: 0 },
  { start: "2024-03-31", end: "2025-03-29", idx: 1 },
  { start: "2025-03-30", end: "2026-03-28", idx: 2 },
  { start: "2026-03-29", end: "2027-04-03", idx: 3 },
  { start: "2027-04-04", end: "2028-03-31", idx: 4 }
];

export const POSITIONS = [
  "Gaffer", "Rigging Gaffer", "Best Boy", "Best Boy Rigging", 
  "Lighting Technician", "Rigging LX", "Key Grip", "Key Rigging Grip", 
  "Best Boy Grip", "Grip", "Second Rigging Grip", "Rigging Grip"
];

export const MAP_POS: Record<string, string> = {
  "Gaffer": "Head Lighting Technician (incl. Lighting Board Operator)",
  "Rigging Gaffer": "Head Rigging Lighting Technician",
  "Best Boy": "Second Lighting Technician",
  "Best Boy Rigging": "Second Rigging Lighting Technician",
  "Lighting Technician": "Lighting Technician",
  "Rigging LX": "Rigging Lighting Technician",
  "Key Grip": "Key Grip",
  "Key Rigging Grip": "Key Rigging Grip",
  "Best Boy Grip": "Assistant Key Grip (Best Boy)",
  "Grip": "Grip",
  "Second Rigging Grip": "Second Rigging Grip",
  "Rigging Grip": "Rigging Grip"
};

export const WAGES: Record<string, Record<string, number[]>> = {
  "Feature Films": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [53.05, 55.70, 57.93, 59.96, 61.76],
    "Second Lighting Technician": [48.25, 50.66, 52.69, 54.53, 56.17],
    "Lighting Technician": [46.26, 48.57, 50.51, 52.28, 53.85],
    "Head Rigging Lighting Technician": [48.25, 50.66, 52.69, 54.53, 56.17],
    "Second Rigging Lighting Technician": [46.26, 48.57, 50.51, 52.28, 53.85],
    "Rigging Lighting Technician": [43.00, 45.15, 46.96, 48.60, 50.06],
    "Key Grip": [53.05, 55.70, 57.93, 59.96, 61.76],
    "Assistant Key Grip (Best Boy)": [48.25, 50.66, 52.69, 54.53, 56.17],
    "Grip": [46.26, 48.57, 50.51, 52.28, 53.85],
    "Key Rigging Grip": [48.25, 50.66, 52.69, 54.53, 56.17],
    "Second Rigging Grip": [46.26, 48.57, 50.51, 52.28, 53.85],
    "Rigging Grip": [43.00, 45.15, 46.96, 48.60, 50.06]
  },
  "Low Budget Feature Films": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [47.74, 50.13, 52.14, 53.96, 55.58],
    "Second Lighting Technician": [43.43, 45.60, 47.42, 49.08, 50.55],
    "Lighting Technician": [41.63, 43.71, 45.46, 47.05, 48.47],
    "Head Rigging Lighting Technician": [43.43, 45.60, 47.42, 49.08, 50.55],
    "Second Rigging Lighting Technician": [41.63, 43.71, 45.46, 47.05, 48.47],
    "Rigging Lighting Technician": [38.70, 40.64, 42.26, 43.74, 45.05],
    "Key Grip": [47.74, 50.13, 52.14, 53.96, 55.58],
    "Assistant Key Grip (Best Boy)": [43.43, 45.60, 47.42, 49.08, 50.55],
    "Grip": [41.63, 43.71, 45.46, 47.05, 48.47],
    "Key Rigging Grip": [43.43, 45.60, 47.42, 49.08, 50.55],
    "Second Rigging Grip": [41.63, 43.71, 45.46, 47.05, 48.47],
    "Rigging Grip": [38.70, 40.64, 42.26, 43.74, 45.05]
  },
  "Standard Television": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [46.68, 49.95, 51.95, 53.77, 55.38],
    "Second Lighting Technician": [42.48, 45.45, 47.27, 48.92, 50.39],
    "Lighting Technician": [38.86, 41.58, 43.24, 44.75, 46.09],
    "Head Rigging Lighting Technician": [42.48, 45.45, 47.27, 48.92, 50.39],
    "Second Rigging Lighting Technician": [38.86, 41.58, 43.24, 44.75, 46.09],
    "Rigging Lighting Technician": [36.12, 38.65, 40.20, 41.61, 42.86],
    "Key Grip": [46.68, 49.95, 51.95, 53.77, 55.38],
    "Assistant Key Grip (Best Boy)": [42.48, 45.45, 47.27, 48.92, 50.39],
    "Grip": [38.86, 41.58, 43.24, 44.75, 46.09],
    "Key Rigging Grip": [42.48, 45.45, 47.27, 48.92, 50.39],
    "Second Rigging Grip": [38.86, 41.58, 43.24, 44.75, 46.09],
    "Rigging Grip": [36.12, 38.65, 40.20, 41.61, 42.86]
  },
  "Premium Network & SVOD": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [51.12, 53.68, 55.83, 57.78, 59.51],
    "Second Lighting Technician": [46.52, 48.85, 50.80, 52.58, 54.16],
    "Lighting Technician": [42.56, 44.68, 46.47, 48.10, 49.54],
    "Head Rigging Lighting Technician": [46.52, 48.85, 50.80, 52.58, 54.16],
    "Second Rigging Lighting Technician": [42.56, 44.68, 46.47, 48.10, 49.54],
    "Rigging Lighting Technician": [39.56, 41.54, 43.20, 44.71, 46.06],
    "Key Grip": [51.12, 53.68, 55.83, 57.78, 59.51],
    "Assistant Key Grip (Best Boy)": [46.52, 48.85, 50.80, 52.58, 54.16],
    "Grip": [42.56, 44.68, 46.47, 48.10, 49.54],
    "Key Rigging Grip": [46.52, 48.85, 50.80, 52.58, 54.16],
    "Second Rigging Grip": [42.56, 44.68, 46.47, 48.10, 49.54],
    "Rigging Grip": [39.56, 41.54, 43.20, 44.71, 46.06]
  },
  "Mid-Tier Network & SVOD": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [48.90, 51.35, 53.40, 55.27, 56.93],
    "Second Lighting Technician": [44.49, 46.71, 48.58, 50.28, 51.79],
    "Lighting Technician": [40.71, 42.74, 44.45, 46.01, 47.39],
    "Head Rigging Lighting Technician": [44.49, 46.71, 48.58, 50.28, 51.79],
    "Second Rigging Lighting Technician": [40.71, 42.74, 44.45, 46.01, 47.39],
    "Rigging Lighting Technician": [37.84, 39.73, 41.32, 42.77, 44.05],
    "Key Grip": [48.90, 51.35, 53.40, 55.27, 56.93],
    "Assistant Key Grip (Best Boy)": [44.49, 46.71, 48.58, 50.28, 51.79],
    "Grip": [40.71, 42.74, 44.45, 46.01, 47.39],
    "Key Rigging Grip": [44.49, 46.71, 48.58, 50.28, 51.79],
    "Second Rigging Grip": [40.71, 42.74, 44.45, 46.01, 47.39],
    "Rigging Grip": [37.84, 39.73, 41.32, 42.77, 44.05]
  },
  "Entry-Tier Network & SVOD": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [46.68, 49.01, 50.97, 52.75, 54.33],
    "Second Lighting Technician": [42.48, 44.60, 46.38, 48.00, 49.44],
    "Lighting Technician": [38.86, 40.80, 42.43, 43.92, 45.24],
    "Head Rigging Lighting Technician": [42.48, 44.60, 46.38, 48.00, 49.44],
    "Second Rigging Lighting Technician": [38.86, 40.80, 42.43, 43.92, 45.24],
    "Rigging Lighting Technician": [36.12, 37.93, 39.45, 40.83, 42.05],
    "Key Grip": [46.68, 49.01, 50.97, 52.75, 54.33],
    "Assistant Key Grip (Best Boy)": [42.48, 44.60, 46.38, 48.00, 49.44],
    "Grip": [38.86, 40.80, 42.43, 43.92, 45.24],
    "Key Rigging Grip": [42.48, 44.60, 46.38, 48.00, 49.44],
    "Second Rigging Grip": [38.86, 40.80, 42.43, 43.92, 45.24],
    "Rigging Grip": [36.12, 37.93, 39.45, 40.83, 42.05]
  },
  "New Episodic Series": {
    "Head Lighting Technician (incl. Lighting Board Operator)": [46.68, 46.96, 49.59, 52.12, 54.34],
    "Second Lighting Technician": [42.48, 42.73, 45.12, 47.42, 49.44],
    "Lighting Technician": [38.86, 39.10, 41.29, 43.39, 45.23],
    "Head Rigging Lighting Technician": [42.48, 42.73, 45.12, 47.42, 49.44],
    "Second Rigging Lighting Technician": [38.86, 39.10, 41.29, 43.39, 45.23],
    "Rigging Lighting Technician": [36.12, 36.35, 38.39, 40.34, 42.05],
    "Key Grip": [46.68, 46.96, 49.59, 52.12, 54.34],
    "Assistant Key Grip (Best Boy)": [42.48, 42.73, 45.12, 47.42, 49.44],
    "Grip": [38.86, 39.10, 41.29, 43.39, 45.23],
    "Key Rigging Grip": [42.48, 42.73, 45.12, 47.42, 49.44],
    "Second Rigging Grip": [38.86, 39.10, 41.29, 43.39, 45.23],
    "Rigging Grip": [36.12, 36.35, 38.39, 40.34, 42.05]
  }
};

export const Icons = {
  Moon: () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
  X: () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Chevron: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>,
  Chart: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Upload: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>,
  Video: () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" x2="7" y1="2" y2="22"/><line x1="17" x2="17" y1="2" y2="22"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="2" x2="7" y1="7" y2="7"/><line x1="2" x2="7" y1="17" y2="17"/><line x1="17" x2="22" y1="17" y2="17"/><line x1="17" x2="22" y1="7" y2="7"/></svg>,
  Zap: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Wipe: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m4.93 19.07 14.14-14.14"/></svg>,
  Grid: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  List: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ArrowUp: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>,
  ArrowDown: () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>,
};

export const DEFAULT_DASH_SETTINGS: DashSettings = {
  gross: true, net: true, hourlyGross: true, hourlyNet: true, 
  actualHrs: true, payableHrs: true, days: true, shows: true, pending: true,
  weekGross: true, weekNet: true, weekHourlyGross: true, weekHourlyNet: true,
  weekShows: true, weekPayableHrs: true, weekActualHrs: true
};
