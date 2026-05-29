import type { DividendCalendar, DividendHistoryItem, UpcomingDividend } from '@/lib/dashboard.types';

export type { DividendCalendar, DividendHistoryItem, UpcomingDividend };

export type DividendTab = 'upcoming' | 'history';

export interface DividendCalendarProps {
  data: DividendCalendar;
}

export interface TabButtonProps {
  tabKey: DividendTab;
  label: string;
  isActive: boolean;
  onSelect: (key: DividendTab) => void;
}

export interface UpcomingRowProps {
  item: UpcomingDividend;
}

export interface HistoryRowProps {
  item: DividendHistoryItem;
}