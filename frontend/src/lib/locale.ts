const LOCALE_KEY = 'foodapp_locale';

export type AppLocale = 'uz' | 'ru';

export function getLocale(): AppLocale {
  if (typeof window === 'undefined') return 'uz';
  const v = localStorage.getItem(LOCALE_KEY);
  return v === 'ru' ? 'ru' : 'uz';
}

export function setLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_KEY, locale);
}
