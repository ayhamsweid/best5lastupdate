import { apiBaseUrl, Lang } from './i18n';
import type { PublicCategory, PublicPost } from './types';

async function fetchJson<T>(
  path: string,
  revalidate = 300,
  init?: {
    cache?: RequestCache;
  }
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...(init?.cache === 'no-store' ? { cache: 'no-store' as const } : { next: { revalidate } }),
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed API request: ${path} (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getPublicSettings() {
  return fetchJson<any>('/settings/public', 300);
}

export function getCategories() {
  return fetchJson<PublicCategory[]>('/categories/public', 300);
}

export function getPosts(lang: Lang, category?: string) {
  const categoryQuery = category ? `&category=${encodeURIComponent(category)}` : '';
  return fetchJson<PublicPost[]>(`/posts/public?lang=${lang}${categoryQuery}`, 300);
}

export function getPost(lang: Lang, slug: string) {
  return fetchJson<PublicPost>(`/posts/public/${encodeURIComponent(slug)}?lang=${lang}`, 300, {
    cache: 'no-store'
  });
}
