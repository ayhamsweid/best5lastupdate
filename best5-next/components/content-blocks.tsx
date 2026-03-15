import type { Lang } from '@/lib/i18n';

function pick(value: any, lang: Lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value?.[lang] ?? value?.ar ?? value?.en ?? '';
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
    <>
      {blocks.map((block) => {
        if (block.type === 'guide') {
          return (
            <section className="content-section" key={block.id}>
              <h2>{pick(block.data?.title, lang)}</h2>
              <div style={{ whiteSpace: 'pre-line' }}>{pick(block.data?.content, lang)}</div>
            </section>
          );
        }

        if (block.type === 'cards') {
          return (
            <section className="content-section" key={block.id}>
              <h2>{pick(block.data?.title, lang)}</h2>
              <div className="card-grid">
                {(block.data?.cards || []).map((card: any, index: number) => (
                  <article className="article-card" key={`${block.id}-card-${index}`}>
                    <h3>{pick(card.title, lang)}</h3>
                    <p><strong>{pick(card.label, lang)}</strong></p>
                    <p className="muted">{pick(card.note, lang)}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === 'comparison') {
          return (
            <section className="content-section" key={block.id}>
              <h2>{pick(block.data?.title, lang)}</h2>
              <div className="table-wrap">
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
                        {row.map((cell: any, cellIndex: number) => (
                          <td key={`${block.id}-cell-${rowIndex}-${cellIndex}`}>{pick(cell, lang) || '—'}</td>
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
          return (
            <section className="content-section" key={block.id}>
              <h2>{pick(block.data?.name, lang)}</h2>
              <p>{pick(block.data?.description, lang)}</p>
              <ul className="link-list">
                {pick(block.data?.location, lang) ? <li>{pick(block.data?.location, lang)}</li> : null}
                {pick(block.data?.address, lang) ? <li>{pick(block.data?.address, lang)}</li> : null}
                {block.data?.mapUrl ? (
                  <li>
                    <a href={block.data.mapUrl} target="_blank" rel="noreferrer">
                      {lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
          );
        }

        if (block.type === 'faq') {
          return (
            <section className="content-section" key={block.id}>
              <h2>{pick(block.data?.title, lang) || 'FAQ'}</h2>
              {(block.data?.items || []).map((item: any, index: number) => (
                <details key={`${block.id}-faq-${index}`}>
                  <summary>{pick(item.q, lang)}</summary>
                  <div>{pick(item.a, lang)}</div>
                </details>
              ))}
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
