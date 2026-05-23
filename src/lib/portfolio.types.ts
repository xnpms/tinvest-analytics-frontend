export interface Instrument {
  ticker: string;
  name: string | null;
  figi: string | null;
  instrumentType: string | null;
  isOpen: boolean;
  quantity: number;
  avgPriceRub: number;
  currentPriceRub: number | null;
  realizedPnlRub: number;
  realizedPnlPercent: number;
  unrealizedPnlRub: number;
  totalPnlRub: number;
  totalPnlPercent: number;
  annualizedPnlPercent: number | null;
  todayPnlRub: number | null;
  todayPnlPercent: number | null;
}