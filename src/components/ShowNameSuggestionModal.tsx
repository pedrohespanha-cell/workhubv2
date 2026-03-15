import React from 'react';
import { Icons } from '../constants';

interface ShowNameSuggestionModalProps {
  isOpen: boolean;
  typed: string;          // what the user typed
  suggestion: string;     // matched production name
  affectedCount: number;  // how many existing entries use `typed`
  onKeep: () => void;                   // keep as typed
  onApplyThis: () => void;              // fix just this entry
  onApplyAll: () => void;               // fix all existing entries too
  onClose: () => void;
}

export const ShowNameSuggestionModal: React.FC<ShowNameSuggestionModalProps> = ({
  isOpen,
  typed,
  suggestion,
  affectedCount,
  onKeep,
  onApplyThis,
  onApplyAll,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black tracking-tight">Did you mean…?</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Show name mismatch detected</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Icons.X /></button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 w-20 shrink-0">Typed</span>
            <span className="font-black text-slate-700 dark:text-slate-300 text-sm">"{typed}"</span>
          </div>
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-500 w-20 shrink-0">Suggested</span>
            <span className="font-black text-brand-600 dark:text-brand-400 text-sm">"{suggestion}"</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Apply to all existing + this */}
          {affectedCount > 0 && (
            <button
              onClick={onApplyAll}
              className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Use "{suggestion}" — update this + {affectedCount} existing {affectedCount === 1 ? 'entry' : 'entries'}
            </button>
          )}
          {/* Apply only to this entry */}
          <button
            onClick={onApplyThis}
            className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Use "{suggestion}" for this entry only
          </button>
          {/* Keep as typed */}
          <button
            onClick={onKeep}
            className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Keep "{typed}" as typed
          </button>
        </div>
      </div>
    </div>
  );
};
