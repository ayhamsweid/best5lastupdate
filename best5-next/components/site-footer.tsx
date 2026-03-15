import Link from 'next/link';
import type { Lang } from '@/lib/i18n';
import type { PublicPost } from '@/lib/types';
import { localePath } from '@/lib/seo';

export function SiteFooter({
  lang,
  latestPosts
}: {
  lang: Lang;
  latestPosts: PublicPost[];
}) {
  return (
    <footer className="site-footer">
      <div className="shell page">
        <div className="footer-columns">
          <section>
            <h2 className="section-title">Best5</h2>
            <p className="muted">
              {lang === 'ar'
                ? 'منصة محتوى قابلة للفهرسة بشكل صحيح وتعرض المحتوى الأساسي مباشرة من السيرفر.'
                : 'An indexable content platform that returns meaningful HTML directly from the server.'}
            </p>
          </section>
          <section>
            <h2 className="section-title">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h2>
            <ul className="footer-list">
              <li><Link href={localePath(lang)}>Home</Link></li>
              <li><Link href={localePath(lang, 'blog')}>Blog</Link></li>
              <li><Link href={localePath(lang, 'faq')}>FAQ</Link></li>
            </ul>
          </section>
          <section>
            <h2 className="section-title">{lang === 'ar' ? 'أحدث المقالات' : 'Latest Articles'}</h2>
            <ul className="footer-list">
              {latestPosts.slice(0, 4).map((post) => {
                const slug = lang === 'ar' ? post.slug_ar : post.slug_en;
                const title = lang === 'ar' ? post.title_ar : post.title_en;
                return (
                  <li key={post.id}>
                    <Link href={localePath(lang, `blog/${slug}`)}>{title}</Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </footer>
  );
}
