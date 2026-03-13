import React from 'react';
import { Icons } from '../constants';

interface SortFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalFilter: string;
  setGlobalFilter: (f: string) => void;
  showFilter: string;
  setShowFilter: (f: string) => void;
  pendingFilter: boolean;
  setPendingFilter: (p: boolean) => void;
  allShowsList: string[];
}

export const SortFilterModal: React.FC<SortFilterModalProps> = ({
  isOpen,
  onClose,
  globalFilter,
  setGlobalFilter,
  showFilter,
  setShowFilter,
  pendingFilter,
  setPendingFilter,
  allShowsList
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight">Sort & Filter</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Icons.X /></button>
          </div>

          <div className="space-y-8">
            {/* Time Filter */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Time Period</label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Year', 'Month', 'Week'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setGlobalFilter(f)} 
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${globalFilter === f ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {f === 'All' ? 'All Time' : `This ${f}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Filter */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Filter by Show</label>
              <div className="relative">
                <select 
                  value={showFilter} 
                  onChange={(e) => setShowFilter(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 focus:border-brand-500 outline-none transition-all font-bold text-sm appearance-none"
                >
                  <option value="All">All Shows</option>
                  {allShowsList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.Chevron /></div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</p>
                <p className="text-xs font-bold mt-1">Show Pending Pay Only</p>
              </div>
              <button 
                onClick={() => setPendingFilter(!pendingFilter)}
                className={`w-12 h-6 rounded-full transition-colors relative ${pendingFilter ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pendingFilter ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 py-5 bg-brand-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
