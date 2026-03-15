import Link from 'next/link';
import type { Lang } from '@/lib/i18n';
import { localePath } from '@/lib/seo';

export function SiteHeader({ lang }: { lang: Lang }) {
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Link className="brand" href={localePath(lang)}>
          <span className="brand-mark">5</span>
          <span>Best5</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-list">
            <li><Link href={localePath(lang)}>Home</Link></li>
            <li><Link href={localePath(lang, 'blog')}>Blog</Link></li>
            <li><Link href={localePath(lang, 'about')}>About</Link></li>
            <li><Link href={localePath(lang, 'faq')}>FAQ</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
