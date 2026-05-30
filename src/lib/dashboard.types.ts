export interface AllocationItem {
  key: string;
  label?: string;
  valueRub: number;
  percent: number;
}

export interface AssetItem {
  ticker: string;
  name: string;
  instrumentType: string;
  valueRub: number;
  percent: number;
}

export interface AssetsAllocation {
  totalValueRub: number;
  items: AssetItem[];
  byType: AllocationItem[];
  byCurrency: AllocationItem[];
  bySector: AllocationItem[];
}

export interface UpcomingDividend {
  ticker: string;
  name: string;
  recordDate: string;
  paymentDate: string | null;
  amountPerShare: number;
  currency: string;
  amountRub: number | null;
  isConfirmed: boolean;
}

export interface DividendHistoryItem {
  ticker: string;
  name: string;
  date: string;
  paymentRub: number;
  payment: number | null;
  paymentCurrency: string | null;
  operationType: number;
}

export interface DividendCalendar {
  upcoming: UpcomingDividend[];
  history: DividendHistoryItem[];
  totalRub: number;
}