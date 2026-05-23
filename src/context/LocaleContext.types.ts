import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';

export interface LocaleContextType {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
}

export interface LocaleProviderProps {
  children: ReactNode;
}
