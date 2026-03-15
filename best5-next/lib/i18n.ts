export const locales = ['ar', 'en'] as const;
export type Lang = (typeof locales)[number];

export const defaultLang: Lang = 'ar';
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://best5.com.tr';
export const apiBaseUrl =
  process.env.API_INTERNAL_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:4000/api';

export function isLang(value: string): value is Lang {
  return locales.includes(value as Lang);
}

export function dirForLang(lang: Lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function pickLocalized<T extends string | null | undefined>(
  lang: Lang,
  primary?: T,
  fallback?: T
) {
  return primary || fallback || '';
}
