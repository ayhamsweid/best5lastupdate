import Link from 'next/link';
import styles from './home-landing.module.css';
import { localePath } from '@/lib/seo';
import type { Lang } from '@/lib/i18n';

type Category = {
  id?: string;
  slug_ar?: string;
  slug_en?: string;
  name_ar?: string;
  name_en?: string;
  icon?: string | null;
};

type Post = {
  id: string;
  slug_ar: string;
  slug_en: string;
  title_ar: string;
  title_en: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  cover_image_url?: string | null;
  category?: {
    name_ar?: string;
    name_en?: string;
  } | null;
};

type Localized = { ar?: string; en?: string };

type Props = {
  lang: Lang;
  title: string;
  description: string;
  placeholder: string;
  cta: string;
  heroImage?: string;
  categories: Category[];
  posts: Post[];
  latestConfig?: {
    title?: Localized;
    subtitle?: Localized;
    viewAllLabel?: Localized;
  };
};

const fallbackCategories: Category[] = [
  { slug_ar: 'burger', slug_en: 'burger', name_ar: 'برغر', name_en: 'Burgers' },
  { slug_ar: 'cafes', slug_en: 'cafes', name_ar: 'مقاهي', name_en: 'Cafes' },
  { slug_ar: 'breakfast', slug_en: 'breakfast', name_ar: 'فطور', name_en: 'Breakfast' },
  { slug_ar: 'fine-dining', slug_en: 'fine-dining', name_ar: 'عشاء فاخر', name_en: 'Fine Dining' },
  { slug_ar: 'street-food', slug_en: 'street-food', name_ar: 'أكل شعبي', name_en: 'Street Food' }
];

function SvgIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      {children}
    </svg>
  );
}

function BurgerIcon() {
  return (
    <SvgIcon>
      <path d="M5 11h14M6 14h12M7 17h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M6 10a6 6 0 0 1 12 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function CoffeeIcon() {
  return (
    <SvgIcon>
      <path d="M6 9h9v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 10h1.5a2 2 0 0 1 0 4H15" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 6c0 1-.8 1.4-.8 2.4M11 6c0 1-.8 1.4-.8 2.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </SvgIcon>
  );
}

function CroissantIcon() {
  return (
    <SvgIcon>
      <path d="M7 16c0-4 2-7 5-9 3 2 5 5 5 9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 16h10M10 11c.6 1.9.6 3.7 0 5M14 11c-.6 1.9-.6 3.7 0 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </SvgIcon>
  );
}

function BowlIcon() {
  return (
    <SvgIcon>
      <path d="M5 13a7 7 0 0 0 14 0H5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9c0-1.2 1-1.5 1-2.8M13 9c0-1.2 1-1.5 1-2.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </SvgIcon>
  );
}

function ForkKnifeIcon() {
  return (
    <SvgIcon>
      <path d="M8 4v8M6.5 4v4M9.5 4v4M8 12v8M15 4v18M15 4c1.8 1 2.5 2.7 2.5 4.5H15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function SearchIcon() {
  return (
    <SvgIcon>
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function ShieldIcon() {
  return (
    <SvgIcon>
      <path d="M12 4 6.5 6v4.6c0 3.8 2.4 7.2 5.5 8.4 3.1-1.2 5.5-4.6 5.5-8.4V6L12 4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.5 11.8 1.5 1.5 3.5-3.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function ListIcon() {
  return (
    <SvgIcon>
      <path d="M9 7h9M9 12h9M9 17h9M5 7h.01M5 12h.01M5 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function RefreshIcon() {
  return (
    <SvgIcon>
      <path d="M18 8a7 7 0 1 0 1 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M18 4v4h-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function MailIcon() {
  return (
    <SvgIcon>
      <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </SvgIcon>
  );
}

function categoryIcon(name = '') {
  const key = name.toLowerCase();
  if (key.includes('cafe') || key.includes('مقه')) return CoffeeIcon;
  if (key.includes('break') || key.includes('فطور')) return CroissantIcon;
  if (key.includes('street') || key.includes('شع')) return BowlIcon;
  if (key.includes('fine') || key.includes('فاخر')) return ForkKnifeIcon;
  return BurgerIcon;
}

export function HomeLanding({
  lang,
  title,
  description,
  placeholder,
  cta,
  heroImage,
  categories,
  posts,
  latestConfig
}: Props) {
  const isArabic = lang === 'ar';
  const quickCategories = (categories.length ? categories : fallbackCategories).slice(0, 5);
  const latestPosts = posts.slice(0, 3);
  const latestTitle =
    latestConfig?.title?.[lang] ?? (isArabic ? 'أحدث أدلة المقارنة' : 'Latest comparison guides');
  const latestSubtitle =
    latestConfig?.subtitle?.[lang] ??
    (isArabic ? 'أدلة مُعدّة بعناية وبأسلوب سهل وواضح.' : 'Carefully prepared guides in a clear style.');
  const viewAll = latestConfig?.viewAllLabel?.[lang] ?? (isArabic ? 'عرض الكل' : 'View all');

  return (
    <>
      <section className={styles.hero}>
        {heroImage ? <img className={styles.heroImage} src={heroImage} alt="" /> : null}
        <div className={styles.heroOverlay} />
        <div className={`shell ${styles.heroInner}`}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          <form action={localePath(lang, 'search')} className={styles.searchForm} method="get">
            <button className={styles.searchButton} type="submit">
              {cta}
            </button>
            <input className={styles.searchInput} name="q" placeholder={placeholder} type="text" />
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
          </form>
        </div>
      </section>

      <div className={styles.categoriesWrap}>
        <div className="shell">
          <div className={styles.categories}>
            {quickCategories.map((category, index) => {
              const slug = (isArabic ? category.slug_ar : category.slug_en) || category.slug_en || category.slug_ar || '';
              const name = (isArabic ? category.name_ar : category.name_en) || category.name_en || category.name_ar || '';
              const Icon = categoryIcon(name || category.icon || '');
              return (
                <Link className={styles.category} href={localePath(lang, `category/${slug}`)} key={category.id || `${slug}-${index}`}>
                  <span className={styles.categoryIcon}>
                    <Icon />
                  </span>
                  <span className={styles.categoryLabel}>{name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section className={styles.sectionLight}>
        <div className="shell">
          <div className={styles.sectionHead}>
            <div className={styles.sectionHeadText}>
              <h2>{latestTitle}</h2>
              <p>{latestSubtitle}</p>
            </div>
            <Link className={styles.viewAll} href={localePath(lang, 'blog')}>
              {viewAll}
            </Link>
          </div>

          <div className={styles.posts}>
            {latestPosts.map((post) => {
              const slug = isArabic ? post.slug_ar : post.slug_en;
              const postTitle = isArabic ? post.title_ar : post.title_en;
              const excerpt = isArabic ? post.excerpt_ar : post.excerpt_en;
              const tag = isArabic ? post.category?.name_ar : post.category?.name_en;
              return (
                <article className={styles.postCard} key={post.id}>
                  <div className={styles.postImageWrap}>
                    {post.cover_image_url ? <img alt={postTitle} className={styles.postImage} src={post.cover_image_url} /> : null}
                    {tag ? <span className={styles.postTag}>{tag}</span> : null}
                  </div>
                  <div className={styles.postBody}>
                    <h3 className={styles.postTitle}>{postTitle}</h3>
                    <p className={styles.postExcerpt}>{excerpt}</p>
                    <Link className={styles.postLink} href={localePath(lang, `blog/${slug}`)}>
                      {isArabic ? 'عرض المقارنة' : 'View guide'}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="shell">
          <div className={styles.featuresHeader}>
            <h2>{isArabic ? 'لماذا تختار دليل بشكتاش؟' : 'Why choose Besiktas Guide?'}</h2>
            <p>
              {isArabic
                ? 'نحن نوفر عليك البحث من خلال تقديم معلومات دقيقة ومحدثة من قلب الحدث.'
                : 'We save you time with updated, accurate information from the city itself.'}
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <ShieldIcon />
              </div>
              <h3>{isArabic ? 'اختيارات الخبراء' : 'Expert picks'}</h3>
              <p>
                {isArabic
                  ? 'فريقنا المحلي يزور ويقيّم كل مكان بشكل شخصي ومستقل.'
                  : 'Our local team reviews each place personally and independently.'}
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <ListIcon />
              </div>
              <h3>{isArabic ? 'مقارنات شاملة في صفحة واحدة' : 'Clear comparisons'}</h3>
              <p>
                {isArabic
                  ? 'نجمع الأسعار والموقع وساعات العمل والمزايا في مكان واحد سهل القراءة.'
                  : 'Prices, locations, hours and advantages collected in one readable page.'}
              </p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <RefreshIcon />
              </div>
              <h3>{isArabic ? 'تحديثات دورية للأسعار' : 'Regular updates'}</h3>
              <p>
                {isArabic
                  ? 'نراجع الأدلة باستمرار لضمان أن تظل المعلومات حديثة وموثوقة.'
                  : 'We keep guides refreshed so the information stays current and reliable.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.newsletterSection}>
        <div className="shell">
          <div className={styles.newsletterBox}>
            <div className={styles.newsletterIcon}>
              <MailIcon />
            </div>
            <h2>{isArabic ? 'لا تفوت أي جديد في بشكتاش' : 'Don’t miss what’s new in Besiktas'}</h2>
            <p>
              {isArabic
                ? 'اشترك في نشرتنا الإخبارية لتصلك أحدث الأدلة والعروض الحصرية أسبوعيًا.'
                : 'Subscribe to get the latest guides and exclusive offers each week.'}
            </p>
            <form className={styles.newsletterForm}>
              <button className={styles.newsletterButton} type="submit">
                {isArabic ? 'اشترك الآن' : 'Subscribe'}
              </button>
              <input className={styles.newsletterInput} placeholder={isArabic ? 'بريدك الإلكتروني' : 'Your email'} type="email" />
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
