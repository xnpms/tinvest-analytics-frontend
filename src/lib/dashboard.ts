import { apiFetch } from './api';

export interface DashboardSummary {
  totalValueRub: number;
  unrealizedPnlRub: number;
  twrPercent: number;
  dividendsRub: number;
}

export const getDashboardSummary = (): Promise<DashboardSummary | null> =>
  apiFetch<DashboardSummary | null>('/api/v1/dashboard/summary');

export interface PortfolioHistoryPoint {
  date: string;
  totalValueRub: number;
  cashFlowRub: number;
}

interface PortfolioHistoryResponse {
  data: PortfolioHistoryPoint[];
  summary: {
    twrPercent: number;
    firstValue: number;
    lastValue: number;
  };
}

export const getPortfolioHistory = async (from?: string): Promise<PortfolioHistoryPoint[]> => {
  const params = from ? `?from=${from}` : '?period=0';
  const res = await apiFetch<PortfolioHistoryResponse>(`/api/v1/portfolio/history${params}`);
  return res?.data ?? [];
};
