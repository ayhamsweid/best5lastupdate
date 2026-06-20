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
      <section className="hero hero--compact">
        <div className="hero-badge">{lang === 'ar' ? 'أحدث الأدلة' : 'Latest guides'}</div>
        <h1>{lang === 'ar' ? 'الأدلة والمقارنات' : 'Guides & comparisons'}</h1>
        <p>
          {lang === 'ar'
            ? 'أرشيف مرتب بصريًا لكل الأدلة المنشورة، مع بطاقات أوضح وروابط مباشرة للمقالات.'
            : 'A visual archive of published guides with clearer cards and direct article links.'}
        </p>
      </section>
      <ul className="card-grid section-stack">
        {posts.map((post) => {
          const slug = lang === 'ar' ? post.slug_ar : post.slug_en;
          const title = lang === 'ar' ? post.title_ar : post.title_en;
          const excerpt = lang === 'ar' ? post.excerpt_ar : post.excerpt_en;
          return (
            <li className="article-card article-card--post" key={post.id}>
              <article>
                <div className="section-kicker">{post.category ? (lang === 'ar' ? post.category.name_ar : post.category.name_en) : 'Best5'}</div>
                <h2>
                  <Link href={localePath(lang, `blog/${slug}`)}>{title}</Link>
                </h2>
                <p>{excerpt}</p>
                <div className="article-meta">
                  <span>{lang === 'ar' ? 'دليل قابل للفهرسة' : 'Indexable guide'}</span>
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US') : 'Best5'}</span>
                </div>
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
