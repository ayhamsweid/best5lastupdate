import { HomeLanding } from '@/components/home-landing';
import { JsonLd } from '@/components/json-ld';
import { getCategories, getPosts, getPublicSettings } from '@/lib/api';
import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
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
  const featuredPosts = latestPosts.slice(0, 3);
  const heroImage =
    hero?.backgroundUrl ||
    featuredPosts[0]?.cover_image_url ||
    featuredPosts[1]?.cover_image_url ||
    featuredPosts[2]?.cover_image_url ||
    '';
  const placeholder = hero?.placeholder?.[lang] || (lang === 'ar' ? 'ماذا تريد أن تستكشف اليوم؟' : 'What do you want to explore today?');
  const cta = hero?.cta?.[lang] || (lang === 'ar' ? 'بحث' : 'Search');

  return (
    <>
      <HomeLanding
        categories={categories}
        cta={cta}
        description={description}
        heroImage={heroImage}
        lang={lang}
        latestConfig={settings?.home_json?.latestPosts}
        placeholder={placeholder}
        posts={posts}
        title={title}
      />

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
