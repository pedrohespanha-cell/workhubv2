import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously, User } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs, Firestore } from "firebase/firestore";

import { Entry, Production, DashSettings, ProdSettings } from './types';
import { Icons, DEFAULT_DASH_SETTINGS, POSITIONS } from './constants';
import { 
  getISOWeek, 
  calculateHours, 
  calculateOT, 
  formatCurr, 
  getWeekKey, 
  getWeekDateRange, 
  parseDates, 
  parseCSVLine, 
  getCurrentRate,
  mapTierToStandard
} from './utils';
import { parseHTMLText } from './htmlParser';
import { parsePDFFile } from './pdfParser';

import { StatGrid } from './components/StatGrid';
import { EntryForm } from './components/EntryForm';
import { WeeklyCard } from './components/WeeklyCard';
import { ProductionCard } from './components/ProductionCard';
import { PayModal, ProdSettingsModal, DashSettingsModal, WipeModal, ViewingProdModal } from './components/Modals';

const App: React.FC = () => {
  // Firebase State
  const [fbInitialized, setFbInitialized] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appId, setAppId] = useState('default-app-id');

  // App State
  const [entries, setEntries] = useState<Entry[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mainMode, setMainMode] = useState<'timesheets' | 'productions' | 'reports'>('timesheets');
  const [prodTab, setProdTab] = useState<'dashboard' | 'import'>('dashboard');
  
  // UI State
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [payModal, setPayModal] = useState({ isOpen: false, weekKey: '', showName: '', gross: '' as string | number, net: '' as string | number });
  const [viewingProd, setViewingProd] = useState<Production | null>(null);
  const [wipeModal, setWipeModal] = useState<string | null>(null); 
  
  // Productions Tab States
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodFilter, setProdFilter] = useState('All'); 
  const [prodSort, setProdSort] = useState({ key: 'startDate', dir: 'asc' }); 
  const [prodViewMode, setProdViewMode] = useState<'card' | 'list'>('card'); 
  const [isProdSettingsOpen, setIsProdSettingsOpen] = useState(false);
  const [prodSettings, setProdSettings] = useState<ProdSettings>({ role1: 'Gaffer', role2: 'Rigging Gaffer', showRates: true });
  
  // Log Tab States
  const [globalFilter, setGlobalFilter] = useState('All'); 
  const [formData, setFormData] = useState<Entry>({ id: 0, date: new Date().toISOString().split('T')[0], show: '', position: 'Rigging LX', startTime: '07:00', endTime: '19:00', notes: '', gross: '', net: '', minPayType: '12hr', saveDefault: true, hours: 0, payableHours: 0 });
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [dashSettings, setDashSettings] = useState<DashSettings>(DEFAULT_DASH_SETTINGS);
  const [isDashSettingsOpen, setIsDashSettingsOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedProdSettings = localStorage.getItem('pt_prod_settings');
    if (savedProdSettings) setProdSettings(JSON.parse(savedProdSettings));
    
    const savedDashSettings = localStorage.getItem('pt_dash_settings');
    if (savedDashSettings) setDashSettings({ ...DEFAULT_DASH_SETTINGS, ...JSON.parse(savedDashSettings) });

    const savedTimes = JSON.parse(localStorage.getItem('pt_last_times') || '{"start":"07:00", "end":"19:00"}');
    setFormData(prev => ({ ...prev, startTime: savedTimes.start, endTime: savedTimes.end }));

    const handleFbLoad = async () => {
      try {
        // In AI Studio, environment variables are available via process.env
        const firebaseConfig = {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID
        };
        
        if (!firebaseConfig.projectId) {
          setFbInitialized(true);
          return;
        }

        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        
        setAuth(authInstance);
        setDb(dbInstance);
        setAppId(process.env.APP_ID || 'default-app-id');

        // Handle anonymous sign-in for simplicity if no token provided
        await signInAnonymously(authInstance);

        onAuthStateChanged(authInstance, (u) => {
          setUser(u);
          setFbInitialized(true);
        });
      } catch (e) {
        console.error("Firebase init failed, falling back to local storage.", e);
        setFbInitialized(true);
      }
    };

    handleFbLoad();
  }, []);

  useEffect(() => {
    if (!fbInitialized) return;
    if (!user || !db) {
      const e = localStorage.getItem('pt_entries'); if (e) setEntries(JSON.parse(e));
      const p = localStorage.getItem('pt_prods'); if (p) setProductions(JSON.parse(p));
      return;
    }

    const unsub1 = onSnapshot(
      collection(db, 'artifacts', appId, 'users', user.uid, 'entries'), 
      (s) => setEntries(s.docs.map(d => ({ ...d.data(), id: Number(d.id) } as Entry))),
      (err) => console.error("Entries listener error", err)
    );
    
    const unsub2 = onSnapshot(
      collection(db, 'artifacts', appId, 'users', user.uid, 'productions'), 
      (s) => setProductions(s.docs.map(d => ({ ...d.data(), id: d.id } as Production))),
      (err) => console.error("Productions listener error", err)
    );

    return () => { unsub1(); unsub2(); };
  }, [fbInitialized, user, db, appId]);

  useEffect(() => {
    if (!db) {
      localStorage.setItem('pt_entries', JSON.stringify(entries));
      localStorage.setItem('pt_prods', JSON.stringify(productions));
    }
  }, [entries, productions, db]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  function showStatus(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  }

  const autoCalculateGross = () => {
    if (!formData.show || !formData.position || !formData.date) {
      showStatus("Need Show, Date, and Position to calc.");
      return;
    }

    const prod = productions.find(p => p.name === formData.show);
    if (!prod) {
      showStatus("Show not in database. Cannot calc tier.");
      return;
    }

    const rate = getCurrentRate(prod.tier, formData.position);
    if (!rate) {
      showStatus(`No rate found for ${mapTierToStandard(prod.tier)} - ${formData.position}`);
      return;
    }

    const h = calculateHours(formData.startTime, formData.endTime);
    const ph = calculateOT(h, formData.minPayType);
    
    setFormData(prev => ({ ...prev, gross: (ph * rate).toFixed(2) as any }));
    showStatus(`Auto-calculated at $${rate}/hr`);
  };

  const saveProductions = async (newProds: Production[]) => {
    if (!db || !user) {
      setProductions(newProds);
      return;
    }
    const oldDocs = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'productions'));
    const batch = writeBatch(db);
    oldDocs.forEach(d => batch.delete(d.ref));
    newProds.forEach(p => {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'productions', p.id);
      batch.set(docRef, p);
    });
    await batch.commit();
  };

  const handleHTMLImport = () => {
    if (!scratchpadText) return;
    const parsed = parseHTMLText(scratchpadText);
    saveProductions(parsed);
    setScratchpadText('');
    showStatus(`Successfully parsed ${parsed.length} productions!`);
    setProdTab('dashboard');
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    showStatus('Parsing PDF Offline...');
    try {
      const parsed = await parsePDFFile(file);
      saveProductions(parsed);
      showStatus(`Successfully parsed ${parsed.length} productions!`);
      setProdTab('dashboard');
    } catch (err) {
      console.error(err);
      showStatus('Error parsing PDF.');
    }
  };

  const handleWipeDatabase = async (type: string) => {
    if (!db || !user) {
      if (type === 'productions') setProductions([]);
      if (type === 'entries') setEntries([]);
    } else {
      const coll = collection(db, 'artifacts', appId, 'users', user.uid, type);
      const snapshot = await getDocs(coll);
      const batch = writeBatch(db);
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    setWipeModal(null);
    showStatus(`${type === 'productions' ? 'Shows' : 'Logs'} cleared.`);
  };

  const allShowsList = useMemo(() => [...new Set(productions.map(p => p.name).filter(Boolean))].sort(), [productions]);
  
  const allAvailableRoles = useMemo(() => {
    const roles = new Set<string>();
    productions.forEach(p => {
      Object.keys(p.crew || {}).forEach(r => roles.add(r));
    });
    return Array.from(roles).sort();
  }, [productions]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    return entries.filter(e => {
      const d = new Date(e.date + 'T12:00:00');
      if (globalFilter === 'All') return true;
      if (globalFilter === 'Year') return d.getFullYear() === now.getFullYear();
      if (globalFilter === 'Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (globalFilter === 'Week') return getISOWeek(d) === getISOWeek(now) && d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [entries, globalFilter]);

  const stats = useMemo(() => {
    let g = 0, n = 0, actualH = 0, payableH = 0;
    const weekShowCombos: Record<string, { hasPay: boolean }> = {};
    const daysSet = new Set();
    const showsSet = new Set();
    
    filteredEntries.forEach(e => {
      g += parseFloat(e.gross as string) || 0;
      n += parseFloat(e.net as string) || 0;
      actualH += e.hours || 0; 
      payableH += e.payableHours || 0;
      daysSet.add(e.date);
      if (e.show) showsSet.add(e.show);
      
      const wsKey = `${getWeekKey(e.date)}_${e.show}`;
      if (!weekShowCombos[wsKey]) weekShowCombos[wsKey] = { hasPay: false };
      if (e.gross || e.net) weekShowCombos[wsKey].hasPay = true;
    });

    const pendingChecks = Object.values(weekShowCombos).filter(c => !c.hasPay).length;

    return { 
      gross: g, 
      net: n, 
      actualHours: actualH, 
      payableHours: payableH,
      days: daysSet.size,
      shows: showsSet.size,
      pending: pendingChecks, 
      avgG: actualH ? g / actualH : 0, 
      avgN: actualH ? n / actualH : 0 
    };
  }, [filteredEntries]);

  const monthlyReports = useMemo(() => {
    const months: Record<string, any> = {};
    entries.forEach(e => {
      const mKey = e.date.substring(0, 7);
      if (!months[mKey]) months[mKey] = { g: 0, n: 0, actualH: 0, payableH: 0, shows: new Set(), days: new Set(), weekShows: {} };
      
      months[mKey].g += parseFloat(e.gross as string) || 0;
      months[mKey].n += parseFloat(e.net as string) || 0;
      months[mKey].actualH += e.hours || 0;
      months[mKey].payableH += e.payableHours || 0;
      months[mKey].days.add(e.date);
      if (e.show) months[mKey].shows.add(e.show);

      const wsKey = `${getWeekKey(e.date)}_${e.show}`;
      if (!months[mKey].weekShows[wsKey]) months[mKey].weekShows[wsKey] = { hasPay: false };
      if (e.gross || e.net) months[mKey].weekShows[wsKey].hasPay = true;
    });
    
    return Object.entries(months).map(([m, d]) => {
      const pending = Object.values(d.weekShows).filter((c: any) => !c.hasPay).length;
      return [m, { ...d, pending }];
    }).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  const weeklyGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredEntries.forEach(e => {
      const wKey = getWeekKey(e.date);
      if (!groups[wKey]) groups[wKey] = { shows: {}, th: 0, tph: 0, tg: 0, tn: 0, days: new Set(), sNames: new Set() };
      if (!groups[wKey].shows[e.show]) groups[wKey].shows[e.show] = { entries: [], g: 0, n: 0, actualH: 0, payableH: 0 };
      
      groups[wKey].shows[e.show].entries.push(e);
      groups[wKey].shows[e.show].g += parseFloat(e.gross as string) || 0;
      groups[wKey].shows[e.show].n += parseFloat(e.net as string) || 0;
      groups[wKey].shows[e.show].actualH += e.hours || 0;
      groups[wKey].shows[e.show].payableH += e.payableHours || 0;
      
      groups[wKey].th += e.hours || 0;
      groups[wKey].tph += e.payableHours || 0;
      groups[wKey].tg += parseFloat(e.gross as string) || 0;
      groups[wKey].tn += parseFloat(e.net as string) || 0;
      groups[wKey].days.add(e.date);
      if (e.show) groups[wKey].sNames.add(e.show);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredEntries]);

  const handleProdSort = (key: string) => {
    setProdSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedProductions = useMemo(() => {
    let prods = productions
      .filter(p => prodFilter === 'All' || p.status === prodFilter)
      .filter(p => p.name.toLowerCase().includes(prodSearchQuery.toLowerCase()) || JSON.stringify(p.crew).toLowerCase().includes(prodSearchQuery.toLowerCase()));
    
    prods.sort((a, b) => {
      let valA: any, valB: any;
      if (prodSort.key === 'name') { valA = a.name; valB = b.name; }
      else if (prodSort.key === 'startDate') { valA = parseDates(a.dates).start; valB = parseDates(b.dates).start; }
      else if (prodSort.key === 'endDate') { valA = parseDates(a.dates).end; valB = parseDates(b.dates).end; }
      else if (prodSort.key === 'role1') { valA = a.crew?.[prodSettings.role1] || ''; valB = b.crew?.[prodSettings.role1] || ''; }
      else if (prodSort.key === 'role2') { valA = a.crew?.[prodSettings.role2] || ''; valB = b.crew?.[prodSettings.role2] || ''; }
      else if (prodSort.key === 'tier') { valA = mapTierToStandard(a.tier); valB = mapTierToStandard(b.tier); }
      
      if (valA < valB) return prodSort.dir === 'asc' ? -1 : 1;
      if (valA > valB) return prodSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return prods;
  }, [productions, prodFilter, prodSearchQuery, prodSort, prodSettings]);

  async function handleTsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = calculateHours(formData.startTime, formData.endTime);
    const ph = calculateOT(h, formData.minPayType);
    const ent: Entry = { ...formData, id: isEditingEntry ? formData.id : Date.now(), hours: h, payableHours: ph, gross: formData.gross === '' ? '' : parseFloat(formData.gross as string), net: formData.net === '' ? '' : parseFloat(formData.net as string) };
    
    if (formData.saveDefault) {
      const defaults = JSON.parse(localStorage.getItem('pt_defaults') || '{}');
      defaults[formData.show] = { position: formData.position, minPayType: formData.minPayType };
      localStorage.setItem('pt_defaults', JSON.stringify(defaults));
    }

    localStorage.setItem('pt_last_times', JSON.stringify({ start: formData.startTime, end: formData.endTime }));

    if (!db || !user) {
      setEntries(prev => isEditingEntry ? prev.map(x => x.id === ent.id ? ent : x) : [...prev, ent]);
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'entries', String(ent.id)), ent);
    }
    setIsEditingEntry(false); setIsMobileFormOpen(false);
    setFormData(prev => ({ ...prev, id: 0, gross: '', net: '', notes: '' }));
    showStatus('Entry Saved!');
  }

  async function handleTsDelete(id: number) {
    if (!db || !user) setEntries(prev => prev.filter(e => e.id !== id));
    else await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'entries', String(id)));
  }

  async function submitMarkPaid() {
    const group = weeklyGroups.find(g => g[0] === payModal.weekKey);
    if (!group) return;
    const wData = group[1].shows[payModal.showName];
    const count = wData.entries.length;
    if (count === 0) return;
    const gSplit = (parseFloat(payModal.gross as string) || 0) / count;
    const nSplit = (parseFloat(payModal.net as string) || 0) / count;
    
    if (!db || !user) {
      setEntries(prev => prev.map(e => wData.entries.find((x: Entry) => x.id === e.id) ? { ...e, gross: gSplit, net: nSplit } : e));
    } else {
      const batch = writeBatch(db);
      wData.entries.forEach((e: Entry) => {
        const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'entries', String(e.id));
        batch.set(ref, { ...e, gross: gSplit, net: nSplit }, { merge: true });
      });
      await batch.commit();
    }
    setPayModal({ isOpen: false, weekKey: '', showName: '', gross: '', net: '' });
    showStatus('Pay Applied!');
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const result = evt.target?.result;
      if (typeof result !== 'string') return;
      const lines = result.split('\n').filter(l => l.trim() !== '');
      const batch: Entry[] = [];
      for (let i = 1; i < lines.length; i++) {
        const p = parseCSVLine(lines[i]);
        if (p.length >= 8) {
          const h = parseFloat(p[8]) || 0;
          batch.push({ 
            id: Date.now() + i, 
            date: p[0], 
            show: p[1], 
            position: p[2], 
            startTime: p[3], 
            endTime: p[4], 
            notes: p[5], 
            gross: p[6] ? parseFloat(p[6]) : '', 
            net: p[7] ? parseFloat(p[7]) : '', 
            hours: h, 
            payableHours: calculateOT(h, p[9]), 
            minPayType: p[9] || '' 
          });
        }
      }
      if (!db || !user) {
        setEntries(prev => [...prev, ...batch]);
      } else {
        const b = writeBatch(db);
        batch.forEach(x => {
          const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'entries', String(x.id));
          b.set(ref, x);
        });
        await b.commit();
      }
      showStatus(`Imported ${batch.length} entries!`);
    };
    reader.readAsText(file);
  };

  const handleCSVExport = () => {
    if (entries.length === 0) {
      showStatus('No entries to export.');
      return;
    }
    const headers = ["Date", "Show", "Position Type", "Start Time", "End Time", "Notes", "Gross Pay", "Net Pay", "Hours", "Min Pay Type"];
    const rows = entries.map(e => [
      e.date, `"${e.show || ''}"`, `"${e.position || ''}"`, e.startTime, e.endTime, `"${e.notes || ''}"`,
      e.gross || '', e.net || '', e.hours || '', e.minPayType || ''
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Exported successfully!');
  };

  const saveProdSettings = (k: string, v: any) => {
    const newSet = { ...prodSettings, [k]: v };
    setProdSettings(newSet);
    localStorage.setItem('pt_prod_settings', JSON.stringify(newSet));
  };
  
  const toggleDashSetting = (k: string) => {
    const newSet = { ...dashSettings, [k]: !(dashSettings as any)[k] };
    setDashSettings(newSet);
    localStorage.setItem('pt_dash_settings', JSON.stringify(newSet));
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (prodSort.key !== col) return <span className="opacity-0 group-hover:opacity-30 ml-1"><Icons.ArrowDown /></span>;
    return <span className="text-brand-500 ml-1">{prodSort.dir === 'asc' ? <Icons.ArrowUp /> : <Icons.ArrowDown />}</span>;
  };

  return (
    <div className="w-full min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
      
      {statusMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full font-black tracking-widest text-[10px] uppercase shadow-2xl animate-in fade-in slide-in-from-top-4">
          {statusMsg}
        </div>
      )}

      <nav className="border-b dark:border-slate-800 border-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-xl text-white shadow-lg"><Icons.Video /></div>
            <h1 className="text-xl font-black tracking-tighter uppercase hidden sm:block italic">Work<span className="text-brand-500">Hub</span></h1>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 shrink-0">
            <button onClick={() => setMainMode('timesheets')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${mainMode === 'timesheets' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-md' : 'text-slate-500'}`}>Log</button>
            <button onClick={() => setMainMode('productions')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${mainMode === 'productions' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-md' : 'text-slate-500'}`}>Shows</button>
            <button onClick={() => setMainMode('reports')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${mainMode === 'reports' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-md' : 'text-slate-500'}`}>Reports</button>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-400"><Icons.Moon /></button>
        </div>
      </nav>

      {mainMode === 'timesheets' && (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
          <button onClick={() => setIsMobileFormOpen(true)} className="lg:hidden fixed bottom-8 right-8 w-16 h-16 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform border-4 border-white dark:border-slate-900"><Icons.Plus /></button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <EntryForm 
              formData={formData}
              setFormData={setFormData}
              isEditingEntry={isEditingEntry}
              isMobileFormOpen={isMobileFormOpen}
              setIsMobileFormOpen={setIsMobileFormOpen}
              allShowsList={allShowsList}
              handleTsSubmit={handleTsSubmit}
              autoCalculateGross={autoCalculateGross}
            />

            <div className="lg:col-span-8 space-y-6 pb-24">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {['All', 'Year', 'Month', 'Week'].map(f => (
                    <button key={f} onClick={() => setGlobalFilter(f)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${globalFilter === f ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>{f === 'All' ? 'All Time' : `This ${f}`}</button>
                  ))}
                </div>
                <div className="flex gap-2 shrink-0 items-center">
                  <label className="cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    Import
                    <input type="file" className="hidden" accept=".csv" onChange={handleCSVUpload} />
                  </label>
                  <button onClick={handleCSVExport} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors flex items-center gap-2">
                    Export
                  </button>
                  <button onClick={() => setIsDashSettingsOpen(true)} className="p-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-slate-500 hover:text-brand-500 transition-colors shrink-0 ml-2"><Icons.Settings /></button>
                </div>
              </div>

              <StatGrid sourceData={stats} dashSettings={dashSettings} />

              <div className="space-y-6">
                {weeklyGroups.length === 0 ? (
                  <div className="text-center p-12 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed dark:border-slate-800"><p className="text-slate-500 font-bold">No logs found for this filter.</p></div>
                ) : weeklyGroups.map(([wKey, wData]) => (
                  <WeeklyCard 
                    key={wKey}
                    wKey={wKey}
                    wData={wData}
                    isExpanded={expandedWeeks[wKey]}
                    toggleExpanded={() => setExpandedWeeks(p => ({ ...p, [wKey]: !p[wKey] }))}
                    dashSettings={dashSettings}
                    onEdit={(e) => { setFormData({ ...e, saveDefault: true }); setIsEditingEntry(true); setIsMobileFormOpen(true); }}
                    onDelete={handleTsDelete}
                    onApplyPay={(wk, sn, g, n) => setPayModal({ isOpen: true, weekKey: wk, showName: sn, gross: g, net: n })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {mainMode === 'productions' && (
        <div className="animate-in fade-in duration-300">
          <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-14 z-30">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center overflow-x-auto no-scrollbar">
              <div className="flex gap-4">
                {['dashboard', 'import'].map(t => (
                  <button key={t} onClick={() => setProdTab(t as any)} className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-colors shrink-0 ${prodTab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500'}`}>{t}</button>
                ))}
              </div>
              <button onClick={() => setWipeModal('productions')} className="text-[9px] uppercase font-black tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 ml-4"><Icons.Wipe /> Wipe Shows</button>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 py-8">
            {prodTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 shadow-sm">
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {['All', 'Active', 'Wrapped', 'Rumoured'].map(f => (
                      <button key={f} onClick={() => setProdFilter(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 md:flex-none ${prodFilter === f ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>{f}</button>
                    ))}
                  </div>
                  <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                    <div className="relative flex-1 md:w-48">
                      <span className="absolute left-3 top-2.5 text-slate-400"><Icons.Search /></span>
                      <input type="text" placeholder="Search..." value={prodSearchQuery} onChange={e => setProdSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 ring-brand-500" />
                    </div>
                    <div className="flex bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl p-1 shrink-0">
                      <button onClick={() => setProdViewMode('card')} className={`p-1.5 rounded-lg transition-colors ${prodViewMode === 'card' ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' : 'text-slate-400'}`}><Icons.Grid /></button>
                      <button onClick={() => setProdViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${prodViewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' : 'text-slate-400'}`}><Icons.List /></button>
                    </div>
                    <button onClick={() => setIsProdSettingsOpen(true)} className="p-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl text-slate-500 hover:text-brand-500 transition-colors shrink-0 ml-2"><Icons.Settings /></button>
                  </div>
                </div>

                {prodViewMode === 'card' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                    {sortedProductions.map(p => (
                      <ProductionCard key={p.id} p={p} prodSettings={prodSettings} onClick={() => setViewingProd(p)} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 overflow-hidden shadow-sm pb-24">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800 group">
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleProdSort('name')}>
                              <div className="flex items-center">Production <SortIcon col="name" /></div>
                            </th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleProdSort('startDate')}>
                              <div className="flex items-center">Start Date <SortIcon col="startDate" /></div>
                            </th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleProdSort('endDate')}>
                              <div className="flex items-center">End Date <SortIcon col="endDate" /></div>
                            </th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleProdSort('role1')}>
                              <div className="flex items-center">{prodSettings.role1} <SortIcon col="role1" /></div>
                            </th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleProdSort('role2')}>
                              <div className="flex items-center">{prodSettings.role2} <SortIcon col="role2" /></div>
                            </th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleProdSort('tier')}>
                              <div className="flex items-center">Tier <SortIcon col="tier" /></div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedProductions.map(p => {
                            const dates = parseDates(p.dates);
                            return (
                              <tr key={p.id} onClick={() => setViewingProd(p)} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold group-hover:text-brand-500 transition-colors">{p.name.replace('WRAPPED - ', '').replace('RUMOURED - ', '')}</span>
                                    {p.status === 'Wrapped' && <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-black">Wrapped</span>}
                                    {p.status === 'Rumoured' && <span className="text-[8px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded uppercase font-black">Rumoured</span>}
                                  </div>
                                </td>
                                <td className="p-4 text-xs font-bold text-slate-500">{dates.start.getFullYear() < 2100 ? dates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</td>
                                <td className="p-4 text-xs font-bold text-slate-500">{dates.end.getFullYear() < 2100 ? dates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</td>
                                <td className="p-4 text-sm">
                                  {p.crew?.[prodSettings.role1] || '—'}
                                  {prodSettings.showRates && getCurrentRate(p.tier, prodSettings.role1) && <span className="text-[9px] font-black text-emerald-500 ml-2">${getCurrentRate(p.tier, prodSettings.role1)}</span>}
                                </td>
                                <td className="p-4 text-sm">
                                  {p.crew?.[prodSettings.role2] || '—'}
                                  {prodSettings.showRates && getCurrentRate(p.tier, prodSettings.role2) && <span className="text-[9px] font-black text-emerald-500 ml-2">${getCurrentRate(p.tier, prodSettings.role2)}</span>}
                                </td>
                                <td className="p-4">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border dark:border-slate-700 ${p.status === 'Rumoured' ? 'text-slate-400' : mapTierToStandard(p.tier).includes('Feature') ? 'text-purple-600 dark:text-purple-400' : 'text-brand-600 dark:text-brand-400'}`}>{mapTierToStandard(p.tier)}</span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            {prodTab === 'import' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-500"></div>
                  <div className="p-6 bg-brand-500/10 text-brand-500 rounded-full mb-6"><Icons.Upload /></div>
                  <h3 className="font-black text-2xl mb-2">Import from HTML</h3>
                  <p className="text-xs text-slate-500 mb-6 font-bold max-w-sm">Right-click the webpage, view source, copy all, and paste below. Highly reliable offline parsing.</p>
                  <textarea value={scratchpadText} onChange={e => setScratchpadText(e.target.value)} placeholder="<!DOCTYPE html>..." className="w-full h-32 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 p-4 rounded-3xl text-xs font-mono outline-none focus:ring-2 ring-brand-500 mb-4" />
                  <button onClick={handleHTMLImport} className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-500 transition-colors">Process HTML</button>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                  <div className="p-6 bg-rose-500/10 text-rose-500 rounded-full mb-6"><Icons.Upload /></div>
                  <h3 className="font-black text-2xl mb-2">Import from PDF</h3>
                  <p className="text-xs text-slate-500 mb-8 font-bold max-w-sm">Upload the official PDF export. This uses a strict offline regex parser for fast results.</p>
                  <label className="w-full py-4 bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl cursor-pointer hover:bg-rose-500 transition-colors block text-center">
                    Select PDF File
                    <input type="file" className="hidden" accept="application/pdf" onChange={handlePDFUpload} />
                  </label>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {mainMode === 'reports' && (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3"><Icons.Chart /> Monthly Efficiency</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDashSettingsOpen(true)} className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-sm rounded-xl text-slate-500 hover:text-brand-500 transition-colors shrink-0"><Icons.Settings /></button>
              <button onClick={() => setWipeModal('entries')} className="text-[9px] uppercase font-black tracking-widest text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg flex items-center gap-1"><Icons.Wipe /> Wipe Logs</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {monthlyReports.map(([m, d]) => (
              <div key={m} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-xl capitalize">{new Date(m + '-02T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
                </div>
                
                <div className="flex-1 mb-6">
                  <StatGrid sourceData={d} dashSettings={dashSettings} />
                </div>
                
                <div className="pt-4 border-t dark:border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {[...d.shows].map(s => <span key={s} className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PayModal 
        isOpen={payModal.isOpen} 
        weekKey={payModal.weekKey} 
        showName={payModal.showName} 
        gross={payModal.gross} 
        net={payModal.net} 
        setPayModal={setPayModal} 
        submitMarkPaid={submitMarkPaid} 
      />
      <ProdSettingsModal 
        isOpen={isProdSettingsOpen} 
        onClose={() => setIsProdSettingsOpen(false)} 
        prodSettings={prodSettings} 
        saveProdSettings={saveProdSettings} 
        allAvailableRoles={allAvailableRoles} 
      />
      <DashSettingsModal 
        isOpen={isDashSettingsOpen} 
        onClose={() => setIsDashSettingsOpen(false)} 
        dashSettings={dashSettings} 
        toggleDashSetting={toggleDashSetting} 
      />
      <WipeModal 
        wipeModal={wipeModal} 
        setWipeModal={setWipeModal} 
        handleWipeDatabase={handleWipeDatabase} 
      />
      <ViewingProdModal 
        viewingProd={viewingProd} 
        setViewingProd={setViewingProd} 
        prodSettings={prodSettings} 
      />
    </div>
  );
};

export default App;
