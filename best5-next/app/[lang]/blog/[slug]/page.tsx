import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ContentBlocks, extractFaqItems } from '@/components/content-blocks';
import { JsonLd } from '@/components/json-ld';
import { getPost } from '@/lib/api';
import { defaultLang, isLang, type Lang } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const revalidate = 300;

function pick(value: any, lang: Lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value?.[lang] ?? value?.ar ?? value?.en ?? '';
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const routeParams = await params;
  const slug = routeParams.slug;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const post = await getPost(lang, slug);
  const title = lang === 'ar' ? post.seo_title_ar || post.title_ar : post.seo_title_en || post.title_en;
  const description = lang === 'ar' ? post.seo_desc_ar || post.excerpt_ar || '' : post.seo_desc_en || post.excerpt_en || '';
  const image = post.og_image_url || post.cover_image_url || undefined;

  return buildMetadata({
    lang,
    title,
    description,
    path: `blog/${slug}`,
    image
  });
}

export default async function ArticlePage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const routeParams = await params;
  const slug = routeParams.slug;
  const lang: Lang = isLang(routeParams.lang) ? routeParams.lang : defaultLang;
  const post = await getPost(lang, slug);

  if (!post?.id) {
    notFound();
  }

  const title = lang === 'ar' ? post.title_ar : post.title_en;
  const excerpt = lang === 'ar' ? post.excerpt_ar || '' : post.excerpt_en || '';
  const blocks = Array.isArray(post.content_blocks_json) ? post.content_blocks_json : [];
  const canonical = `https://best5.com.tr/${lang}/blog/${slug}`;
  const faqItems = extractFaqItems(blocks, lang);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: lang === 'ar' ? 'الرئيسية' : 'Home', href: `/${lang}` },
          { label: lang === 'ar' ? 'المدونة' : 'Blog', href: `/${lang}/blog` },
          { label: title }
        ]}
      />

      <article>
        <header className="hero">
          <h1>{title}</h1>
          <p>{excerpt}</p>
        </header>

        <div style={{ marginTop: 24 }}>
          <ContentBlocks blocks={blocks} lang={lang} />
        </div>
      </article>

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
