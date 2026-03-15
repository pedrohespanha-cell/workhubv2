import React, { useState, useEffect } from 'react';
import { Entry, Production } from '../types';
import { Icons } from '../constants';

const DEFAULT_POSITIONS = ['Rigging LX', 'Shooting LX'];
const POSITIONS_KEY = 'pt_custom_positions';
function getAllPositions(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITIONS_KEY) || '[]');
    return [...new Set([...DEFAULT_POSITIONS, ...saved])];
  } catch { return DEFAULT_POSITIONS; }
}

interface BatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Entry>) => void;
  selectedEntries: Entry[];   // full entry objects for smart pre-population
  productions: Production[];
  allShowsList: string[];
}

/** Given an array of entries, return a Partial<Entry> with fields that are
 *  identical across ALL entries pre-populated, and undefined/empty otherwise. */
function detectCommonValues(entries: Entry[]): Partial<Entry> {
  if (!entries.length) return {};
  if (entries.length === 1) return { ...entries[0] };   // single entry → full populate

  const common: Partial<Entry> = {};
  const keys: (keyof Entry)[] = ['show', 'position', 'date', 'startTime', 'endTime', 'minPayType', 'notes', 'gross', 'net'];
  for (const key of keys) {
    const first = entries[0][key];
    if (entries.every(e => e[key] === first)) (common as any)[key] = first;
  }
  return common;
}

export const BatchEditModal: React.FC<BatchEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedEntries,
  productions,
  allShowsList,
}) => {
  const isSingle = selectedEntries.length === 1;
  const allPositions = getAllPositions();

  // Detect common values when modal opens / selection changes
  const [values, setValues] = useState<Partial<Entry>>({});
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    const common = detectCommonValues(selectedEntries);
    setValues({
      show: '',
      position: 'Rigging LX',
      date: '',
      startTime: '07:00',
      endTime: '19:00',
      minPayType: 'unknown',
      gross: '',
      net: '',
      notes: '',
      ...common,
    });
    // For single entry: select ALL fields. For multi: pre-select fields with common values.
    if (isSingle) {
      setSelectedFields(new Set(['show', 'position', 'date', 'startTime', 'endTime', 'minPayType', 'gross', 'net', 'notes']));
    } else {
      const preSelected = new Set<string>();
      Object.keys(common).forEach(k => {
        if (common[k as keyof Entry] !== undefined && common[k as keyof Entry] !== '') preSelected.add(k);
      });
      // Always allow editing; start with at least show selected
      if (!preSelected.size) preSelected.add('show');
      setSelectedFields(preSelected);
    }
  }, [isOpen, selectedEntries]);

  if (!isOpen) return null;

  const toggleField = (f: string) => {
    if (isSingle) return; // in single mode all fields always active
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const setVal = (key: string, val: any) => setValues(prev => ({ ...prev, [key]: val }));

  const handleApply = () => {
    const updates: Partial<Entry> = {};
    selectedFields.forEach(f => { (updates as any)[f] = (values as any)[f]; });
    onSave(updates);
    onClose();
  };

  const fields: { id: keyof Entry; label: string; type: 'text' | 'date' | 'time' | 'number' | 'select-show' | 'select-pos' | 'select-guarantee' | 'textarea' }[] = [
    { id: 'show',        label: 'Production / Show',  type: 'select-show' },
    { id: 'position',   label: 'Position',            type: 'select-pos' },
    { id: 'date',       label: 'Date',                type: 'date' },
    { id: 'startTime',  label: 'Start Time',          type: 'time' },
    { id: 'endTime',    label: 'End Time',             type: 'time' },
    { id: 'minPayType', label: 'Guarantee',            type: 'select-guarantee' },
    { id: 'gross',      label: 'Gross Pay ($)',        type: 'number' },
    { id: 'net',        label: 'Net Pay ($)',          type: 'number' },
    { id: 'notes',      label: 'Notes',               type: 'textarea' },
  ];

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 focus:border-brand-500 outline-none transition-all font-bold text-sm";

  const renderInput = (f: typeof fields[0]) => {
    const val = (values as any)[f.id] ?? '';
    switch (f.type) {
      case 'select-show':
        return (
          <select value={val} onChange={e => setVal(f.id, e.target.value)} className={inputCls}>
            <option value="">Select show...</option>
            {[...new Set([...allShowsList, ...productions.map(p => p.name)])].sort().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        );
      case 'select-pos':
        return (
          <select value={val} onChange={e => setVal(f.id, e.target.value)} className={inputCls}>
            {allPositions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        );
      case 'select-guarantee':
        return (
          <select value={val} onChange={e => setVal(f.id, e.target.value)} className={inputCls}>
            {['8hr', '10hr', '12hr', 'unknown'].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
          </select>
        );
      case 'date':
        return <input type="date" value={val} onChange={e => setVal(f.id, e.target.value)} className={inputCls} />;
      case 'time':
        return <input type="time" value={val} onChange={e => setVal(f.id, e.target.value)} className={inputCls} />;
      case 'number':
        return <input type="number" step="0.01" value={val} onChange={e => setVal(f.id, e.target.value)} placeholder="0.00" className={inputCls} />;
      case 'textarea':
        return <textarea value={val} onChange={e => setVal(f.id, e.target.value)} rows={2} placeholder="Notes..." className={`${inputCls} resize-none`} />;
      default:
        return <input type="text" value={val} onChange={e => setVal(f.id, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}...`} className={inputCls} />;
    }
  };

  const commonFields = !isSingle
    ? fields.filter(f => {
        const common = detectCommonValues(selectedEntries);
        return common[f.id] !== undefined;
      }).map(f => f.id)
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                {isSingle ? 'Edit Entry' : 'Batch Edit'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                {isSingle
                  ? 'All fields loaded from selected entry'
                  : `${selectedEntries.length} entries selected · check fields to update`}
              </p>
              {!isSingle && commonFields.length > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 mt-1">
                  ✓ {commonFields.length} common value{commonFields.length > 1 ? 's' : ''} detected and pre-filled
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Icons.X /></button>
          </div>

          {/* Fields */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => {
                const isSelected = isSingle || selectedFields.has(f.id);
                const isCommon = commonFields.includes(f.id);
                return (
                  <div key={f.id}
                    className={`p-5 rounded-3xl border-2 transition-all ${isSelected
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-500/5'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label
                        className={`flex items-center gap-3 ${!isSingle ? 'cursor-pointer' : ''} group`}
                        onClick={() => toggleField(f.id)}
                      >
                        {!isSingle && (
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                            {isSelected && <Icons.Check />}
                          </div>
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                          {f.label}
                          {isCommon && <span className="text-[8px] bg-brand-500/20 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full">COMMON</span>}
                        </span>
                      </label>
                    </div>
                    <div className={!isSelected ? 'opacity-30 pointer-events-none' : ''}>
                      {renderInput(f)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3 shrink-0 pt-4 border-t dark:border-slate-800">
            <button onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button
              onClick={handleApply}
              disabled={selectedFields.size === 0}
              className="flex-2 px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSingle ? 'Save Entry' : `Update ${selectedEntries.length} Entries`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
