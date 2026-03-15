import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { getPosts } from '@/lib/api';
import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata, localePath } from '@/lib/seo';
import { itemListSchema } from '@/lib/schema';

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
    title: lang === 'ar' ? 'المدونة | Best5' : 'Blog | Best5',
    description: lang === 'ar' ? 'قائمة مقالات قابلة للفهرسة من أول استجابة.' : 'An indexable article archive in the first response.',
    path: 'blog'
  });
}

export default async function BlogListPage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const posts = await getPosts(lang);

  return (
    <>
      <h1>{lang === 'ar' ? 'المدونة' : 'Blog'}</h1>
      <p className="muted">
        {lang === 'ar'
          ? 'كل الروابط والعناوين والنصوص التالية موجودة في الـ HTML الخام.'
          : 'All of the links, headings, and excerpts below are present in raw HTML.'}
      </p>
      <ul className="card-grid" style={{ marginTop: 24 }}>
        {posts.map((post) => {
          const slug = lang === 'ar' ? post.slug_ar : post.slug_en;
          const title = lang === 'ar' ? post.title_ar : post.title_en;
          const excerpt = lang === 'ar' ? post.excerpt_ar : post.excerpt_en;
          return (
            <li className="article-card" key={post.id}>
              <article>
                <h2>
                  <Link href={localePath(lang, `blog/${slug}`)}>{title}</Link>
                </h2>
                <p>{excerpt}</p>
              </article>
            </li>
          );
        })}
      </ul>

      <JsonLd
        data={itemListSchema(
          posts.map((post) => ({
            name: lang === 'ar' ? post.title_ar : post.title_en,
            url: `https://best5.com.tr/${lang}/blog/${lang === 'ar' ? post.slug_ar : post.slug_en}`
          }))
        )}
      />
    </>
  );
}
