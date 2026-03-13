import React from 'react';
import { Entry, DashSettings } from '../types';
import { Icons } from '../constants';
import { getISOWeek, getWeekDateRange, formatCurr } from '../utils';
import { StatGrid } from './StatGrid';

interface WeeklyCardProps {
  wKey: string;
  wData: any;
  isExpanded: boolean;
  toggleExpanded: () => void;
  dashSettings: DashSettings;
  onEdit: (e: Entry) => void;
  onDelete: (id: number) => void;
  onApplyPay: (weekKey: string, showName: string, g: number, n: number) => void;
}

export const WeeklyCard: React.FC<WeeklyCardProps> = ({
  wKey,
  wData,
  isExpanded,
  toggleExpanded,
  dashSettings,
  onEdit,
  onDelete,
  onApplyPay
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 overflow-hidden shadow-sm transition-all">
      <div className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4" onClick={toggleExpanded}>
        <div className="shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-black text-2xl tracking-tighter whitespace-nowrap">Week {getISOWeek(new Date(wKey + 'T12:00:00'))}</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap hidden lg:inline-block">{getWeekDateRange(wKey)}</span>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest lg:hidden">{getWeekDateRange(wKey)}</p>
        </div>

        <StatGrid sourceData={wData} dashSettings={dashSettings} isWeekHeader={true} />

        <div className="text-slate-400 p-2 bg-slate-100 dark:bg-slate-800 rounded-full transition-transform shrink-0 hidden md:block" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}><Icons.Chevron /></div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-6 pb-6 space-y-4 border-t dark:border-slate-800 pt-6 bg-slate-50/50 dark:bg-slate-950/50">
          {Object.entries(wData.shows).map(([sName, sData]: [string, any]) => {
            const hasPending = sData.entries.some((e: Entry) => !e.gross && !e.net);
            return (
              <div key={sName} className={`rounded-3xl border p-4 sm:p-5 bg-white dark:bg-slate-900 ${hasPending ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]' : 'dark:border-slate-800 shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <span className="font-black text-lg tracking-tight w-full">{sName}</span>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-right">
                      <div className="text-left sm:text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Gross</p><p className="text-sm font-black text-emerald-500">{sData.g ? formatCurr(sData.g) : '—'}</p></div>
                      <div className="text-left sm:text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Net</p><p className="text-sm font-black text-brand-500">{sData.n ? formatCurr(sData.n) : '—'}</p></div>
                      <div className="text-left sm:text-right hidden sm:block"><p className="text-[9px] font-black text-slate-400 uppercase">$/hr (Grs)</p><p className="text-sm font-black text-emerald-500">{sData.actualH && sData.g ? formatCurr(sData.g / sData.actualH) : '—'}</p></div>
                      <div className="text-left sm:text-right hidden sm:block"><p className="text-[9px] font-black text-slate-400 uppercase">$/hr (Net)</p><p className="text-sm font-black text-brand-500">{sData.actualH && sData.n ? formatCurr(sData.n / sData.actualH) : '—'}</p></div>
                    </div>

                    {!sData.g && !sData.n && (
                      <button onClick={(e) => { e.stopPropagation(); onApplyPay(wKey, sName, sData.g || 0, sData.n || 0); }} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black hover:scale-105 hover:bg-rose-600 transition-all uppercase shadow-md shadow-rose-500/20 animate-pulse ml-2 whitespace-nowrap">Apply Pay</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sData.entries.map((e: Entry) => (
                    <div key={e.id} className="border dark:border-slate-800 p-4 rounded-2xl flex flex-col group bg-slate-50 dark:bg-slate-950/80">

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex gap-2 items-center mb-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            {(!e.gross && !e.net) && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                          </div>

                          <p className="text-sm font-bold flex items-center gap-1">
                            {e.hours.toFixed(1)}h
                            <span className="text-xs text-slate-400 ml-1 font-normal">({e.startTime}-{e.endTime})</span>
                            {e.minPayType === 'unknown' && <span className="ml-2 text-[8px] bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-1.5 py-0.5 rounded font-black uppercase" title="Minimum guarantee not inputted. Payable hours may be inaccurate.">No Min</span>}
                          </p>
                          <p className="text-[9px] text-slate-400 uppercase mt-0.5 font-bold">{e.position} • {e.minPayType === 'unknown' ? 'Unknown Guarantee' : `${e.minPayType} Guarantee`}</p>
                        </div>

                        <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(e)} className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-500 shadow-sm border dark:border-slate-800"><Icons.Edit /></button>
                          <button onClick={() => onDelete(e.id)} className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-red-500 shadow-sm border dark:border-slate-800"><Icons.Trash /></button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t dark:border-slate-800/50 flex flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-400 font-black uppercase">Gross</span><span className="text-xs font-bold text-emerald-500">{e.gross ? formatCurr(e.gross) : '—'}</span></div>
                        <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-400 font-black uppercase">Net</span><span className="text-xs font-bold text-brand-500">{e.net ? formatCurr(e.net) : '—'}</span></div>
                        <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-400 font-black uppercase">Hrs(Pyt)</span><span className="text-xs font-bold text-slate-600 dark:text-slate-300">{e.payableHours ? e.payableHours.toFixed(1) : '—'}</span></div>
                        {e.gross && e.hours ? <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-400 font-black uppercase">$/hr grs</span><span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurr((e.gross as number) / e.hours)}</span></div> : null}
                        {e.net && e.hours ? <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-400 font-black uppercase">$/hr net</span><span className="text-xs font-bold text-brand-600 dark:text-brand-400">{formatCurr((e.net as number) / e.hours)}</span></div> : null}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
