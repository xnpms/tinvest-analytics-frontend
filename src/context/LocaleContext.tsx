'use client';

import type { FC } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n, loadLocale, getStoredLocale, setStoredLocale, DEFAULT_LOCALE } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { LocaleContextType, LocaleProviderProps } from './LocaleContext.types';

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = getStoredLocale();
    const init = async () => {
      await loadLocale(stored);
      setLocale(stored);
    };
    void init();
  }, []);

  const changeLocale = async (next: Locale) => {
    await loadLocale(next);
    setStoredLocale(next);
    setLocale(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, changeLocale }}>
      <I18nProvider i18n={i18n}>
        {children}
      </I18nProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
};
