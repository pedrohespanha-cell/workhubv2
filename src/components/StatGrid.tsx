import React from 'react';
import { DashSettings } from '../types';
import { formatCurr } from '../utils';

interface StatGridProps {
  sourceData: any;
  dashSettings: DashSettings;
  isWeekHeader?: boolean;
}

export const StatGrid: React.FC<StatGridProps> = ({ sourceData, dashSettings, isWeekHeader = false }) => {
  const dps: { label: string; val: string | number; type: string }[] = [];
  const actualH = sourceData.actualHours ?? sourceData.actualH ?? sourceData.th ?? 0;
  const g = sourceData.gross ?? sourceData.g ?? sourceData.tg ?? 0;
  const n = sourceData.net ?? sourceData.n ?? sourceData.tn ?? 0;
  const p = sourceData.payableHours ?? sourceData.payableH ?? sourceData.tph ?? 0;
  const showsC = sourceData.shows instanceof Set ? sourceData.shows.size : (sourceData.sNames?.size ?? sourceData.shows ?? 0);
  const daysC = sourceData.days instanceof Set ? sourceData.days.size : (sourceData.days ?? 0);

  if (isWeekHeader) {
    if (dashSettings.weekGross) dps.push({ label: 'Wk Gross', val: formatCurr(g), type: 'emerald' });
    if (dashSettings.weekNet) dps.push({ label: 'Wk Net', val: formatCurr(n), type: 'brand' });
    if (dashSettings.weekHourlyGross) dps.push({ label: 'Hourly Grs', val: formatCurr(actualH ? g / actualH : 0), type: 'normal' });
    if (dashSettings.weekHourlyNet) dps.push({ label: 'Hourly Net', val: formatCurr(actualH ? n / actualH : 0), type: 'normal' });
    if (dashSettings.weekShows) dps.push({ label: 'Shows', val: showsC, type: 'normal' });
    if (dashSettings.weekPayableHrs) dps.push({ label: 'Payable Hrs', val: p.toFixed(1), type: 'normal' });
    if (dashSettings.weekActualHrs) dps.push({ label: 'Actual Hrs', val: actualH.toFixed(1), type: 'normal' });

    return (
      <div className="flex gap-4 sm:gap-6 flex-wrap mt-2 md:mt-0 justify-start md:justify-end flex-1 pr-4">
        {dps.map((dp, i) => (
          <div key={i} className="text-left md:text-right flex-1 md:flex-none">
            <p className="text-[9px] text-slate-400 font-black uppercase">{dp.label}</p>
            <p className={`font-black ${dp.type === 'emerald' ? 'text-emerald-500' : dp.type === 'brand' ? 'text-brand-500' : 'text-slate-700 dark:text-slate-300'}`}>{dp.val}</p>
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {dps.map((dp, i) => (
        <div key={i} className={`bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-between ${dp.type.includes('light') ? 'bg-slate-50 dark:bg-slate-950/50' : ''}`}>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{dp.label}</p>
          <p className={`text-xl font-black ${dp.type.includes('emerald') ? 'text-emerald-500' : dp.type.includes('brand') ? 'text-brand-500' : ''}`}>{dp.val}</p>
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
