import React, { useState } from 'react';
import { Entry, Production } from '../types';
import { Icons } from '../constants';

interface BatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Entry>) => void;
  selectedCount: number;
  productions: Production[];
}

export const BatchEditModal: React.FC<BatchEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedCount,
  productions
}) => {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(['show']));
  const [values, setValues] = useState<Partial<Entry>>({
    show: '',
    position: 'Rigging LX',
    date: '',
    startTime: '07:00',
    endTime: '19:00',
    minPayType: 'unknown',
    notes: ''
  });

  if (!isOpen) return null;

  const toggleField = (f: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const fields = [
    { id: 'show', label: 'Production / Show' },
    { id: 'position', label: 'Position' },
    { id: 'date', label: 'Date' },
    { id: 'startTime', label: 'Start Time' },
    { id: 'endTime', label: 'End Time' },
    { id: 'minPayType', label: 'Guarantee Type' },
    { id: 'notes', label: 'Notes' },
  ];

  const handleApply = () => {
    const updates: Partial<Entry> = {};
    selectedFields.forEach(f => {
      (updates as any)[f] = (values as any)[f];
    });
    onSave(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Robust Batch Edit</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Applying to {selectedCount} entries</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Icons.X /></button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map(f => {
                const isSelected = selectedFields.has(f.id);
                return (
                  <div key={f.id} className={`p-5 rounded-3xl border-2 transition-all ${isSelected ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <label 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => toggleField(f.id)}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                          {isSelected && <Icons.Check />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {f.label}
                        </span>
                      </label>
                    </div>

                    <div className={!isSelected ? 'opacity-30 pointer-events-none grayscale' : ''}>
                      {f.id === 'show' ? (
                        <div className="relative group">
                          <select 
                            value={values.show} 
                            onChange={(e) => setValues({...values, show: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 focus:border-brand-500 outline-none transition-all font-bold text-sm appearance-none"
                          >
                            <option value="">Select Production...</option>
                            {productions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.Chevron /></div>
                        </div>
                      ) : f.id === 'date' ? (
                        <input 
                          type="date" 
                          value={values.date} 
                          onChange={(e) => setValues({...values, date: e.target.value})}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 focus:border-brand-500 outline-none transition-all font-bold text-sm"
                        />
                      ) : (f.id === 'startTime' || f.id === 'endTime') ? (
                        <input 
                          type="time" 
                          value={(values as any)[f.id]} 
                          onChange={(e) => setValues({...values, [f.id]: e.target.value})}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 focus:border-brand-500 outline-none transition-all font-bold text-sm"
                        />
                      ) : f.id === 'minPayType' ? (
                        <div className="relative group">
                          <select 
                            value={values.minPayType} 
                            onChange={(e) => setValues({...values, minPayType: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 focus:border-brand-500 outline-none transition-all font-bold text-sm appearance-none"
                          >
                            {['8hr', '10hr', '12hr', 'unknown'].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Icons.Chevron /></div>
                        </div>
                      ) : (
                        <input 
                          type="text"
                          value={(values as any)[f.id]} 
                          onChange={(e) => setValues({...values, [f.id]: e.target.value})}
                          placeholder={`Enter ${f.label.toLowerCase()}...`}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 focus:border-brand-500 outline-none transition-all font-bold text-sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex gap-3 shrink-0 pt-4 border-t dark:border-slate-800">
            <button onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button 
              onClick={handleApply}
              disabled={selectedFields.size === 0}
              className="flex-2 px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Update {selectedCount} Entries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
