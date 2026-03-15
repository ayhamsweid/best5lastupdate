import type { Metadata } from 'next';
import { Lang, siteUrl } from './i18n';

export function absoluteUrl(path: string) {
  if (!path.startsWith('/')) {
    return `${siteUrl}/${path}`;
  }
  return `${siteUrl}${path}`;
}

export function localePath(lang: Lang, path = '') {
  return path ? `/${lang}/${path.replace(/^\/+/, '')}` : `/${lang}`;
}

export function buildAlternates(lang: Lang, path = '') {
  const cleanPath = path.replace(/^\/+/, '');
  const arPath = cleanPath ? `/ar/${cleanPath}` : '/ar';
  const enPath = cleanPath ? `/en/${cleanPath}` : '/en';

  return {
    canonical: absoluteUrl(lang === 'ar' ? arPath : enPath),
    languages: {
      ar: absoluteUrl(arPath),
      en: absoluteUrl(enPath)
    }
  };
}

export function buildMetadata({
  lang,
  title,
  description,
  path = '',
  noindex = false,
  image
}: {
  lang: Lang;
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  image?: string;
}): Metadata {
  const fullPath = path ? `${lang}/${path.replace(/^\/+/, '')}` : lang;
  const url = absoluteUrl(`/${fullPath}`);

  return {
    title,
    description,
    alternates: buildAlternates(lang, path),
    robots: {
      index: !noindex,
      follow: true
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Best5',
      locale: lang === 'ar' ? 'ar_TR' : 'en_US',
      type: 'website',
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined
    }
  };
}
