import { cache } from 'react';
import { notFound } from 'next/navigation';
import { extractFaqItems } from '@/components/content-blocks';
import { JsonLd } from '@/components/json-ld';
import { LegacyGuidePage } from '@/components/legacy-guide-page';
import { getPost, getPosts } from '@/lib/api';
import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { decodeRouteSegment } from '@/lib/routing';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const revalidate = 300;

const getCachedPost = cache((lang: Lang, slug: string) => getPost(lang, slug));

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const routeParams = await params;
  const slug = decodeRouteSegment(routeParams.slug);
  const encodedSlug = encodeURIComponent(slug);
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;

  try {
    const post = await getCachedPost(lang, slug);
    const title = lang === 'ar' ? post.seo_title_ar || post.title_ar : post.seo_title_en || post.title_en;
    const description =
      lang === 'ar' ? post.seo_desc_ar || post.excerpt_ar || '' : post.seo_desc_en || post.excerpt_en || '';
    const image = post.og_image_url || post.cover_image_url || undefined;
    const arSlug = post.slug_ar || slug;
    const enSlug = post.slug_en || slug;

    return buildMetadata({
      lang,
      title,
      description,
      path: `blog/${encodedSlug}`,
      image,
      alternates: {
        canonical: absoluteUrl(`/${lang}/blog/${encodeURIComponent(lang === 'ar' ? arSlug : enSlug)}`),
        languages: {
          ar: absoluteUrl(`/ar/blog/${encodeURIComponent(arSlug)}`),
          en: absoluteUrl(`/en/blog/${encodeURIComponent(enSlug)}`)
        }
      }
    });
  } catch (error) {
    console.error('article metadata failed', { lang, slug, error });
    return buildMetadata({
      lang,
      title: lang === 'ar' ? 'مقال | Best5' : 'Article | Best5',
      description: lang === 'ar' ? 'مقال من Best5' : 'Article from Best5',
      path: `blog/${encodedSlug}`
    });
  }
}

export default async function ArticlePage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const routeParams = await params;
  const slug = decodeRouteSegment(routeParams.slug);
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const post = await getCachedPost(lang, slug);

  if (!post?.id) {
    notFound();
  }

  const title = lang === 'ar' ? post.title_ar : post.title_en;
  const excerpt = lang === 'ar' ? post.excerpt_ar || '' : post.excerpt_en || '';
  const blocks = Array.isArray(post.content_blocks_json) ? post.content_blocks_json : [];
  const canonical = `https://best5.com.tr/${lang}/blog/${encodeURIComponent(slug)}`;
  const faqItems = extractFaqItems(blocks, lang);
  const categoryName = post.category ? (lang === 'ar' ? post.category.name_ar : post.category.name_en) : '';
  const allPosts = await getPosts(lang);
  const relatedPosts = allPosts
    .filter((candidate) => candidate?.id && candidate.id !== post.id)
    .sort((left, right) => {
      const leftSameCategory = left.category?.id && post.category?.id && left.category.id === post.category.id ? 1 : 0;
      const rightSameCategory = right.category?.id && post.category?.id && right.category.id === post.category.id ? 1 : 0;

      if (leftSameCategory !== rightSameCategory) {
        return rightSameCategory - leftSameCategory;
      }

      const leftPublished = left.published_at ? new Date(left.published_at).getTime() : 0;
      const rightPublished = right.published_at ? new Date(right.published_at).getTime() : 0;
      return rightPublished - leftPublished;
    })
    .slice(0, 3);
  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <>
      <LegacyGuidePage
        post={post}
        lang={lang}
        title={title}
        excerpt={excerpt}
        categoryName={categoryName}
        publishedLabel={publishedLabel}
        relatedPosts={relatedPosts}
      />

      <JsonLd data={articleSchema(post, title, excerpt, canonical)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: lang === 'ar' ? 'الرئيسية' : 'Home', url: `https://best5.com.tr/${lang}` },
          { name: lang === 'ar' ? 'المدونة' : 'Blog', url: `https://best5.com.tr/${lang}/blog` },
          { name: title, url: canonical }
        ])}
      />
      {faqItems.length > 0 ? <JsonLd data={faqSchema(faqItems)} /> : null}
    </>
  );
}
