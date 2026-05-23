import { i18n } from '@lingui/core';

export type Locale = 'ru' | 'en';

export const LOCALES: Locale[] = ['ru', 'en'];
export const DEFAULT_LOCALE: Locale = 'ru';

const LOCALE_STORAGE_KEY = 'tinvest_locale';

export const getStoredLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  return stored && (LOCALES as string[]).includes(stored) ? stored : DEFAULT_LOCALE;
};

export const setStoredLocale = (locale: Locale): void => {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
};

export const loadLocale = async (locale: Locale): Promise<void> => {
  let messages;
  switch (locale) {
    case 'en':
      ({ messages } = await import('../../locales/en.po'));
      break;
    case 'ru':
    default:
      ({ messages } = await import('../../locales/ru.po'));
  }
  i18n.load(locale, messages);
  i18n.activate(locale);
};

export { i18n };
