import Link from 'next/link';
import styles from './legacy-guide-page.module.css';
import type { PublicPost } from '@/lib/types';
import type { Lang } from '@/lib/i18n';
import { localePath } from '@/lib/seo';

function pick(value: any, lang: Lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value?.[lang] ?? value?.ar ?? value?.en ?? '';
}

function normalizeUrl(value: string | undefined) {
  if (!value) return '';
  const markdownMatch = value.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch?.[1]) return markdownMatch[1];
  return value.trim();
}

function renderStars(value: number) {
  const safe = Math.max(0, Math.min(5, Math.round(value)));
  return Array.from({ length: 5 }, (_item, index) => index < safe);
}

function pinClass(index: number) {
  return [styles.mapPin, styles[`pin${index + 1}` as keyof typeof styles]].join(' ');
}

export function LegacyGuidePage({
  post,
  lang,
  title,
  excerpt,
  categoryName,
  publishedLabel,
  relatedPosts
}: {
  post: PublicPost;
  lang: Lang;
  title: string;
  excerpt: string;
  categoryName: string;
  publishedLabel: string;
  relatedPosts: PublicPost[];
}) {
  const blocks = Array.isArray(post.content_blocks_json) ? post.content_blocks_json : [];
  const intro = blocks.find((block) => block.type === 'guide');
  const quickPicks = blocks.find((block) => block.type === 'cards');
  const comparison = blocks.find((block) => block.type === 'comparison');
  const restaurants = blocks.filter((block) => block.type === 'restaurant');
  const faq = blocks.find((block) => block.type === 'faq');
  const mapBlock = blocks.find((block) => block.type === 'map');
  const heroImage = post.cover_image_url || post.og_image_url || '';
  const introText = pick(intro?.data?.content, lang)
    .split('\n')
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  const guideData = {
    trustLine:
      excerpt ||
      introText[0] ||
      (lang === 'ar'
        ? 'اكتشف أفضل الخيارات المختارة بعناية مع مقارنة واضحة ومباشرة.'
        : 'Discover carefully selected picks with a clear and direct comparison.'),
    description:
      introText[1] ||
      introText[0] ||
      excerpt ||
      (lang === 'ar'
        ? 'دليل سريع وواضح يساعدك على اختيار الأنسب بسهولة.'
        : 'A clear guide that helps you choose the right option easily.'),
    filterPills: [
      { key: 'top', label: lang === 'ar' ? 'الأعلى تقييمًا' : 'Top rated', href: '#quick-picks' },
      { key: 'value', label: lang === 'ar' ? 'الأفضل قيمة' : 'Best value', href: '#comparison-table' },
      {
        key: 'family',
        label: lang === 'ar' ? 'خيار العائلات' : 'Family pick',
        href: restaurants[1] ? `#restaurant-${restaurants[1].id}` : '#quick-picks'
      },
      {
        key: 'fast',
        label: lang === 'ar' ? 'الخدمة السريعة' : 'Fast service',
        href: restaurants[0] ? `#restaurant-${restaurants[0].id}` : '#comparison-table'
      }
    ],
    quickPicks:
      (quickPicks?.data?.cards || []).map((card: any, index: number) => ({
        label: pick(card.title, lang),
        title: pick(card.label, lang),
        note: pick(card.note, lang),
        icon: ['★', '↗', '◎'][index] || '•'
      })) || [],
    comparisonTitle: pick(comparison?.data?.title, lang) || (lang === 'ar' ? 'جدول مقارنة سريع' : 'Quick comparison'),
    toc: [
      quickPicks ? { id: 'quick-picks', label: lang === 'ar' ? 'ملخص سريع' : 'Quick picks' } : null,
      comparison ? { id: 'comparison-table', label: lang === 'ar' ? 'جدول المقارنة' : 'Comparison table' } : null,
      ...restaurants.map((block: any) => ({
        id: `restaurant-${block.id}`,
        label: pick(block.data?.name, lang)
      })),
      mapBlock && restaurants.length ? { id: 'guide-map', label: lang === 'ar' ? 'الخريطة والمواقع' : 'Map & locations' } : null,
      faq ? { id: 'guide-faq', label: pick(faq.data?.title, lang) || 'FAQ' } : null
    ].filter(Boolean) as Array<{ id: string; label: string }>
  };
  const summaryCards: Array<{ label: string; title: string; note: string; icon: string }> = guideData.quickPicks;

  return (
    <article className={`${styles.page} ${lang === 'ar' ? styles.pageRtl : styles.pageLtr}`}>
      <header className={styles.hero}>
        {heroImage ? <img className={styles.heroImage} src={heroImage} alt={title} /> : null}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.updated}>
            <span className={styles.dot} />
            {lang === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {publishedLabel || (lang === 'ar' ? 'حديثًا' : 'Recently')}
          </div>
          <h1>{title}</h1>
          <p className={styles.heroTrust}>{guideData.trustLine}</p>
        </div>
      </header>

      {introText.length > 0 ? (
        <section className={styles.introCard}>
          <h2>{title}</h2>
          {introText.slice(0, 3).map((paragraph: string, index: number) => (
            <p key={`intro-${index}`}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      <div className={styles.contentLayout}>
        <div className={styles.mainColumn}>
          {guideData.quickPicks.length > 0 ? (
            <section className={styles.summaryCard} id="quick-picks">
              <h2>{lang === 'ar' ? 'ملخص سريع للأفضل' : 'Quick picks'}</h2>
              <div className={styles.summaryGrid}>
                {summaryCards.slice(0, 3).map((card, index) => (
                  <div className={styles.summaryItem} key={`pick-${index}`}>
                    <div className={styles.summaryIcon}>{card.icon}</div>
                    <strong>{card.label}</strong>
                    <span>{card.title}</span>
                    <p>{card.note}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {comparison ? (
            <section className={styles.tableCard} id="comparison-table">
              <div className={styles.sectionHead}>
                <h2>{guideData.comparisonTitle}</h2>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {(comparison.data?.headers || []).map((header: any, index: number) => (
                        <th key={`header-${index}`}>{pick(header, lang)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(comparison.data?.rows || []).map((row: any[], rowIndex: number) => (
                      <tr key={`row-${rowIndex}`}>
                        {(comparison.data?.headers || []).map((_header: any, cellIndex: number) => (
                          <td key={`cell-${rowIndex}-${cellIndex}`}>{pick(row[cellIndex], lang) || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <div className={styles.restaurants}>
            {restaurants.map((block: any, index: number) => {
              const name = pick(block.data?.name, lang);
              const location = pick(block.data?.location, lang);
              const description = pick(block.data?.description, lang);
              const address = pick(block.data?.address, lang);
              const hours = pick(block.data?.hours, lang);
              const price = pick(block.data?.price, lang);
              const rating = Number(block.data?.rating) || 0;
              const mapUrl = normalizeUrl(block.data?.mapUrl);
              const imageUrl = block.data?.coverUrl || block.data?.cover_image_url || block.data?.imageUrl || block.data?.image || '';
              const pros = (block.data?.pros || []).map((item: any) => pick(item, lang)).filter(Boolean);
              const cons = (block.data?.cons || []).map((item: any) => pick(item, lang)).filter(Boolean);

              return (
                <section className={styles.restaurantCard} id={`restaurant-${block.id}`} key={block.id}>
                  <div className={styles.restaurantTop}>
                    <div className={styles.restaurantCopy}>
                      <div className={styles.restaurantHeader}>
                        <h2 className={styles.titleLine}>
                          <span className={styles.titleName}>{name}</span>
                          {location ? <span className={styles.titleSlash}>/</span> : null}
                          {location ? <span className={styles.locationLabel}>{location}</span> : null}
                        </h2>
                        <div className={styles.stars}>
                          <span>{rating ? rating.toFixed(1) : '—'}</span>
                          <div className={styles.starsRow}>
                            {renderStars(rating).map((active, starIndex) => (
                              <span className={active ? styles.starActive : ''} key={`star-${block.id}-${starIndex}`}>
                                ☆
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={styles.whyBox}>
                        <h3>{lang === 'ar' ? 'لماذا اخترناه؟' : 'Why we picked it'}</h3>
                        <p>{description}</p>
                      </div>

                      <div className={styles.prosCons}>
                        <div>
                          <h4>{lang === 'ar' ? 'الإيجابيات' : 'Pros'}</h4>
                          <ul className={styles.list}>
                            {pros.map((item: string) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4>{lang === 'ar' ? 'السلبيات' : 'Cons'}</h4>
                          <ul className={`${styles.list} ${styles.cons}`}>
                            {cons.map((item: string) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className={styles.restaurantImageWrap}>
                      {imageUrl ? <img className={styles.restaurantImage} src={imageUrl} alt={name} /> : null}
                      <div className={styles.rankBadge}>
                        <small>{lang === 'ar' ? 'المركز' : 'Rank'}</small>
                        <strong>{Number(block.data?.rank) || index + 1}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={styles.restaurantMeta}>
                    {address ? (
                      <div className={styles.metaItem}>
                        <span>{lang === 'ar' ? 'العنوان' : 'Address'}</span>
                        <strong>{address}</strong>
                      </div>
                    ) : null}
                    {price ? (
                      <div className={styles.metaItem}>
                        <span>{lang === 'ar' ? 'متوسط التكلفة' : 'Average cost'}</span>
                        <strong>{price}</strong>
                      </div>
                    ) : null}
                    {hours ? (
                      <div className={styles.metaItem}>
                        <span>{lang === 'ar' ? 'ساعات العمل' : 'Hours'}</span>
                        <strong>{hours}</strong>
                      </div>
                    ) : null}
                  </div>

                  {mapUrl ? (
                    <a className={styles.cta} href={mapUrl} target="_blank" rel="noreferrer">
                      {lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                    </a>
                  ) : null}
                </section>
              );
            })}
          </div>

          {mapBlock && restaurants.length > 0 ? (
            <section className={styles.mapCard} id="guide-map">
              <h2>{lang === 'ar' ? 'الخريطة والمواقع' : 'Map & locations'}</h2>
              <div className={styles.mapLayout}>
                <div className={styles.mapCanvas}>
                  {restaurants.slice(0, 5).map((block: any, index: number) => (
                    <span className={pinClass(index)} key={`map-${block.id}`}>
                      {Number(block.data?.rank) || index + 1}
                    </span>
                  ))}
                </div>
                <div className={styles.mapList}>
                  {restaurants.slice(0, 5).map((block: any, index: number) => {
                    const mapUrl = normalizeUrl(block.data?.mapUrl);
                    return (
                      <div className={styles.mapItem} key={`map-item-${block.id}`}>
                        <strong>
                          {Number(block.data?.rank) || index + 1}. {pick(block.data?.name, lang)}
                        </strong>
                        <span>{pick(block.data?.location, lang) || pick(block.data?.address, lang)}</span>
                        {mapUrl ? (
                          <a href={mapUrl} target="_blank" rel="noreferrer">
                            {lang === 'ar' ? 'فتح في الخرائط' : 'Open map'}
                          </a>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {faq ? (
            <div className={styles.faqCard} id="guide-faq">
              <h2>{pick(faq.data?.title, lang) || 'FAQ'}</h2>
              <div className={styles.faqStack}>
                {(faq.data?.items || []).map((item: any, index: number) => (
                  <details className={styles.faqItem} key={`faq-${index}`}>
                    <summary>{pick(item.q, lang)}</summary>
                    <div>{pick(item.a, lang)}</div>
                  </details>
                ))}
              </div>
            </div>
          ) : null}

          {relatedPosts.length > 0 ? (
            <section className={styles.relatedCard}>
              <div className={styles.sectionHead}>
                <h2>{lang === 'ar' ? 'مقالات ذات صلة' : 'Related articles'}</h2>
              </div>
              <div className={styles.relatedGrid}>
                {relatedPosts.map((item) => {
                  const relatedTitle = lang === 'ar' ? item.title_ar : item.title_en;
                  const relatedExcerpt = lang === 'ar' ? item.excerpt_ar || '' : item.excerpt_en || '';
                  const relatedSlug = lang === 'ar' ? item.slug_ar : item.slug_en;
                  const relatedCategory = item.category
                    ? lang === 'ar'
                      ? item.category.name_ar
                      : item.category.name_en
                    : categoryName;

                  return (
                    <Link className={styles.relatedItem} href={localePath(lang, `blog/${relatedSlug}`)} key={item.id}>
                      <div className={styles.relatedMedia}>
                        {item.cover_image_url || item.og_image_url ? (
                          <img
                            alt={relatedTitle}
                            className={styles.relatedImage}
                            src={item.cover_image_url || item.og_image_url || ''}
                          />
                        ) : null}
                      </div>
                      <div className={styles.relatedBody}>
                        {relatedCategory ? <span className={styles.relatedEyebrow}>{relatedCategory}</span> : null}
                        <strong>{relatedTitle}</strong>
                        {relatedExcerpt ? <p>{relatedExcerpt}</p> : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <div className={styles.tocCard}>
              <h2>{lang === 'ar' ? 'محتويات الدليل' : 'Guide contents'}</h2>
              <ul className={styles.tocList}>
                {guideData.toc.map((item, index) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>
                      <span className={styles.tocIndex}>{index + 1}</span>
                      <strong className={styles.tocLabel}>{item.label}</strong>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h2>{lang === 'ar' ? 'دليل الاختيار' : 'Selection guide'}</h2>
              <p>
                {lang === 'ar'
                  ? 'رتّب أولوياتك بين القيمة والجودة والموقع، ثم قارن بسرعة بين البطاقات والجدول قبل اتخاذ القرار.'
                  : 'Prioritize value, quality, and location, then compare the cards and table before deciding.'}
              </p>
              <p>
                {lang === 'ar'
                  ? 'استخدم الملخص السريع إذا كنت مستعجلًا، ثم افتح الخرائط مباشرة للوصول إلى الخيار الأقرب لك.'
                  : 'Use quick picks if you are in a hurry, then open maps to reach the nearest option.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
