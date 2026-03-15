import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { getCategories, getPosts, getPublicSettings } from '@/lib/api';
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
  const settings = await getPublicSettings();
  const title = lang === 'ar' ? 'Best5 | خيارك الأمثل' : 'Best5 | Your Best Choice';
  const description =
    settings?.home_json?.hero?.description?.[lang] ||
    (lang === 'ar'
      ? 'اكتشف أفضل 5 أماكن وخدمات في تركيا مع محتوى قابل للفهرسة بالكامل.'
      : 'Discover the best 5 places and services in Turkey with fully indexable content.');

  return buildMetadata({ lang, title, description });
}

export default async function HomePage({
  params
}: {
  params: Promise<{ lang: string }>;
}) {
  const routeParams = await params;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const [settings, categories, posts] = await Promise.all([
    getPublicSettings(),
    getCategories(),
    getPosts(lang)
  ]);

  const hero = settings?.home_json?.hero || {};
  const title = hero?.title?.[lang] || (lang === 'ar' ? 'دليلك الشامل لأفضل الخيارات' : 'Your guide to the best options');
  const description =
    hero?.description?.[lang] ||
    (lang === 'ar'
      ? 'هذه الصفحة أصبحت تُرسل محتوى حقيقيًا في HTML الخام قبل أي JavaScript.'
      : 'This page now returns meaningful HTML before any JavaScript executes.');
  const latestPosts = posts.slice(0, 6);

  return (
    <>
      <section className="hero">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="section-title">{lang === 'ar' ? 'التصنيفات' : 'Categories'}</h2>
        <ul className="card-grid">
          {categories.map((category) => {
            const slug = lang === 'ar' ? category.slug_ar : category.slug_en;
            const name = lang === 'ar' ? category.name_ar : category.name_en;
            return (
              <li className="article-card" key={category.id}>
                <h3>{name}</h3>
                <p className="muted">{lang === 'ar' ? 'صفحة تصنيف قابلة للزحف من الـ HTML الخام.' : 'Category page linked directly in raw HTML.'}</p>
                <Link href={localePath(lang, `category/${slug}`)}>
                  {lang === 'ar' ? 'عرض التصنيف' : 'View category'}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="section-title">{lang === 'ar' ? 'أحدث المقالات' : 'Latest Articles'}</h2>
        <ul className="card-grid">
          {latestPosts.map((post) => {
            const slug = lang === 'ar' ? post.slug_ar : post.slug_en;
            const postTitle = lang === 'ar' ? post.title_ar : post.title_en;
            const excerpt = lang === 'ar' ? post.excerpt_ar : post.excerpt_en;
            return (
              <li className="article-card" key={post.id}>
                <article>
                  <h3>
                    <Link href={localePath(lang, `blog/${slug}`)}>{postTitle}</Link>
                  </h3>
                  <p>{excerpt}</p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <JsonLd
        data={itemListSchema(
          latestPosts.map((post) => ({
            name: lang === 'ar' ? post.title_ar : post.title_en,
            url: `https://best5.com.tr/${lang}/blog/${lang === 'ar' ? post.slug_ar : post.slug_en}`
          }))
        )}
      />
    </>
  );
}
