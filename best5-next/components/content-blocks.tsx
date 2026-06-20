import type { Lang } from '@/lib/i18n';

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
  return `${'*'.repeat(safe)}${'-'.repeat(5 - safe)}`;
}

export function extractFaqItems(blocks: any[], lang: Lang) {
  return blocks
    .filter((block) => block.type === 'faq')
    .flatMap((block) =>
      (block.data?.items || []).map((item: any) => ({
        q: pick(item.q, lang),
        a: pick(item.a, lang)
      }))
    )
    .filter((item) => item.q && item.a);
}

export function ContentBlocks({ blocks, lang }: { blocks: any[]; lang: Lang }) {
  return (
    <div className="blocks-flow">
      {blocks.map((block, index) => {
        const sectionId = `section-${block.id || index}`;

        if (block.type === 'guide') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              <div className="section-kicker">{lang === 'ar' ? 'الدليل' : 'Guide'}</div>
              <h2>{pick(block.data?.title, lang) || (lang === 'ar' ? 'نص الدليل' : 'Guide content')}</h2>
              <div className="rich-text" style={{ whiteSpace: 'pre-line' }}>
                {pick(block.data?.content, lang)}
              </div>
            </section>
          );
        }

        if (block.type === 'cards') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              {block.data?.title ? <h2>{pick(block.data?.title, lang)}</h2> : null}
              <div className="card-grid">
                {(block.data?.cards || []).map((card: any, index: number) => (
                  <article className="article-card article-card--feature" key={`${block.id}-card-${index}`}>
                    <div className="card-icon">{(card.icon || 'TOP').slice(0, 3).toUpperCase()}</div>
                    <h3>{pick(card.title, lang)}</h3>
                    {pick(card.label, lang) ? <p className="accent-copy">{pick(card.label, lang)}</p> : null}
                    {pick(card.note, lang) ? <p className="muted">{pick(card.note, lang)}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === 'comparison') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              {block.data?.title ? <h2>{pick(block.data?.title, lang)}</h2> : null}
              <div className="table-wrap compare-table">
                <table>
                  <thead>
                    <tr>
                      {(block.data?.headers || []).map((header: any, index: number) => (
                        <th key={`${block.id}-head-${index}`}>{pick(header, lang)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(block.data?.rows || []).map((row: any[], rowIndex: number) => (
                      <tr key={`${block.id}-row-${rowIndex}`}>
                        {(block.data?.headers || []).map((_header: any, cellIndex: number) => (
                          <td key={`${block.id}-cell-${rowIndex}-${cellIndex}`}>{pick(row[cellIndex], lang) || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        }

        if (block.type === 'restaurant') {
          const title = pick(block.data?.name, lang);
          const location = pick(block.data?.location, lang);
          const description = pick(block.data?.description, lang);
          const address = pick(block.data?.address, lang);
          const hours = pick(block.data?.hours, lang);
          const distance = pick(block.data?.distance, lang);
          const price = pick(block.data?.price, lang);
          const phone = block.data?.phone || '';
          const ratingValue = Number(block.data?.rating) || 0;
          const coverUrl = block.data?.coverUrl || block.data?.cover_image_url || block.data?.imageUrl || block.data?.image || '';
          const pros = (block.data?.pros || []).map((item: any) => pick(item, lang)).filter(Boolean);
          const cons = (block.data?.cons || []).map((item: any) => pick(item, lang)).filter(Boolean);
          const galleryUrls = Array.from(
            new Set([...(block.data?.galleryUrls || []), ...(block.data?.gallery_urls || []), ...(block.data?.images || [])].filter(Boolean))
          );

          return (
            <section className="content-section content-section--restaurant" key={block.id} id={sectionId}>
              <div className="restaurant-layout">
                <div className="restaurant-media">
                  <div className="restaurant-cover">
                    {block.data?.rank ? <div className="restaurant-rank">#{block.data.rank}</div> : null}
                    {coverUrl ? <img src={coverUrl} alt={title || 'Restaurant'} /> : <div className="image-fallback">No image</div>}
                  </div>
                  {galleryUrls.length > 0 ? (
                    <div className="gallery-strip">
                      {galleryUrls.slice(0, 3).map((url: string, index: number) => (
                        <div className="gallery-thumb" key={`${block.id}-gallery-${index}`}>
                          <img src={url} alt="" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="restaurant-copy">
                  <div className="section-kicker">{lang === 'ar' ? 'اختيار محرر' : 'Editor pick'}</div>
                  <h2>
                    {title}
                    {location ? <span className="restaurant-subtitle"> / {location}</span> : null}
                  </h2>
                  <div className="rating-line">
                    <strong>{block.data?.rating ? `${block.data.rating}/5` : '-'}</strong>
                    <span>{renderStars(ratingValue)}</span>
                    {block.data?.reviews ? <span>{`${block.data.reviews} ${lang === 'ar' ? 'مراجعة' : 'reviews'}`}</span> : null}
                  </div>
                  {description ? (
                    <div className="highlight-box">
                      <strong>{lang === 'ar' ? 'لماذا اخترناه؟' : 'Why we picked it'}</strong>
                      <p>{description}</p>
                    </div>
                  ) : null}

                  <div className="pros-cons">
                    {pros.length > 0 ? (
                      <div>
                        <h3>{lang === 'ar' ? 'الإيجابيات' : 'Pros'}</h3>
                        <ul className="clean-list">
                          {pros.map((item: string, index: number) => (
                            <li key={`${block.id}-pro-${index}`}>+ {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {cons.length > 0 ? (
                      <div>
                        <h3>{lang === 'ar' ? 'السلبيات' : 'Cons'}</h3>
                        <ul className="clean-list">
                          {cons.map((item: string, index: number) => (
                            <li key={`${block.id}-con-${index}`}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <div className="info-grid">
                    {address ? <div><span>{lang === 'ar' ? 'العنوان' : 'Address'}</span><strong>{address}</strong></div> : null}
                    {hours ? <div><span>{lang === 'ar' ? 'الساعات' : 'Hours'}</span><strong>{hours}</strong></div> : null}
                    {distance ? <div><span>{lang === 'ar' ? 'المسافة' : 'Distance'}</span><strong>{distance}</strong></div> : null}
                    {price ? <div><span>{lang === 'ar' ? 'السعر' : 'Price'}</span><strong>{price}</strong></div> : null}
                  </div>

                  <div className="hero-actions">
                    {normalizeUrl(block.data?.mapUrl) ? (
                      <a className="button button--primary" href={normalizeUrl(block.data?.mapUrl)} target="_blank" rel="noreferrer">
                        {lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                      </a>
                    ) : null}
                    {phone ? (
                      <a className="button button--ghost" href={`tel:${phone}`}>
                        {lang === 'ar' ? 'اتصل الآن' : 'Call now'}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (block.type === 'summary') {
          return (
            <section className="content-section content-section--summary" key={block.id} id={sectionId}>
              <div className="section-kicker">{lang === 'ar' ? 'ملخص سريع' : 'Quick summary'}</div>
              <h2>{pick(block.data?.title, lang) || (lang === 'ar' ? 'أهم النقاط' : 'Key takeaways')}</h2>
              <ul className="summary-grid">
                {(block.data?.items || []).filter(Boolean).map((item: any, index: number) => (
                  <li key={`${block.id}-item-${index}`}>
                    <span>{index + 1}</span>
                    <strong>{pick(item, lang)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        if (block.type === 'image') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              <figure className="media-frame">
                {block.data?.url ? <img src={block.data.url} alt={pick(block.data?.caption, lang) || 'Image'} /> : null}
                {block.data?.caption ? <figcaption>{pick(block.data.caption, lang)}</figcaption> : null}
              </figure>
            </section>
          );
        }

        if (block.type === 'gallery') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              <div className="gallery-grid">
                {(block.data?.urls || []).filter(Boolean).map((url: string, index: number) => (
                  <div className="gallery-tile" key={`${block.id}-${index}`}>
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === 'map') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              <div className="embed-frame">
                {block.data?.embedUrl ? (
                  <iframe src={block.data.embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                ) : (
                  <div className="image-fallback">Map embed URL missing</div>
                )}
              </div>
            </section>
          );
        }

        if (block.type === 'video') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              <div className="embed-frame">
                {block.data?.embedUrl ? (
                  <iframe
                    src={block.data.embedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="image-fallback">Video embed URL missing</div>
                )}
              </div>
            </section>
          );
        }

        if (block.type === 'cta') {
          return (
            <section className="content-section callout-strip" key={block.id} id={sectionId}>
              <div>
                <div className="section-kicker">{lang === 'ar' ? 'خطوة سريعة' : 'Quick action'}</div>
                <strong>{pick(block.data?.label, lang) || 'CTA'}</strong>
              </div>
              {block.data?.url ? (
                <a className="button button--primary" href={block.data.url} target="_blank" rel="noreferrer">
                  {lang === 'ar' ? 'اذهب' : 'Go'}
                </a>
              ) : null}
            </section>
          );
        }

        if (block.type === 'faq') {
          return (
            <section className="content-section" key={block.id} id={sectionId}>
              <h2>{pick(block.data?.title, lang) || 'FAQ'}</h2>
              <div className="faq-stack">
                {(block.data?.items || []).map((item: any, index: number) => (
                  <details key={`${block.id}-faq-${index}`}>
                    <summary>{pick(item.q, lang)}</summary>
                    <div>{pick(item.a, lang)}</div>
                  </details>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
