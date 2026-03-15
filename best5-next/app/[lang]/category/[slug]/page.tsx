import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { getCategories, getPosts } from '@/lib/api';
import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata, localePath } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';

export const revalidate = 300;

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const routeParams = await params;
  const slug = routeParams.slug;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const categories = await getCategories();
  const category = categories.find((item) => (lang === 'ar' ? item.slug_ar : item.slug_en) === slug);
  const title = category ? (lang === 'ar' ? category.name_ar : category.name_en) : slug;

  return buildMetadata({
    lang,
    title: `${title} | Best5`,
    description: lang === 'ar' ? `أفضل المقالات ضمن تصنيف ${title}.` : `Best articles in the ${title} category.`,
    path: `category/${slug}`
  });
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const routeParams = await params;
  const slug = routeParams.slug;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const [categories, posts] = await Promise.all([getCategories(), getPosts(lang, slug)]);
  const category = categories.find((item) => (lang === 'ar' ? item.slug_ar : item.slug_en) === slug);

  if (!category) {
    notFound();
  }

  const title = lang === 'ar' ? category.name_ar : category.name_en;
  const pageUrl = `https://best5.com.tr/${lang}/category/${slug}`;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: lang === 'ar' ? 'الرئيسية' : 'Home', href: localePath(lang) },
          { label: title }
        ]}
      />

      <h1>{title}</h1>
      <p className="muted">
        {lang === 'ar'
          ? 'صفحة تصنيف سيرفرية مع روابط مقالات قابلة للزحف.'
          : 'A server-rendered category page with crawlable article links.'}
      </p>

      <ul className="card-grid" style={{ marginTop: 24 }}>
        {posts.map((post) => {
          const postSlug = lang === 'ar' ? post.slug_ar : post.slug_en;
          const postTitle = lang === 'ar' ? post.title_ar : post.title_en;
          const excerpt = lang === 'ar' ? post.excerpt_ar : post.excerpt_en;
          return (
            <li className="article-card" key={post.id}>
              <article>
                <h2>
                  <Link href={localePath(lang, `blog/${postSlug}`)}>{postTitle}</Link>
                </h2>
                <p>{excerpt}</p>
              </article>
            </li>
          );
        })}
      </ul>

      <JsonLd
        data={breadcrumbSchema([
          { name: lang === 'ar' ? 'الرئيسية' : 'Home', url: `https://best5.com.tr/${lang}` },
          { name: title, url: pageUrl }
        ])}
      />
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
