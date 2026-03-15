import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;

  return buildMetadata({
    lang,
    title: lang === 'ar' ? 'من نحن | Best5' : 'About | Best5',
    description: lang === 'ar' ? 'تعرف على منصة Best5.' : 'Learn more about Best5.',
    path: 'about'
  });
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;

  return (
    <>
      <h1>{lang === 'ar' ? 'من نحن' : 'About Best5'}</h1>
      <section className="panel">
        <p>
          {lang === 'ar'
            ? 'هذه واجهة سيرفرية جديدة هدفها تقديم محتوى قابل للفهرسة بالكامل لمحركات البحث والزواحف الذكية.'
            : 'This new server-rendered frontend is designed to return fully indexable content to search engines and AI crawlers.'}
        </p>
      </section>
    </>
  );
}
