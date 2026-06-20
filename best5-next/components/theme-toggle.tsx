'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const storageKey = 'best5-theme';

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(storageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ lang }: { lang: 'ar' | 'en' }) {
  const [theme, setTheme] = useState<Theme>('light');
  const mounted = theme === 'light' || theme === 'dark';

  useEffect(() => {
    const nextTheme = getPreferredTheme();
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
  }

  const label =
    lang === 'ar'
      ? theme === 'dark'
        ? 'الوضع الليلي'
        : 'الوضع النهاري'
      : theme === 'dark'
        ? 'Dark mode'
        : 'Light mode';

  return (
    <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label={label} title={label}>
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'dark' ? '☾' : '◐'}
      </span>
      <span>{mounted ? label : lang === 'ar' ? 'الثيم' : 'Theme'}</span>
    </button>
  );
}
