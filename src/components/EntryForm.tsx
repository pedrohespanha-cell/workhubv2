import React, { useState } from 'react';
import { Entry } from '../types';
import { Icons } from '../constants';

// Default known positions
const DEFAULT_POSITIONS = ['Rigging LX', 'Shooting LX'];
const POSITIONS_KEY = 'pt_custom_positions';

function getSavedPositions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(POSITIONS_KEY) || '[]');
  } catch { return []; }
}

function savePosition(pos: string) {
  const current = getSavedPositions();
  if (!current.includes(pos)) {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify([...current, pos]));
  }
}

interface EntryFormProps {
  formData: Entry;
  setFormData: React.Dispatch<React.SetStateAction<Entry>>;
  isEditingEntry: boolean;
  isMobileFormOpen: boolean;
  setIsMobileFormOpen: (open: boolean) => void;
  allShowsList: string[];
  handleTsSubmit: (e: React.FormEvent) => void;
  autoCalculateGross: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  formData,
  setFormData,
  isEditingEntry,
  isMobileFormOpen,
  setIsMobileFormOpen,
  allShowsList,
  handleTsSubmit,
  autoCalculateGross
}) => {
  const [addingNewPos, setAddingNewPos] = useState(false);
  const [newPosInput, setNewPosInput] = useState('');

  const allPositions = [...new Set([...DEFAULT_POSITIONS, ...getSavedPositions()])];

  const handleShowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const defaults = JSON.parse(localStorage.getItem('pt_defaults') || '{}');
    setFormData(prev => ({
      ...prev,
      show: val,
      position: defaults[val]?.position || prev.position,
      minPayType: defaults[val]?.minPayType || prev.minPayType
    }));
  };

  const handlePositionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__add_new__') {
      setAddingNewPos(true);
      setNewPosInput('');
    } else {
      setFormData({ ...formData, position: val });
    }
  };

  const commitNewPosition = () => {
    const trimmed = newPosInput.trim();
    if (trimmed) {
      savePosition(trimmed);
      setFormData({ ...formData, position: trimmed });
    }
    setAddingNewPos(false);
    setNewPosInput('');
  };

  return (
    <div className={`lg:col-span-4 lg:sticky lg:top-24 ${isMobileFormOpen ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-4 flex items-center justify-center' : 'hidden lg:block'}`}>
      <form onSubmit={handleTsSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl overflow-hidden animate-slide-up lg:animate-none w-full max-w-md relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black text-xl tracking-tight">{isEditingEntry ? 'Edit Entry' : 'New Work Log'}</h3>
          {isMobileFormOpen && <button type="button" onClick={() => setIsMobileFormOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><Icons.X /></button>}
        </div>

        <div className="min-w-0">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Show / Production</label>
          <input type="text" required list="hints" value={formData.show} onChange={handleShowChange} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500" placeholder="Type show name..." />
          <datalist id="hints">{allShowsList.map(s => <option key={s} value={s} />)}</datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col min-w-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 text-center">Position</label>
            {addingNewPos ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  autoFocus
                  value={newPosInput}
                  onChange={e => setNewPosInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitNewPosition(); } if (e.key === 'Escape') { setAddingNewPos(false); } }}
                  placeholder="New position..."
                  className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500"
                />
                <button type="button" onClick={commitNewPosition} className="p-3 bg-brand-500 text-white rounded-2xl hover:bg-brand-600 transition-colors shrink-0">
                  <Icons.Plus />
                </button>
              </div>
            ) : (
              <select
                value={formData.position}
                onChange={handlePositionSelect}
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500"
              >
                {allPositions.map(p => <option key={p} value={p}>{p}</option>)}
                <option value="__add_new__">＋ Add New Position…</option>
              </select>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 text-center">Guarantee</label>
            <select value={formData.minPayType} onChange={e => setFormData({ ...formData, minPayType: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500">
              <option value="8hr">8h</option>
              <option value="10hr">10h</option>
              <option value="12hr">12h</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col min-w-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500" />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Start</label>
              <input type="time" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">End</label>
              <input type="time" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex flex-col min-w-0 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Gross ($)</label>
            <input type="number" step="0.01" value={formData.gross} onChange={e => setFormData({ ...formData, gross: e.target.value === '' ? '' : parseFloat(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 pr-10 rounded-2xl text-sm outline-none focus:ring-2 ring-emerald-500 font-bold" placeholder="0.00" />
            <button type="button" onClick={autoCalculateGross} className="absolute right-2 top-[26px] p-1.5 text-emerald-500 bg-emerald-500/10 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors" title="Auto-Calc Gross"><Icons.Zap /></button>
          </div>
          <div className="flex flex-col min-w-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Net ($)</label>
            <input type="number" step="0.01" value={formData.net} onChange={e => setFormData({ ...formData, net: e.target.value === '' ? '' : parseFloat(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-3 rounded-2xl text-sm outline-none focus:ring-2 ring-brand-500 font-bold" placeholder="0.00" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 ml-1 cursor-pointer" onClick={() => setFormData({ ...formData, saveDefault: !formData.saveDefault })}>
          <input type="checkbox" checked={formData.saveDefault} readOnly className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Save defaults for {formData.show || 'this show'}</span>
        </div>

        <button type="submit" className="w-full py-4 bg-brand-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px] mt-2">SAVE ENTRY</button>
      </form>
      {isMobileFormOpen && <div className="absolute inset-0 -z-10" onClick={() => setIsMobileFormOpen(false)}></div>}
    </div>
  );
};

