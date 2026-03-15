import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const { q } = await searchParams;

  return buildMetadata({
    lang,
    title: `Search: ${q || ''} | Best5`,
    description: 'Internal search page',
    path: 'search',
    noindex: true
  });
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <h1>Search</h1>
      <p className="muted">Query: {q || '—'}</p>
    </>
  );
}
