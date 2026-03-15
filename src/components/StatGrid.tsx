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

  // ── WEEK HEADER (compact inline stats row) ──────────────────────────────
  if (isWeekHeader) {
    const dps: { label: string; val: string | number; type: string }[] = [];
    if (dashSettings.weekGross) dps.push({ label: 'Wk Gross', val: formatCurr(g), type: 'emerald' });
    if (dashSettings.weekNet) dps.push({ label: 'Wk Net', val: formatCurr(n), type: 'brand' });
    if (dashSettings.weekHourlyGross) dps.push({ label: 'Hourly Grs', val: formatCurr(actualH ? g / actualH : 0), type: 'normal' });
    if (dashSettings.weekHourlyNet) dps.push({ label: 'Hourly Net', val: formatCurr(actualH ? n / actualH : 0), type: 'normal' });
    if (dashSettings.weekShows) dps.push({ label: 'Shows', val: showsC, type: 'normal' });
    if (dashSettings.weekPayableHrs) dps.push({ label: 'Payable Hrs', val: p.toFixed(1), type: 'normal' });
    if (dashSettings.weekActualHrs) dps.push({ label: 'Actual Hrs', val: actualH.toFixed(1), type: 'normal' });

    const tooltips: Record<string, string> = {
      'Wk Gross': 'Total Gross for this week.',
      'Wk Net': 'Total Net for this week.',
      'Hourly Grs': 'Weekly Gross ÷ Actual Hrs Worked',
      'Hourly Net': 'Weekly Net ÷ Actual Hrs Worked',
      'Shows': 'Total unique productions this week.',
      'Payable Hrs': 'Total billable hours (includes guarantees).',
      'Actual Hrs': 'Total exact clock-in/out hours.'
    };

    return (
      <div className="flex gap-4 sm:gap-6 flex-wrap mt-2 md:mt-0 justify-start md:justify-end flex-1 pr-4 min-w-0">
        {dps.map((dp, i) => {
          const isFirst = i === 0;
          const isLast = i === dps.length - 1;
          const tooltipPos = isFirst ? 'left-0' : isLast ? 'right-0' : 'left-1/2 -translate-x-1/2';
          const arrowPos = isFirst ? 'left-4' : isLast ? 'right-4 left-auto' : 'left-1/2 -translate-x-1/2';
          return (
            <div key={i} className="text-left md:text-right flex-1 md:flex-none relative group/tooltip cursor-pointer sm:cursor-auto min-w-0">
              <p className="text-[9px] text-slate-400 font-black uppercase flex items-center gap-1 sm:justify-end truncate">
                {dp.label}
                <span className="sm:hidden text-slate-300 dark:text-slate-600"><Icons.Info /></span>
              </p>
              <p className={`font-black truncate ${dp.type === 'emerald' ? 'text-emerald-500' : dp.type === 'brand' ? 'text-brand-500' : 'text-slate-700 dark:text-slate-300'}`}>{dp.val}</p>
              <div className={`absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-xl shadow-xl z-[200] text-center font-bold ${tooltipPos}`}>
                {tooltips[dp.label] || 'Calculated statistic.'}
                <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${arrowPos}`}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── DASHBOARD STAT CARDS ─────────────────────────────────────────────────
  // Build "groups" of cards. Gross+Net pairs are merged into one card;
  // solo stats get their own card.
  type StatCard = {
    key: string;
    label: string;
    primaryVal: string;
    primaryColor: 'emerald' | 'brand' | 'normal';
    secondaryVal?: string;
    secondaryColor?: 'emerald' | 'brand';
    tooltip: string;
    secondaryTooltip?: string;
    secondaryLabel?: string;
  };

  const cards: StatCard[] = [];

  const tooltipMap: Record<string, string> = {
    'Total Pay':      'Total Gross (top) and Net (bottom) pay across all logs.',
    'Hourly Rate':    'Effective gross (top) and net (bottom) rate per actual hour.',
    'Actual Hrs':     'Sum of exact clock-in/out hours.',
    'Payable Hrs':    'Billable hours including guarantees and overtime.',
    'Days Worked':    'Total unique calendar days logged.',
    'Shows Worked':   'Total unique productions logged.',
    'Weeks Worked':   'Total unique payroll weeks active.',
    'Avg / Week':     'Average gross (top) and net (bottom) pay per week.',
    'Avg / Month':    'Average gross (top) and net (bottom) pay per month.',
    'Avg YTD/Wk':     'Year-to-date gross average per week.',
  };

  // Pair: Total Gross + Total Net → one card
  if (dashSettings.gross || dashSettings.net) {
    cards.push({
      key: 'pay',
      label: dashSettings.gross && dashSettings.net ? 'Total Pay' : dashSettings.gross ? 'Total Gross' : 'Total Net',
      primaryVal: formatCurr(g),
      primaryColor: 'emerald',
      secondaryVal: dashSettings.gross && dashSettings.net ? formatCurr(n) : undefined,
      secondaryColor: 'brand',
      secondaryLabel: 'net',
      tooltip: tooltipMap['Total Pay'],
    });
  }

  // Pair: Hourly Gross + Hourly Net → one card
  if (dashSettings.hourlyGross || dashSettings.hourlyNet) {
    cards.push({
      key: 'hourly',
      label: dashSettings.hourlyGross && dashSettings.hourlyNet ? 'Hourly Rate' : dashSettings.hourlyGross ? 'Hourly Gross' : 'Hourly Net',
      primaryVal: formatCurr(actualH ? g / actualH : 0),
      primaryColor: 'emerald',
      secondaryVal: dashSettings.hourlyGross && dashSettings.hourlyNet ? formatCurr(actualH ? n / actualH : 0) : undefined,
      secondaryColor: 'brand',
      secondaryLabel: 'net',
      tooltip: tooltipMap['Hourly Rate'],
    });
  }

  if (dashSettings.actualHrs) cards.push({ key: 'actualH', label: 'Actual Hrs', primaryVal: actualH.toFixed(1) + 'h', primaryColor: 'normal', tooltip: tooltipMap['Actual Hrs'] });
  if (dashSettings.payableHrs) cards.push({ key: 'payableH', label: 'Payable Hrs', primaryVal: p.toFixed(1) + 'h', primaryColor: 'normal', tooltip: tooltipMap['Payable Hrs'] });
  if (dashSettings.days) cards.push({ key: 'days', label: 'Days Worked', primaryVal: String(daysC), primaryColor: 'normal', tooltip: tooltipMap['Days Worked'] });
  if (dashSettings.shows) cards.push({ key: 'shows', label: 'Shows Worked', primaryVal: String(showsC), primaryColor: 'normal', tooltip: tooltipMap['Shows Worked'] });
  if (dashSettings.weeksWorked) cards.push({ key: 'weeks', label: 'Weeks Worked', primaryVal: String(sourceData.weeksWorked || 0), primaryColor: 'normal', tooltip: tooltipMap['Weeks Worked'] });

  // Pair: Avg/Week gross + net → one card
  if (dashSettings.avgPerWeek) {
    cards.push({
      key: 'avgWeek',
      label: 'Avg / Week',
      primaryVal: formatCurr(sourceData.avgPerWeek || 0),
      primaryColor: 'emerald',
      secondaryVal: sourceData.weeksWorked ? formatCurr(n / sourceData.weeksWorked) : undefined,
      secondaryColor: 'brand',
      secondaryLabel: 'net',
      tooltip: tooltipMap['Avg / Week'],
    });
  }

  // Pair: Avg/Month gross + net → one card
  if (dashSettings.avgPerMonth) {
    cards.push({
      key: 'avgMonth',
      label: 'Avg / Month',
      primaryVal: formatCurr(sourceData.avgPerMonth || 0),
      primaryColor: 'emerald',
      secondaryVal: sourceData.monthsWorked ? formatCurr(n / sourceData.monthsWorked) : undefined,
      secondaryColor: 'brand',
      secondaryLabel: 'net',
      tooltip: tooltipMap['Avg / Month'],
    });
  }

  // YTD average per week
  if (dashSettings.avgPerWeek) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weeksSoFar = Math.ceil((now.getTime() - startOfYear.getTime()) / (7 * 86400000));
    if (weeksSoFar > 0) {
      cards.push({
        key: 'ytdWeek',
        label: 'Avg YTD/Wk',
        primaryVal: formatCurr(g / weeksSoFar),
        primaryColor: 'emerald',
        secondaryVal: formatCurr(n / weeksSoFar),
        secondaryColor: 'brand',
        secondaryLabel: 'net',
        tooltip: tooltipMap['Avg YTD/Wk'],
      });
    }
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
            {card.secondaryVal && (
              <p className={`text-sm font-black leading-tight mt-0.5 ${card.secondaryColor === 'brand' ? 'text-brand-500 opacity-80' : 'text-emerald-500 opacity-80'}`}>
                {card.secondaryVal}
              </p>
            )}
          </div>
          {/* Tooltip */}
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
