import { apiFetch } from './api';
import type { Instrument } from './portfolio.types';

interface InstrumentsResponse {
  instruments: Instrument[];
}

export const getInstrumentsPerformance = async (): Promise<Instrument[]> => {
  const res = await apiFetch<InstrumentsResponse>('/api/v1/portfolio/instruments');
  return res.instruments;
};
