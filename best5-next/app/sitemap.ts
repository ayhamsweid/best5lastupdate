import type { MetadataRoute } from 'next';
import { getCategories, getPosts } from '@/lib/api';
import { absoluteUrl } from '@/lib/seo';

function isThinOrTest(post: { slug_ar?: string; slug_en?: string; title_ar?: string; title_en?: string }) {
  const haystack = `${post.slug_ar || ''} ${post.slug_en || ''} ${post.title_ar || ''} ${post.title_en || ''}`.toLowerCase();
  return haystack.includes('test');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/ar') },
    { url: absoluteUrl('/en') },
    { url: absoluteUrl('/ar/blog') },
    { url: absoluteUrl('/en/blog') }
  ];

  let categories = [];
  let arPosts = [];
  let enPosts = [];

  try {
    [categories, arPosts, enPosts] = await Promise.all([
      getCategories(),
      getPosts('ar'),
      getPosts('en')
    ]);
  } catch {
    return urls;
  }

  categories.forEach((category) => {
    if (category.slug_ar) {
      urls.push({
        url: absoluteUrl(`/ar/category/${encodeURIComponent(category.slug_ar)}`),
        lastModified: category.updated_at ? new Date(category.updated_at) : undefined
      });
    }

    if (category.slug_en) {
      urls.push({
        url: absoluteUrl(`/en/category/${encodeURIComponent(category.slug_en)}`),
        lastModified: category.updated_at ? new Date(category.updated_at) : undefined
      });
    }
  });

  [...arPosts, ...enPosts]
    .filter((post, index, array) => array.findIndex((item) => item.id === post.id) === index)
    .filter((post) => !isThinOrTest(post))
    .forEach((post) => {
      if (post.slug_ar) {
        urls.push({
          url: absoluteUrl(`/ar/blog/${encodeURIComponent(post.slug_ar)}`),
          lastModified: post.updated_at ? new Date(post.updated_at) : post.published_at ? new Date(post.published_at) : undefined
        });
      }

      if (post.slug_en) {
        urls.push({
          url: absoluteUrl(`/en/blog/${encodeURIComponent(post.slug_en)}`),
          lastModified: post.updated_at ? new Date(post.updated_at) : post.published_at ? new Date(post.published_at) : undefined
        });
      }
    });

  return urls;
}
