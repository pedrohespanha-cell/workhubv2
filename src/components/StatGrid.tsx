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
  const dps: { label: string; val: string | number; type: string }[] = [];
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

  if (isWeekHeader) {
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
      <div className="flex gap-4 sm:gap-6 flex-wrap mt-2 md:mt-0 justify-start md:justify-end flex-1 pr-4">
        {dps.map((dp, i) => (
          <div key={i} className="text-left md:text-right flex-1 md:flex-none relative group/tooltip cursor-pointer sm:cursor-auto">
            <p className="text-[9px] text-slate-400 font-black uppercase flex items-center gap-1 sm:justify-end">
              {dp.label}
              <span className="sm:hidden text-slate-300 dark:text-slate-600"><Icons.Info /></span>
            </p>
            <p className={`font-black ${dp.type === 'emerald' ? 'text-emerald-500' : dp.type === 'brand' ? 'text-brand-500' : 'text-slate-700 dark:text-slate-300'}`}>{dp.val}</p>

            <div className="absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-xl shadow-xl z-50 text-center font-bold">
              {tooltips[dp.label] || 'Calculated statistic.'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (dashSettings.gross) dps.push({ label: 'Total Gross', val: formatCurr(g), type: 'emerald' });
  if (dashSettings.net) dps.push({ label: 'Total Net', val: formatCurr(n), type: 'brand' });
  if (dashSettings.hourlyGross) dps.push({ label: 'Hourly Gross', val: formatCurr(actualH ? g / actualH : 0), type: 'emerald-light' });
  if (dashSettings.hourlyNet) dps.push({ label: 'Hourly Net', val: formatCurr(actualH ? n / actualH : 0), type: 'brand-light' });
  if (dashSettings.actualHrs) dps.push({ label: 'Actual Hrs', val: actualH.toFixed(1), type: 'normal' });
  if (dashSettings.payableHrs) dps.push({ label: 'Payable Hrs', val: p.toFixed(1), type: 'normal' });
  if (dashSettings.days) dps.push({ label: 'Days Worked', val: daysC, type: 'normal' });
  if (dashSettings.shows) dps.push({ label: 'Shows Worked', val: showsC, type: 'normal' });
  if (dashSettings.weeksWorked) dps.push({ label: 'Weeks Worked', val: sourceData.weeksWorked || 0, type: 'normal' });
  if (dashSettings.avgPerWeek) dps.push({ label: 'Avg / Week', val: formatCurr(sourceData.avgPerWeek || 0), type: 'emerald-light' });
  if (dashSettings.avgPerMonth) dps.push({ label: 'Avg / Month', val: formatCurr(sourceData.avgPerMonth || 0), type: 'brand-light' });

  const tooltips: Record<string, string> = {
    'Total Gross': 'Sum of all gross pay across selected logs.',
    'Total Net': 'Sum of all net pay across selected logs.',
    'Hourly Gross': 'Total Gross ÷ Actual Hrs Worked',
    'Hourly Net': 'Total Net ÷ Actual Hrs Worked',
    'Actual Hrs': 'Sum of exact clock-in/out hours.',
    'Payable Hrs': 'Sum of calculated billable hours (includes guarantees and overtime).',
    'Days Worked': 'Total unique calendar days logged.',
    'Shows Worked': 'Total unique productions logged.',
    'Weeks Worked': 'Total unique payroll weeks active.',
    'Avg / Week': 'Total Gross ÷ Weeks Worked',
    'Avg / Month': 'Total Gross ÷ Months Worked'
  };

  return (
    <div className={`grid grid-cols-2 ${compactMode ? 'gap-3' : 'md:grid-cols-4 gap-4'}`}>
      {dps.map((dp, i) => (
        <div key={i} className={`bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-between group/tooltip relative ${dp.type.includes('light') ? 'bg-slate-50 dark:bg-slate-950/50' : ''}`}>
          <div className="flex justify-between items-start mb-1 cursor-pointer sm:cursor-auto">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-tight w-full">{dp.label}</p>
            <span className="text-slate-300 dark:text-slate-600 sm:opacity-0 group-hover/tooltip:opacity-100 transition-opacity shrink-0"><Icons.Info /></span>
          </div>
          <p className={`text-xl font-black ${dp.type.includes('emerald') ? 'text-emerald-500' : dp.type.includes('brand') ? 'text-brand-500' : ''}`}>{dp.val}</p>

          <div className="absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-3 rounded-2xl shadow-xl z-50 text-center font-bold">
            {tooltips[dp.label] || 'Calculated statistic.'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
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
