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
      <div className="shell page site-footer-shell">
        <div className="footer-columns footer-columns--legacy">
          <section className="footer-brand">
            <div className="footer-brand__head">
              <span className="brand-mark">5</span>
              <div>
                <h2 className="section-title">{lang === 'ar' ? 'Best 5' : 'Best 5'}</h2>
                <p className="muted">
                  {lang === 'ar'
                    ? 'دليلك الشامل لأفضل الاختيارات والتوصيات الموثوقة في كل مجال'
                    : 'Your guide to trusted picks and comparisons across every category.'}
                </p>
              </div>
            </div>
          </section>
          <section>
            <h2 className="section-title">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h2>
            <ul className="footer-list">
              <li><Link href={localePath(lang)}>{lang === 'ar' ? 'من نحن' : 'Home'}</Link></li>
              <li><Link href={localePath(lang, 'faq')}>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy'}</Link></li>
              <li><Link href={localePath(lang, 'blog')}>{lang === 'ar' ? 'تواصل معنا' : 'Contact us'}</Link></li>
            </ul>
          </section>
          <section>
            <h2 className="section-title">{lang === 'ar' ? 'أحدث المدونات' : 'Latest Posts'}</h2>
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
          <section>
            <h2 className="section-title">{lang === 'ar' ? 'التواصل' : 'Contact'}</h2>
            <ul className="footer-list">
              <li>{lang === 'ar' ? 'تركيا / اسطنبول' : 'Turkey / Istanbul'}</li>
              <li>info@best5.com.tr</li>
            </ul>
          </section>
        </div>
        <div className="site-footer-meta">
          <span>© 2026 Best5</span>
          <span>{lang === 'ar' ? 'أفضل 5 اختيارات في كل مجال' : 'Top 5 picks in every category'}</span>
        </div>
      </div>
    </footer>
  );
}
