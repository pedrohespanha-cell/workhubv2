import React from 'react';
import { Production, ProdSettings } from '../types';
import { mapTierToStandard, getCurrentRate } from '../utils';
import { Icons } from '../constants';

interface ProductionCardProps {
  p: Production;
  prodSettings: ProdSettings;
  onClick: () => void;
}

export const ProductionCard: React.FC<ProductionCardProps> = ({ p, prodSettings, onClick }) => {
  const cleanTier = mapTierToStandard(p.tier);
  const isWrapped = p.status === 'Wrapped';
  const isRumoured = p.status === 'Rumoured';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden relative group cursor-pointer" onClick={onClick}>
      {isWrapped && <div className="absolute top-0 right-0 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Wrapped</div>}
      {isRumoured && <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Rumoured</div>}

      <div className="p-6 pb-4 flex-1 flex flex-col">
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block shadow-sm self-start ${isRumoured ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : cleanTier.includes('Feature') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : cleanTier.includes('Premium') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'}`}>{cleanTier}</span>
        <h3 className={`font-black text-xl leading-tight mb-2 group-hover:text-brand-500 transition-colors ${isRumoured ? 'text-slate-500' : ''}`}>{p.name.replace('WRAPPED - ', '').replace('RUMOURED - ', '')}</h3>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 bg-slate-50 dark:bg-slate-950 inline-block px-2 py-1 rounded-lg border dark:border-slate-800 self-start">{p.dates || 'Dates TBA'}</p>

        <div className="space-y-2 mt-auto">
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-[9px] text-slate-400 font-black uppercase">{prodSettings.role1}</p>
              {prodSettings.showRates && getCurrentRate(p.tier, prodSettings.role1) && <span className="text-[9px] font-black text-emerald-500">${getCurrentRate(p.tier, prodSettings.role1)}/hr</span>}
            </div>
            <p className="text-sm font-bold truncate">{p.crew?.[prodSettings.role1] || '—'}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-[9px] text-slate-400 font-black uppercase">{prodSettings.role2}</p>
              {prodSettings.showRates && getCurrentRate(p.tier, prodSettings.role2) && <span className="text-[9px] font-black text-emerald-500">${getCurrentRate(p.tier, prodSettings.role2)}/hr</span>}
            </div>
            <p className="text-sm font-bold truncate">{p.crew?.[prodSettings.role2] || '—'}</p>
          </div>
        </div>
      </div>

      <div className="w-full py-4 border-t dark:border-slate-800 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-900/20 transition-colors">View Details</div>
    </div>
  );
};
