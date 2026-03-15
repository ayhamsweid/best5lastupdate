import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { faqSchema } from '@/lib/schema';

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
    title: 'FAQ | Best5',
    description: lang === 'ar' ? 'الأسئلة الشائعة حول Best5.' : 'Frequently asked questions about Best5.',
    path: 'faq'
  });
}

export default async function FaqPage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const items =
    lang === 'ar'
      ? [
          { q: 'هل الصفحة قابلة للفهرسة من HTML الخام؟', a: 'نعم، العناوين والمحتوى والروابط والبيانات المنظمة موجودة قبل تشغيل JavaScript.' },
          { q: 'هل صفحات البحث مفهرسة؟', a: 'لا، صفحات البحث يجب أن تكون noindex,follow ومُستبعدة من sitemap.' }
        ]
      : [
          { q: 'Is this page indexable from raw HTML?', a: 'Yes. Headings, content, links, and structured data are returned before JavaScript runs.' },
          { q: 'Are search pages indexable?', a: 'No. Search pages should be noindex,follow and excluded from the sitemap.' }
        ];

  return (
    <>
      <h1>FAQ</h1>
      <section className="panel">
        {items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <div>{item.a}</div>
          </details>
        ))}
      </section>
      <JsonLd data={faqSchema(items)} />
    </>
  );
}
