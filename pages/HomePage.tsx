import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import Hero from '../components/Hero';
import { fetchPublicSettingsCached } from '../services/api';
import Seo from '../components/Seo';
import { deferNonCritical } from '../utils/deferNonCritical';

const Categories = lazy(() => import('../components/Categories'));
const LatestPosts = lazy(() => import('../components/LatestPosts'));
const Features = lazy(() => import('../components/Features'));
const Newsletter = lazy(() => import('../components/Newsletter'));

const HomePage: React.FC = () => {
  const [homeConfig, setHomeConfig] = useState<any>(null);

  useEffect(() => {
    return deferNonCritical(() => {
      fetchPublicSettingsCached()
        .then((data) => setHomeConfig(data?.home_json || null))
        .catch(() => setHomeConfig(null));
    });
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-animate="fade-up"]'));
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sectionsOrder = useMemo(() => {
    return homeConfig?.sections?.order || ['categories', 'latest', 'features', 'newsletter'];
  }, [homeConfig]);

  const sectionsEnabled = useMemo(() => {
    return {
      categories: true,
      latest: true,
      features: true,
      newsletter: true,
      ...(homeConfig?.sections?.enabled || {})
    };
  }, [homeConfig]);

  const sectionMap = useMemo(
    () => ({
      categories: <Categories />,
      latest: <LatestPosts config={homeConfig?.latestPosts} />,
      features: <Features config={homeConfig?.features} />,
      newsletter: <Newsletter />
    }),
    [homeConfig]
  );

  return (
    <>
      <Seo
        title="Best 5 | خيارك الأمثل"
        description={
          homeConfig?.hero?.description?.ar ||
          'اكتشف أفضل 5 أماكن وخدمات في تركيا مع Best5، مقارنات موثوقة وتقييمات محدثة تساعدك اختيار الأفضل بسهولة.'
        }
      />
      <Hero content={homeConfig?.hero} />
      {sectionsOrder.map((key: string) =>
        sectionsEnabled[key] && sectionMap[key] ? (
          <div key={key} className="fade-in-up" data-animate="fade-up">
            <Suspense fallback={null}>{sectionMap[key]}</Suspense>
          </div>
        ) : null
      )}
    </>
  );
};

export default HomePage;
