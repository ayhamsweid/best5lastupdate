import Link from 'next/link';
import styles from './home-hero-legacy.module.css';
import { localePath } from '@/lib/seo';
import type { Lang } from '@/lib/i18n';

type FeaturedPost = {
  id: string;
  slug_ar: string;
  slug_en: string;
  title_ar: string;
  title_en: string;
};

type Props = {
  lang: Lang;
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  cta: string;
  heroImage?: string;
  featuredPosts: FeaturedPost[];
};

export function HomeHeroLegacy({
  lang,
  title,
  subtitle,
  description,
  placeholder,
  cta,
  heroImage,
  featuredPosts
}: Props) {
  const isArabic = lang === 'ar';

  return (
    <section className={styles.hero}>
      {heroImage ? <img className={styles.image} src={heroImage} alt="" /> : null}
      <div className={styles.overlay} />
      <div className={styles.glow} />

      <div className={styles.content}>
        <div className={`${styles.copy} ${isArabic ? '' : styles.copyEn}`.trim()}>
          <div className={styles.badge}>{isArabic ? 'تم تحديث الأدلة بصريًا' : 'Fresh visual guides'}</div>
          <h1 className={styles.title}>
            {title}
            <span className={styles.subtitle}>{subtitle}</span>
          </h1>
          <p className={styles.description}>{description}</p>

          <form
            action={localePath(lang, 'search')}
            className={`${styles.searchForm} ${isArabic ? '' : styles.searchFormEn}`.trim()}
            method="get"
          >
            <input className={styles.searchInput} name="q" placeholder={placeholder} type="text" />
            <button className={styles.searchButton} type="submit">
              {cta}
            </button>
          </form>
        </div>

        {featuredPosts.length > 0 ? (
          <div className={styles.featured}>
            {featuredPosts.map((post, index) => {
              const slug = isArabic ? post.slug_ar : post.slug_en;
              const postTitle = isArabic ? post.title_ar : post.title_en;
              return (
                <Link className={styles.card} href={localePath(lang, `blog/${slug}`)} key={post.id}>
                  <span className={styles.cardLabel}>
                    {isArabic ? `اختيار #${index + 1}` : `Pick #${index + 1}`}
                  </span>
                  <span className={styles.cardTitle}>{postTitle}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
