import React, { useState, useEffect } from 'react';
import { Entry } from '../types';
import { Icons } from '../constants';
import { formatCurr, calculateHours, calculateOT } from '../utils';

interface CSVReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entry[];
  onConfirm: (finalEntries: Entry[]) => void;
}

export const CSVReviewModal: React.FC<CSVReviewModalProps> = ({
  isOpen,
  onClose,
  entries,
  onConfirm
}) => {
  const [data, setData] = useState<Entry[]>([]);

  // Sync data from props whenever the modal opens or entries change
  useEffect(() => {
    if (isOpen && entries.length > 0) {
      setData([...entries]);
    }
  }, [isOpen, entries]);

  if (!isOpen) return null;

  const updateRow = (idx: number, field: keyof Entry, val: any) => {
    const next = [...data];
    next[idx] = { ...next[idx], [field]: val };
    
    // Recalculate if times change
    if (field === 'startTime' || field === 'endTime' || field === 'minPayType') {
        const h = calculateHours(next[idx].startTime, next[idx].endTime);
        next[idx].hours = h;
        next[idx].payableHours = calculateOT(h, next[idx].minPayType);
    }
    setData(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[80vh] rounded-[2.5rem] shadow-2xl border dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Review Import</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{data.length} entries detected</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Icons.X /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-4 pb-2">Date</th>
                <th className="px-4 pb-2">Show</th>
                <th className="px-4 pb-2">Position</th>
                <th className="px-4 pb-2">Times</th>
                <th className="px-4 pb-2">Hrs</th>
                <th className="px-4 pb-2">Guarantee</th>
                <th className="px-4 pb-2 text-right">Pay (G/N)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => (
                <tr key={i} className="group bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-2xl">
                  <td className="px-4 py-3 first:rounded-l-2xl">
                    <input type="text" value={e.date} onChange={(x) => updateRow(i, 'date', x.target.value)} className="bg-transparent font-bold text-xs w-24 outline-none border-b border-transparent focus:border-brand-500" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={e.show} onChange={(x) => updateRow(i, 'show', x.target.value)} className="bg-transparent font-bold text-xs w-full outline-none border-b border-transparent focus:border-brand-500" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={e.position} onChange={(x) => updateRow(i, 'position', x.target.value)} className="bg-transparent font-bold text-xs w-full outline-none border-b border-transparent focus:border-brand-500" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 font-bold text-xs">
                        <input type="text" value={e.startTime} onChange={(x) => updateRow(i, 'startTime', x.target.value)} className="bg-transparent w-10 outline-none border-b border-transparent focus:border-brand-500" />
                        <span>-</span>
                        <input type="text" value={e.endTime} onChange={(x) => updateRow(i, 'endTime', x.target.value)} className="bg-transparent w-10 outline-none border-b border-transparent focus:border-brand-500" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-xs text-slate-500">{e.hours.toFixed(1)}h</td>
                  <td className="px-4 py-3">
                     <select value={e.minPayType} onChange={(x) => updateRow(i, 'minPayType', x.target.value)} className="bg-transparent font-bold text-xs outline-none cursor-pointer">
                        {['8hr', '10hr', '12hr', 'unknown'].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                     </select>
                  </td>
                  <td className="px-4 py-3 last:rounded-r-2xl text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-emerald-500">{e.gross ? formatCurr(e.gross) : '—'}</span>
                      <span className="text-[10px] font-bold text-brand-500">{e.net ? formatCurr(e.net) : '—'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
           <button onClick={onClose} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
           <button 
            onClick={() => { onConfirm(data); onClose(); }} 
            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
          >
            Confirm & Import
          </button>
        </div>
      </div>
    </div>
  );
};
