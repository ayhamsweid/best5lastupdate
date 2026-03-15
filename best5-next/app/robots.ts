import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/'
      },
      {
        userAgent: '*',
        disallow: ['/ar/search', '/en/search']
      }
    ],
    sitemap: 'https://best5.com.tr/sitemap.xml'
  };
}
