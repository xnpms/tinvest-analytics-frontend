import type { Instrument } from '@/lib/portfolio.types';

export type FilterMode = 'all' | 'open';
export type SortField = 'realizedPnlRub' | 'unrealizedPnlRub' | 'totalPnlRub' | 'totalPnlPercent' | 'annualizedPnlPercent' | 'todayPnlRub';
export type SortDirection = 'asc' | 'desc';

export interface InstrumentsTableProps {
  instruments: Instrument[];
}