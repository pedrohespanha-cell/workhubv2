import React from 'react';
import { Icons } from '../constants';
import { DashSettings, ProdSettings, Production } from '../types';

interface PayModalProps {
  isOpen: boolean;
  weekKey: string;
  showName: string;
  gross: string | number;
  net: string | number;
  setPayModal: (data: any) => void;
  submitMarkPaid: () => void;
}

export const PayModal: React.FC<PayModalProps> = ({ isOpen, weekKey, showName, gross, net, setPayModal, submitMarkPaid }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPayModal({ isOpen: false, weekKey: '', showName: '', gross: '', net: '' })}>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border dark:border-slate-700 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-black mb-2 tracking-tight">Mark Paid</h3>
        <p className="text-xs font-bold text-brand-500 mb-6 uppercase tracking-widest">{showName}</p>
        <div className="space-y-6">
          <div><label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Weekly Gross Pay</label><input type="number" step="0.01" value={gross} onChange={e => setPayModal((prev: any) => ({ ...prev, gross: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500" autoFocus /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Weekly Net Pay</label><input type="number" step="0.01" value={net} onChange={e => setPayModal((prev: any) => ({ ...prev, net: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 ring-brand-500" /></div>
        </div>
        <div className="flex gap-4 mt-10">
          <button onClick={() => setPayModal({ isOpen: false, weekKey: '', showName: '', gross: '', net: '' })} className="flex-1 py-4 border dark:border-slate-800 font-black rounded-2xl uppercase text-[10px]">Cancel</button>
          <button onClick={submitMarkPaid} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase text-[10px]">Distribute</button>
        </div>
      </div>
    </div>
  );
};

interface ProdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prodSettings: ProdSettings;
  saveProdSettings: (k: string, v: any) => void;
  allAvailableRoles: string[];
}

export const ProdSettingsModal: React.FC<ProdSettingsModalProps> = ({ isOpen, onClose, prodSettings, saveProdSettings, allAvailableRoles }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border dark:border-slate-700 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-2 tracking-tight">Show Details Settings</h3>
        <p className="text-xs text-slate-500 font-bold mb-6">Customize what appears on production cards.</p>

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {allAvailableRoles && allAvailableRoles.map(role => {
            const defaultVisible = ['Gaffer', 'Rigging Gaffer'];
            const isHidden = prodSettings.hiddenCrewRoles ? prodSettings.hiddenCrewRoles.includes(role) : !defaultVisible.includes(role);
            return (
              <label key={role} className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{role}</span>
                <input
                  type="checkbox"
                  checked={!isHidden}
                  onChange={e => {
                    const currentHidden = prodSettings.hiddenCrewRoles || allAvailableRoles.filter(r => !defaultVisible.includes(r));
                    if (e.target.checked) {
                      // Remove from hidden
                      saveProdSettings('hiddenCrewRoles', currentHidden.filter(r => r !== role));
                    } else {
                      // Add to hidden
                      if (!currentHidden.includes(role)) {
                        saveProdSettings('hiddenCrewRoles', [...currentHidden, role]);
                      }
                    }
                  }}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
              </label>
            );
          })}
          {(!allAvailableRoles || allAvailableRoles.length === 0) && (
            <p className="text-xs text-slate-400 font-bold italic text-center py-4">No specific roles extracted yet.</p>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-black rounded-2xl uppercase text-[10px] tracking-widest transition-transform hover:scale-105">Done</button>
      </div>
    </div>
  );
};

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashSettings: DashSettings;
  toggleDashSetting: (k: string) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
  setWipeModal: (type: string | null) => void;
  lastModified: string;
  lastBackup: string;
  apiStatus: boolean;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen, onClose, dashSettings, toggleDashSetting, theme, setTheme, accentColor, setAccentColor, setWipeModal, lastModified, lastBackup, apiStatus, onImport, onExport
}) => {
  const [dashOpen, setDashOpen] = React.useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm border dark:border-slate-700 shadow-2xl animate-slide-up relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2 shrink-0">
          <h3 className="text-2xl font-black tracking-tight">Settings</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:scale-110 transition-transform"><Icons.X /></button>
        </div>

        <div className="space-y-6 overflow-y-auto no-scrollbar pr-2 pb-6 flex-1">
          {/* Theme & Aesthetics */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-brand-500 tracking-widest border-b dark:border-slate-800 pb-2 mb-3 mt-2">Appearance</h4>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-colors ${theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                <Icons.Moon /> Light
              </button>
              <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-colors ${theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                <Icons.Moon /> Dark
              </button>
            </div>

            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Accent Color</label>
            <div className="flex gap-3 mt-1">
              {[
                { id: 'blue', color: 'bg-sky-500' },
                { id: 'emerald', color: 'bg-emerald-500' },
                { id: 'rose', color: 'bg-rose-500' },
                { id: 'purple', color: 'bg-purple-500' },
                { id: 'amber', color: 'bg-amber-500' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id)}
                  className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center transition-transform hover:scale-110 ${accentColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 ring-offset-white dark:ring-offset-slate-900 scale-110' : ''}`}
                >
                  {accentColor === c.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Dash Settings - Collapsible */}
          <div>
            <button
              onClick={() => setDashOpen(o => !o)}
              className="w-full flex items-center justify-between text-[10px] font-black uppercase text-brand-500 tracking-widest border-b dark:border-slate-800 pb-2 mb-3"
            >
              <span>Dashboard Views</span>
              <span className={`transition-transform duration-200 ${dashOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {dashOpen && (
              <div className="space-y-2">
                {[
                  { key: 'gross', label: 'Total Gross Pay' },
                  { key: 'net', label: 'Total Net Pay' },
                  { key: 'hourlyGross', label: 'Hourly Gross' },
                  { key: 'hourlyNet', label: 'Hourly Net' },
                  { key: 'actualHrs', label: 'Actual Hours Worked' },
                  { key: 'payableHrs', label: 'Payable Hours' },
                  { key: 'days', label: 'Total Days Worked' },
                  { key: 'shows', label: 'Total Shows Worked' },
                  { key: 'weeksWorked', label: 'Total Weeks Worked' },
                  { key: 'avgPerWeek', label: 'Average Per Week' },
                  { key: 'avgPerMonth', label: 'Average Per Month' },
                  { key: 'pending', label: 'Pending Cheques Warning' }
                ].map(opt => (
                  <label key={opt.key} className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-xs font-bold">{opt.label}</span>
                    <input type="checkbox" checked={(dashSettings as any)[opt.key]} onChange={() => toggleDashSetting(opt.key)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4" />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Data Management */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-brand-500 tracking-widest border-b dark:border-slate-800 pb-2 mb-3">Data Management</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <label className="cursor-pointer px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                <Icons.Upload /> Import
                <input type="file" className="hidden" accept=".csv" onChange={onImport} />
              </label>
              <button onClick={onExport} className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors flex items-center justify-center gap-2">
                <Icons.Chart /> Export
              </button>
            </div>

            <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest border-b dark:border-slate-800 pb-2 mb-3 mt-6">Danger Zone</h4>
            <div className="flex gap-2 mb-4">
              <button onClick={() => { onClose(); setWipeModal('entries'); }} className="flex-1 py-3 text-[10px] uppercase font-black tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl flex items-center justify-center gap-1 transition-colors"><Icons.Wipe /> Wipe Logs</button>
              <button onClick={() => { onClose(); setWipeModal('productions'); }} className="flex-1 py-3 text-[10px] uppercase font-black tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl flex items-center justify-center gap-1 transition-colors"><Icons.Wipe /> Wipe Shows</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border dark:border-slate-800/50 space-y-2 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Database Sync</span>
                <span className={`text-[10px] font-bold ${apiStatus ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {apiStatus ? 'Online (Firebase)' : 'Local Only'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Last Modified</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{lastModified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Last External Import</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{lastBackup}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800/50 mt-2">
                <span className="text-[10px] font-black uppercase text-slate-400">App Version</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 gap-1 flex items-center">v2.1.0 <span className="text-emerald-500 font-black ml-1">✓</span></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

interface WipeModalProps {
  wipeModal: string | null;
  setWipeModal: (val: string | null) => void;
  handleWipeDatabase: (type: string) => void;
}

export const WipeModal: React.FC<WipeModalProps> = ({ wipeModal, setWipeModal, handleWipeDatabase }) => {
  if (!wipeModal) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={() => setWipeModal(null)}>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm border dark:border-slate-800 text-center shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"><Icons.Trash /></div>
        <h3 className="text-2xl font-black mb-2">Wipe {wipeModal === 'productions' ? 'Shows' : 'Logs'}?</h3>
        <p className="text-sm text-slate-500 mb-8 font-bold">This action cannot be undone.</p>
        <div className="flex gap-4">
          <button onClick={() => setWipeModal(null)} className="flex-1 py-4 border dark:border-slate-800 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => handleWipeDatabase(wipeModal)} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-rose-500 transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  );
};

interface ViewingProdModalProps {
  viewingProd: Production | null;
  setViewingProd: (p: Production | null) => void;
  prodSettings: ProdSettings;
}

export const ViewingProdModal: React.FC<ViewingProdModalProps> = ({ viewingProd, setViewingProd, prodSettings }) => {
  if (!viewingProd) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center" onClick={() => setViewingProd(null)}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col border dark:border-slate-700 animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="relative p-6 md:p-8 shrink-0 bg-slate-50 dark:bg-slate-950 border-b dark:border-slate-800 overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-5 dark:opacity-[0.02] pointer-events-none">
            <Icons.Video />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block shadow-sm ${viewingProd.status === 'Rumoured' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'}`}>{viewingProd.tier || 'Standard'}</span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight pr-4">{viewingProd.name.replace('WRAPPED - ', '').replace('RUMOURED - ', '')}</h2>
              <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span> {viewingProd.dates || 'Dates TBA'}</p>
            </div>
            <button onClick={() => setViewingProd(null)} className="p-2 bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700 rounded-full hover:scale-110 transition-transform"><Icons.X /></button>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-8 no-scrollbar bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Company</p>
              <p className="font-bold text-sm">{viewingProd.company || 'See PDF/HTML'}</p>
            </div>
            <div className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Payroll Email</p>
              <a href={`mailto:${viewingProd.payroll}`} className="font-bold text-brand-500 break-all text-sm hover:underline">{viewingProd.payroll || '—'}</a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewingProd.prodEmail && (
              <div className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Production Office Email</p>
                <a href={`mailto:${viewingProd.prodEmail}`} className="font-bold text-brand-500 break-all text-sm hover:underline">{viewingProd.prodEmail}</a>
              </div>
            )}
            {viewingProd.phone && (
              <div className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Phone Number</p>
                <a href={`tel:${viewingProd.phone}`} className="font-bold text-brand-500 flex items-center gap-2 text-sm hover:underline">
                  <Icons.Phone /> {viewingProd.phone}
                </a>
              </div>
            )}
          </div>

          {viewingProd.address && (
            <div className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Production Address</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewingProd.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm hover:underline"
              >
                <Icons.MapPin /> {viewingProd.address}
              </a>
            </div>
          )}

          {(viewingProd.contractLink || viewingProd.callSheetLink) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingProd.contractLink && (
                <a href={viewingProd.contractLink} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between group">
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 mb-1 tracking-widest">Contract</p>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">View Document</p>
                  </div>
                  <Icons.Link />
                </a>
              )}
              {viewingProd.callSheetLink && (
                <a href={viewingProd.callSheetLink} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between group">
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 mb-1 tracking-widest">Call Sheet</p>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">View Document</p>
                  </div>
                  <Icons.Link />
                </a>
              )}
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-widest ml-1">Full Crew Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(viewingProd.crew || {}).map(([role, name]) => {
                return (
                  <div key={role} className={`flex flex-col p-4 rounded-2xl border shadow-sm transition-colors bg-white dark:bg-slate-900 dark:border-slate-800`}>
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[9px] font-black uppercase tracking-widest text-slate-400`}>{role}</span>
                    </div>
                    <span className="text-sm font-bold mt-1 truncate">{name}</span>
                  </div>
                )
              })}
              {Object.keys(viewingProd.crew || {}).length === 0 && <p className="text-sm text-slate-500 font-bold p-4 col-span-full text-center border border-dashed dark:border-slate-800 rounded-2xl">No crew details parsed.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
