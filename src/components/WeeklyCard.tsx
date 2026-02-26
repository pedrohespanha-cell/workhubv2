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
                  <span className="font-black text-lg tracking-tight truncate w-full">{sName}</span>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                    <div className="text-left sm:text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Hourly Gross</p><p className="text-sm font-black text-brand-500">{sData.actualH ? formatCurr(sData.g / sData.actualH) : '—'}</p></div>
                    <button onClick={(e) => { e.stopPropagation(); onApplyPay(wKey, sName, sData.g || 0, sData.n || 0); }} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform uppercase border border-slate-200 dark:border-slate-700">Apply Pay</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {sData.entries.map((e: Entry) => (
                    <div key={e.id} className="border dark:border-slate-800 p-3 rounded-2xl flex justify-between items-center group bg-slate-50 dark:bg-slate-950/80">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          {(!e.gross && !e.net) && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                        </div>
                        <p className="text-sm font-bold">{e.hours.toFixed(1)}h <span className="text-xs text-slate-400 ml-1 font-normal">({e.startTime}-{e.endTime})</span></p>
                        <p className="text-[9px] text-slate-400 uppercase mt-0.5">{e.position} • {e.minPayType === 'unknown' ? 'No Min' : e.minPayType}</p>
                      </div>
                      <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(e)} className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-500 shadow-sm border dark:border-slate-800"><Icons.Edit /></button>
                        <button onClick={() => onDelete(e.id)} className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-red-500 shadow-sm border dark:border-slate-800"><Icons.Trash /></button>
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
