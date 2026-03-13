import React from 'react';
import { Production, ProdSettings } from '../types';
import { Icons } from '../constants';

interface ProductionCardProps {
  p: Production;
  prodSettings: ProdSettings;
  onClick: () => void;
}

export const ProductionCard: React.FC<ProductionCardProps> = ({ p, prodSettings, onClick }) => {
  const isWrapped = p.status === 'Wrapped';
  const isRumoured = p.status === 'Rumoured';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden relative group cursor-pointer" onClick={onClick}>
      <div className="p-6 pb-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 self-start mb-3">
          {(!isRumoured || (isRumoured && p.tier !== 'Rumoured')) && (
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm ${isRumoured ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'}`}>{p.tier || 'Standard'}</span>
          )}
          {isWrapped && <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">Wrapped</span>}
          {isRumoured && <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">Rumoured</span>}
        </div>

        <h3 className={`font-black text-xl leading-tight mb-2 group-hover:text-brand-500 transition-colors ${isRumoured ? 'text-slate-500 italic' : ''}`}>{p.name.replace('WRAPPED - ', '').replace('RUMOURED - ', '')}</h3>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 bg-slate-50 dark:bg-slate-950 inline-block px-2 py-1 rounded-lg border dark:border-slate-800 self-start">{p.dates || 'Dates TBA'}</p>

        <div className="space-y-2 mt-auto">
          {(() => {
            const defaultVisible = ['Gaffer', 'Rigging Gaffer'];
            const crewEntries = Object.entries(p.crew || {}).filter(([role]) => {
              if (prodSettings.hiddenCrewRoles) {
                return !prodSettings.hiddenCrewRoles.includes(role);
              }
              return defaultVisible.includes(role);
            });
            if (crewEntries.length > 0) {
              return crewEntries.map(([role, name]) => (
                <div key={role}>
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-[9px] text-slate-400 font-black uppercase">{role}</p>
                  </div>
                  <p className="text-sm font-bold truncate">{name}</p>
                </div>
              ));
            } else {
              if (Object.keys(p.crew || {}).length === 0) {
                return <p className="text-xs text-slate-500 font-bold italic">No crew listed safely.</p>;
              }
              return <p className="text-xs text-slate-500 font-bold italic">Selected roles hidden.</p>;
            }
          })()}
        </div>
      </div>

      <div className="w-full py-4 border-t dark:border-slate-800 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-900/20 transition-colors">View Details</div>
    </div>
  );
};
