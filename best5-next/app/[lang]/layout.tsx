import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getPosts } from '@/lib/api';
import { defaultLang, isLang, type Lang } from '@/lib/i18n';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const latestPosts = await getPosts(lang);

  return (
    <>
      <SiteHeader lang={lang} />
      <main className="shell page">{children}</main>
      <SiteFooter lang={lang} latestPosts={latestPosts} />
    </>
  );
}
