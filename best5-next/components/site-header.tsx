'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { localePath } from '@/lib/seo';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader({ lang }: { lang: Lang }) {
  const [hidden, setHidden] = useState(false);
  const labels =
    lang === 'ar'
      ? {
          home: 'الرئيسية',
          blog: 'المدونة',
          about: 'من نحن',
          brand: 'Best 5',
          subtitle: 'أفضل 5 اختيارات في كل مجال'
        }
      : {
          home: 'Home',
          blog: 'Blog',
          about: 'About',
          brand: 'Best 5',
          subtitle: 'Top 5 picks in every category'
        };

  const nextLang = lang === 'ar' ? 'en' : 'ar';

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY < 24) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }

      lastY = currentY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${hidden ? 'site-header--hidden' : ''} ${lang === 'ar' ? 'site-header--ar' : 'site-header--en'}`}>
      <div className={`shell site-header-inner ${lang === 'ar' ? 'site-header-inner--ar' : 'site-header-inner--en'}`}>
        <div className="site-header-side">
          <Link className="lang-pill" href={localePath(nextLang)}>
            <span>{nextLang.toUpperCase()}</span>
            <span aria-hidden="true">◍</span>
          </Link>
          <ThemeToggle lang={lang} />
        </div>
        <nav className="site-header-nav" aria-label="Primary">
          <Link className="site-header-nav__about" href={localePath(lang, 'about')}>
            {labels.about}
          </Link>
          <Link className="site-header-nav__link site-header-nav__link--active" href={localePath(lang, 'blog')}>
            {labels.blog}
          </Link>
          <Link className="site-header-nav__link site-header-nav__link--active" href={localePath(lang)}>
            {labels.home}
          </Link>
        </nav>
        <Link className="brand" href={localePath(lang)}>
          <span className="brand-copy">
            <strong>{labels.brand}</strong>
            <span>{labels.subtitle}</span>
          </span>
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark__ring" />
          </span>
        </Link>
      </div>
    </header>
  );
}
