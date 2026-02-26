export interface WagePeriod {
  start: string;
  end: string;
  idx: number;
}

export interface Production {
  id: string;
  name: string;
  company: string;
  prodEmail: string;
  payroll: string;
  crew: Record<string, string>;
  dates: string;
  tier: string;
  status: 'Active' | 'Wrapped' | 'Rumoured';
}

export interface Entry {
  id: number;
  date: string;
  show: string;
  position: string;
  startTime: string;
  endTime: string;
  notes: string;
  gross: number | '';
  net: number | '';
  hours: number;
  payableHours: number;
  minPayType: string;
  saveDefault?: boolean;
}

export interface DashSettings {
  gross: boolean;
  net: boolean;
  hourlyGross: boolean;
  hourlyNet: boolean;
  actualHrs: boolean;
  payableHrs: boolean;
  days: boolean;
  shows: boolean;
  pending: boolean;
  weekGross: boolean;
  weekNet: boolean;
  weekHourlyGross: boolean;
  weekHourlyNet: boolean;
  weekShows: boolean;
  weekPayableHrs: boolean;
  weekActualHrs: boolean;
}

export interface ProdSettings {
  role1: string;
  role2: string;
  showRates: boolean;
}
