import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import { fetchPublicPosts } from '../services/api';
import { deferNonCritical } from '../utils/deferNonCritical';

type Localized = { ar?: string; en?: string };

const LatestPosts: React.FC<{
  config?: {
    title?: Localized;
    subtitle?: Localized;
    viewAllLabel?: Localized;
  };
}> = ({ config }) => {
  const { lang } = useLang();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    return deferNonCritical(() => {
      fetchPublicPosts(lang)
        .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 3) : []))
        .catch(() => setPosts([]));
    });
  }, [lang]);

  const title = useMemo(
    () => config?.title?.[lang] ?? (lang === 'ar' ? 'أحدث المقالات' : 'Latest articles'),
    [config, lang]
  );
  const subtitle = useMemo(
    () =>
      config?.subtitle?.[lang] ??
      (lang === 'ar' ? 'آخر ما نشرناه من أدلة ومقارنات' : 'Fresh guides and comparisons from our editors'),
    [config, lang]
  );
  const viewAll = useMemo(
    () => config?.viewAllLabel?.[lang] ?? (lang === 'ar' ? 'عرض الكل' : 'View all'),
    [config, lang]
  );

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
      <div className="rounded-3xl bg-white border border-gray-200 p-6 md:p-10 dark:bg-[#0b1224] dark:border-white/10">
        <div className="flex justify-between items-end mb-10 border-r-4 border-primary pr-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 dark:text-white">{title}</h2>
            <p className="text-gray-600 dark:text-white/70">{subtitle}</p>
          </div>
          <Link to={`/${lang}/blog`} className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline">
            {viewAll} <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => {
          const slug = (lang === 'ar' ? post.slug_ar : post.slug_en) || post.slug_en || post.slug_ar;
          const postTitle = lang === 'ar' ? post.title_ar : post.title_en;
          const excerpt = lang === 'ar' ? post.excerpt_ar : post.excerpt_en;
          const tag = lang === 'ar' ? post?.category?.name_ar : post?.category?.name_en;
          const cover = post.cover_image_url;
          return (
            <div
              key={post.id}
              className="group bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-200 flex flex-col h-full dark:bg-[#0f172a] dark:border-white/10"
            >
              <div className="relative h-60 overflow-hidden bg-gray-200 dark:bg-[#111827]">
                {cover ? (
                  <img
                    src={cover}
                    alt={postTitle || ''}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-white/60">No image</div>
                )}
                {tag && (
                  <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {tag}
                  </span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors dark:text-white">
                  {postTitle || '—'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow dark:text-white/70">{excerpt || ''}</p>
                <Link
                  to={`/${lang}/blog/${slug}`}
                  className="w-full bg-white hover:bg-primary hover:text-white text-gray-700 border border-gray-200 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-md dark:bg-white/10 dark:text-white/90 dark:border-white/10"
                >
                  {lang === 'ar' ? 'عرض المقالة' : 'Read article'}
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to={`/${lang}/blog`} className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            {viewAll} <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
