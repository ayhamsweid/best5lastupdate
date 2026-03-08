import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import { useTheme } from '../context/ThemeContext';

type Localized = { ar?: string; en?: string };
type HeroContent = {
  title?: Localized;
  subtitle?: Localized;
  description?: Localized;
  placeholder?: Localized;
  cta?: Localized;
  backgroundUrl?: string;
};

const Hero: React.FC<{ content?: HeroContent }> = ({ content }) => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/${lang}/search?q=${encodeURIComponent(query.trim())}`);
  };

  const copy = useMemo(
    () => ({
      title: (content?.title?.[lang] ??
        (lang === 'ar' ? 'دليلك الشامل لتجارب استثنائية' : 'Your complete guide to exceptional experiences')) as string,
      subtitle: (content?.subtitle?.[lang] ?? (lang === 'ar' ? 'في قلب اسطنبول' : 'In the heart of Istanbul')) as string,
      description:
        (content?.description?.[lang] ??
          (lang === 'ar'
            ? 'نحن نقوم بالبحث والمقارنة لنقدم لك الأفضل دائماً، دون الحاجة للتنقل بين مئات الصفحات'
            : 'We research and compare so you always get the best—without jumping between hundreds of pages.')) as string,
      placeholder: (content?.placeholder?.[lang] ?? (lang === 'ar' ? 'ماذا تريد أن تستكشف اليوم؟' : 'What do you want to explore today?')) as string,
      cta: (content?.cta?.[lang] ?? (lang === 'ar' ? 'بحث' : 'Search')) as string,
      backgroundUrl: content?.backgroundUrl || '/images/hero-besiktas.webp'
    }),
    [content, lang]
  );
  const heroBackgroundUrl = copy.backgroundUrl.trim() ? copy.backgroundUrl : '/images/hero-besiktas.webp';
  const useDefaultResponsiveSources = heroBackgroundUrl === '/images/hero-besiktas.webp';

  return (
    <section className="relative h-[650px] flex flex-col justify-center items-center text-center px-4 overflow-visible">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackgroundUrl}
          srcSet={useDefaultResponsiveSources ? '/images/hero-besiktas-768.webp 768w, /images/hero-besiktas.webp 1200w' : undefined}
          sizes={useDefaultResponsiveSources ? '(max-width: 768px) 100vw, 1200px' : undefined}
          width={1200}
          height={800}
          alt="Istanbul Besiktas" 
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className={theme === 'dark' ? 'absolute inset-0 bg-slate-900/70' : 'absolute inset-0 bg-white/45'}></div>
        {/* Map overlay texture effect */}
        <div className={theme === 'dark' ? "absolute inset-0 opacity-10 bg-[url('/textures/city-fields.svg')]" : "absolute inset-0 opacity-5 bg-[url('/textures/city-fields.svg')]"}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto mt-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
          {copy.title}
          <br />
          <span className="text-gray-700 dark:text-gray-300">{copy.subtitle}</span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto">{copy.description}</p>

        {/* Search Box */}
        <div className="relative max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.placeholder}
              className="w-full py-4 pr-6 pl-32 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/30 shadow-2xl text-lg"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <button 
              type="submit"
              className="absolute left-2 top-2 bottom-2 bg-primary hover:bg-green-600 text-white font-bold py-2 px-8 rounded-md transition-colors flex items-center gap-2"
            >
              {copy.cta}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
