import React from 'react';
import { DashSettings } from '../types';
import { formatCurr } from '../utils';
import { Icons } from '../constants';

interface StatGridProps {
  sourceData: any;
  dashSettings: DashSettings;
  isWeekHeader?: boolean;
  compactMode?: boolean;
}

// YTD helpers
const getYTDWeeks = () => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  return Math.max(1, Math.floor((now.getTime() - jan1.getTime()) / (7 * 86400000)) + 1);
};
const getYTDDays = () => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  return Math.max(1, Math.floor((now.getTime() - jan1.getTime()) / 86400000) + 1);
};

export const StatGrid: React.FC<StatGridProps> = ({ sourceData, dashSettings, isWeekHeader = false, compactMode = false }) => {
  if (!dashSettings) return null;
  const actualH = sourceData.actualHours ?? sourceData.actualH ?? sourceData.th ?? 0;
  const g = sourceData.gross ?? sourceData.g ?? sourceData.tg ?? 0;
  const n = sourceData.net ?? sourceData.n ?? sourceData.tn ?? 0;
  const p = sourceData.payableHours ?? sourceData.payableH ?? sourceData.tph ?? 0;
  const showsC = sourceData.shows instanceof Set
    ? sourceData.shows.size
    : (typeof sourceData.shows === 'object' && sourceData.shows !== null)
      ? Object.keys(sourceData.shows).length
      : (sourceData.sNames?.size ?? sourceData.shows ?? 0);
  const daysC = sourceData.days instanceof Set ? sourceData.days.size : (sourceData.days ?? 0);

  // ── WEEK HEADER (compact inline row — pairs stacked) ──────────────────────
  if (isWeekHeader) {
    const showPay   = dashSettings.weekGross || dashSettings.weekNet;
    const showHrly  = dashSettings.weekHourlyGross || dashSettings.weekHourlyNet;
    const showShows = dashSettings.weekShows;
    const showPayH  = dashSettings.weekPayableHrs;
    const showActH  = dashSettings.weekActualHrs;

    // Build solo stat items (non-paired)
    type SoloStat = { label: string; val: string; key: string };
    const solos: SoloStat[] = [];
    if (showShows) solos.push({ key: 'shows', label: 'Shows', val: String(showsC) });
    if (showPayH)  solos.push({ key: 'payH', label: 'Payable Hrs', val: p.toFixed(1) });
    if (showActH)  solos.push({ key: 'actH', label: 'Actual Hrs', val: actualH.toFixed(1) });

    const allSlots = [
      ...(showPay  ? ['pay']   : []),
      ...(showHrly ? ['hrly']  : []),
      ...solos.map(s => s.key),
    ];

    const tooltipPos = (i: number) => i === 0 ? 'left-0' : i === allSlots.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2';
    const arrowPos   = (i: number) => i === 0 ? 'left-4' : i === allSlots.length - 1 ? 'right-4 left-auto' : 'left-1/2 -translate-x-1/2';

    let slotIdx = 0;

    return (
      <div className="flex gap-4 sm:gap-5 flex-wrap mt-2 md:mt-0 justify-start md:justify-end flex-1 pr-4 min-w-0">

        {/* Wk Pay: gross + net stacked */}
        {showPay && (() => {
          const idx = slotIdx++;
          return (
            <div key="pay" className="text-left md:text-right flex-1 md:flex-none relative group/tooltip min-w-0">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider sm:text-right mb-0.5">Wk Pay</p>
              {dashSettings.weekGross && <p className="font-black text-emerald-500 leading-tight truncate">{formatCurr(g)}</p>}
              {dashSettings.weekNet   && <p className="text-sm font-black text-brand-500 leading-tight truncate opacity-80">{formatCurr(n)}</p>}
              <div className={`absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-xl shadow-xl z-[200] text-center font-bold ${tooltipPos(idx)}`}>
                Weekly gross (top) and net (bottom) pay.
                <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${arrowPos(idx)}`}></div>
              </div>
            </div>
          );
        })()}

        {/* Hourly Rate: gross + net stacked */}
        {showHrly && (() => {
          const idx = slotIdx++;
          return (
            <div key="hrly" className="text-left md:text-right flex-1 md:flex-none relative group/tooltip min-w-0">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider sm:text-right mb-0.5">$/hr</p>
              {dashSettings.weekHourlyGross && <p className="font-black text-emerald-500 leading-tight truncate">{formatCurr(actualH ? g / actualH : 0)}</p>}
              {dashSettings.weekHourlyNet   && <p className="text-sm font-black text-brand-500 leading-tight truncate opacity-80">{formatCurr(actualH ? n / actualH : 0)}</p>}
              <div className={`absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-xl shadow-xl z-[200] text-center font-bold ${tooltipPos(idx)}`}>
                Effective hourly rate — gross (top), net (bottom).
                <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${arrowPos(idx)}`}></div>
              </div>
            </div>
          );
        })()}

        {/* Solo stats */}
        {solos.map((s) => {
          const idx = slotIdx++;
          return (
            <div key={s.key} className="text-left md:text-right flex-1 md:flex-none relative group/tooltip min-w-0">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider sm:text-right truncate">{s.label}</p>
              <p className="font-black text-slate-700 dark:text-slate-300 truncate">{s.val}</p>
              <div className={`absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-xl shadow-xl z-[200] text-center font-bold ${tooltipPos(idx)}`}>
                {s.label === 'Shows' ? 'Unique productions this week.' : s.label === 'Payable Hrs' ? 'Billable hours (incl. guarantees).' : 'Exact clock-in/out hours.'}
                <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${arrowPos(idx)}`}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── DASHBOARD STAT CARDS ────────────────────────────────────────────────
  type StatCard = {
    key: string;
    label: string;
    primaryVal: string;
    primarySub?: string;   // smaller sub-text line (e.g. "/ 11 YTD")
    primaryColor: 'emerald' | 'brand' | 'normal';
    secondaryVal?: string;
    secondaryColor?: 'emerald' | 'brand';
    tooltip: string;
  };

  const cards: StatCard[] = [];
  const ytdWeeks = getYTDWeeks();
  const ytdDays  = getYTDDays();

  // Total Pay (gross + net)
  if (dashSettings.gross || dashSettings.net) {
    cards.push({
      key: 'pay',
      label: dashSettings.gross && dashSettings.net ? 'Total Pay' : dashSettings.gross ? 'Total Gross' : 'Total Net',
      primaryVal: formatCurr(g),
      primaryColor: 'emerald',
      secondaryVal: dashSettings.gross && dashSettings.net ? formatCurr(n) : undefined,
      secondaryColor: 'brand',
      tooltip: 'Total Gross (top) and Net (bottom) pay across all logs.',
    });
  }

  // Hourly Rate (gross + net)
  if (dashSettings.hourlyGross || dashSettings.hourlyNet) {
    cards.push({
      key: 'hourly',
      label: dashSettings.hourlyGross && dashSettings.hourlyNet ? 'Hourly Rate' : dashSettings.hourlyGross ? 'Hourly Gross' : 'Hourly Net',
      primaryVal: formatCurr(actualH ? g / actualH : 0),
      primaryColor: 'emerald',
      secondaryVal: dashSettings.hourlyGross && dashSettings.hourlyNet ? formatCurr(actualH ? n / actualH : 0) : undefined,
      secondaryColor: 'brand',
      tooltip: 'Effective hourly rate — gross (top), net (bottom).',
    });
  }

  if (dashSettings.actualHrs)  cards.push({ key: 'actualH',  label: 'Actual Hrs',  primaryVal: actualH.toFixed(1) + 'h', primaryColor: 'normal', tooltip: 'Sum of exact clock-in/out hours.' });
  if (dashSettings.payableHrs) cards.push({ key: 'payableH', label: 'Payable Hrs', primaryVal: p.toFixed(1) + 'h',      primaryColor: 'normal', tooltip: 'Billable hours including guarantees and OT.' });

  // Days on Set / YTD
  if (dashSettings.days) {
    cards.push({
      key: 'days',
      label: 'Days on Set / YTD',
      primaryVal: String(daysC),
      primarySub: `/ ${ytdDays}d elapsed`,
      primaryColor: 'normal',
      tooltip: `${daysC} days logged vs. ${ytdDays} calendar days elapsed this year.`,
    });
  }

  if (dashSettings.shows) cards.push({ key: 'shows', label: 'Shows Worked', primaryVal: String(showsC), primaryColor: 'normal', tooltip: 'Total unique productions logged.' });

  // Active Weeks / YTD
  if (dashSettings.weeksWorked) {
    const worked = sourceData.weeksWorked || 0;
    cards.push({
      key: 'weeks',
      label: 'Active Wks / YTD',
      primaryVal: String(worked),
      primarySub: `/ ${ytdWeeks} wks elapsed`,
      primaryColor: 'normal',
      tooltip: `${worked} weeks worked vs. ${ytdWeeks} weeks elapsed this year.`,
    });
  }

  // Avg / Week (gross + net)
  if (dashSettings.avgPerWeek) {
    cards.push({
      key: 'avgWeek',
      label: 'Avg / Week',
      primaryVal: formatCurr(sourceData.avgPerWeek || 0),
      primaryColor: 'emerald',
      secondaryVal: sourceData.weeksWorked ? formatCurr(n / sourceData.weeksWorked) : undefined,
      secondaryColor: 'brand',
      tooltip: 'Average gross (top) and net (bottom) pay per week worked.',
    });
  }

  // Avg / Month (gross + net)
  if (dashSettings.avgPerMonth) {
    cards.push({
      key: 'avgMonth',
      label: 'Avg / Month',
      primaryVal: formatCurr(sourceData.avgPerMonth || 0),
      primaryColor: 'emerald',
      secondaryVal: sourceData.monthsWorked ? formatCurr(n / sourceData.monthsWorked) : undefined,
      secondaryColor: 'brand',
      tooltip: 'Average gross (top) and net (bottom) pay per month.',
    });
  }

  // Avg YTD / Week
  if (dashSettings.avgPerWeek && ytdWeeks > 0) {
    cards.push({
      key: 'ytdWeek',
      label: 'Avg YTD / Wk',
      primaryVal: formatCurr(g / ytdWeeks),
      primaryColor: 'emerald',
      secondaryVal: formatCurr(n / ytdWeeks),
      secondaryColor: 'brand',
      tooltip: `YTD average gross (top) / net (bottom) per week (${ytdWeeks} wks elapsed).`,
    });
  }

  return (
    <div className={`grid grid-cols-2 ${compactMode ? 'gap-3' : 'md:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
      {cards.map((card, i) => (
        <div key={card.key}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-between group/tooltip relative cursor-default">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-tight">{card.label}</p>
            <span className="text-slate-300 dark:text-slate-600 sm:opacity-0 group-hover/tooltip:opacity-100 transition-opacity shrink-0"><Icons.Info /></span>
          </div>
          <div>
            <p className={`text-xl font-black leading-tight ${card.primaryColor === 'emerald' ? 'text-emerald-500' : card.primaryColor === 'brand' ? 'text-brand-500' : ''}`}>
              {card.primaryVal}
            </p>
            {card.primarySub && (
              <p className="text-[10px] font-black text-slate-400 leading-tight mt-0.5">{card.primarySub}</p>
            )}
            {card.secondaryVal && (
              <p className={`text-sm font-black leading-tight mt-0.5 ${card.secondaryColor === 'brand' ? 'text-brand-500 opacity-80' : 'text-emerald-500 opacity-80'}`}>
                {card.secondaryVal}
              </p>
            )}
          </div>
          <div className={`absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full mb-2 w-52 bg-slate-800 text-white text-[10px] p-3 rounded-2xl shadow-xl z-50 text-center font-bold ${i % 4 === 0 ? 'left-0' : i % 4 === 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
            {card.tooltip}
            <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${i % 4 === 0 ? 'left-4' : i % 4 === 3 ? 'right-4 left-auto' : 'left-1/2 -translate-x-1/2'}`}></div>
          </div>
        </div>
      ))}
      {dashSettings.pending && (sourceData.pending || 0) > 0 && (
        <div className="bg-orange-500/10 border-orange-500/30 p-4 rounded-3xl border shadow-sm flex flex-col justify-between">
          <p className="text-[10px] uppercase font-black tracking-widest text-orange-600 dark:text-orange-500">Pending</p>
          <p className="text-xl font-black text-orange-600 dark:text-orange-500">{sourceData.pending} chq.</p>
        </div>
      )}
    </div>
  );
};
