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
  address?: string;
  phone?: string;
  contractLink?: string;
  callSheetLink?: string;
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
  weeksWorked: boolean;
  avgPerWeek: boolean;
  avgPerMonth: boolean;
  weekGross: boolean;
  weekNet: boolean;
  weekHourlyGross: boolean;
  weekHourlyNet: boolean;
  weekShows: boolean;
  weekPayableHrs: boolean;
  weekActualHrs: boolean;
}

export interface ProdSettings {
  showAllCrew?: boolean;
  hiddenCrewRoles?: string[];
}

