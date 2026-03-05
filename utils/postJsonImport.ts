type Localized = { ar?: string; en?: string };

const makeId = () => Math.random().toString(36).slice(2);

const asString = (value: any) => (value == null ? '' : String(value));

const toLocalized = (value: any, fallbackToBoth = false): Localized => {
  if (value == null) return { ar: '', en: '' };
  if (typeof value === 'object' && (value.ar != null || value.en != null)) {
    return {
      ar: value.ar != null ? asString(value.ar) : '',
      en: value.en != null ? asString(value.en) : ''
    };
  }
  const text = asString(value);
  return fallbackToBoth ? { ar: text, en: text } : { ar: text, en: '' };
};

const pickSection = (sections: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    if (sections[key] != null) return sections[key];
  }
  return null;
};

const normalizeJsonText = (text: string) => {
  let raw = (text || '').trim();
  while (raw.startsWith('(') && raw.endsWith(')')) {
    raw = raw.slice(1, -1).trim();
  }
  if (raw.endsWith(';')) raw = raw.slice(0, -1).trim();
  return raw;
};

export const parseImportedPostJson = (text: string): { values: Record<string, any>; blocks: any[] } => {
  const payload = JSON.parse(normalizeJsonText(text) || '{}');
  const meta = payload.meta && typeof payload.meta === 'object' ? payload.meta : payload;
  const sections = payload.sections && typeof payload.sections === 'object' ? payload.sections : {};

  const values: Record<string, any> = {
    title_ar: meta.title_ar || '',
    title_en: meta.title_en || '',
    slug_ar: meta.slug_ar || '',
    slug_en: meta.slug_en || '',
    excerpt_ar: meta.excerpt_ar || '',
    excerpt_en: meta.excerpt_en || '',
    seo_title_ar: meta.seo_title_ar || '',
    seo_title_en: meta.seo_title_en || '',
    seo_desc_ar: meta.seo_desc_ar || '',
    seo_desc_en: meta.seo_desc_en || '',
    canonical_url: meta.canonical_url || '',
    cover_image_url: meta.cover_image_url || '',
    og_image_url: meta.og_image_url || '',
    status: meta.status || 'DRAFT',
    published_at: meta.published_at || '',
    category_id: meta?.category?.id || meta.category_id || null
  };

  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  values.tag_ids = tags.map((tag: any) => (typeof tag === 'string' ? tag : tag?.id)).filter(Boolean);

  if (Array.isArray(payload.content_blocks_json)) {
    const blocks = payload.content_blocks_json.map((block: any) => ({ ...block, id: block?.id || makeId() }));
    return { values, blocks };
  }

  const blocks: any[] = [];

  const guide = pickSection(sections, ['الدليل', 'Guide', 'guide']);
  if (guide && typeof guide === 'object') {
    blocks.push({
      id: makeId(),
      type: 'guide',
      data: {
        title: {
          ar: asString(guide.title_ar || guide.title || 'الدليل'),
          en: asString(guide.title_en || 'Guide')
        },
        content: {
          ar: asString(guide.content_ar || guide.content || ''),
          en: asString(guide.content_en || '')
        }
      }
    });
  }

  const quickPicks = pickSection(sections, ['ملخص سريع للأفضل', 'Quick Picks', 'quick_picks']);
  if (Array.isArray(quickPicks) && quickPicks.length) {
    blocks.push({
      id: makeId(),
      type: 'cards',
      data: {
        title: { ar: 'ملخص سريع للأفضل', en: 'Quick Picks' },
        cards: quickPicks.map((item: any) => ({
          title: toLocalized(item?.title, true),
          label: toLocalized(item?.hotel ?? item?.label ?? '', true),
          note: toLocalized(item?.note ?? '', true),
          icon: asString(item?.icon || 'Star')
        }))
      }
    });
  }

  const comparison = pickSection(sections, ['جدول مقارنة سريع', 'Quick Comparison', 'comparison']);
  if (comparison && typeof comparison === 'object') {
    const headersRaw = Array.isArray(comparison.headers) ? comparison.headers : [];
    const headers = headersRaw.map((h: any) => toLocalized(h, true));
    const rowsRaw = Array.isArray(comparison.rows) ? comparison.rows : [];
    const rows = rowsRaw.map((row: any) => {
      if (Array.isArray(row)) return row.map((cell: any) => toLocalized(cell, true));
      if (row && typeof row === 'object') {
        return headersRaw.map((headerKey: any, idx: number) => {
          const key = typeof headerKey === 'string' ? headerKey : idx;
          return toLocalized(row[key] ?? row[String(key)] ?? '', true);
        });
      }
      return headersRaw.map(() => toLocalized('', true));
    });
    blocks.push({
      id: makeId(),
      type: 'comparison',
      data: {
        title: { ar: 'جدول مقارنة سريع', en: 'Quick Comparison' },
        headers: headers.length ? headers : [{ ar: '#', en: '#' }],
        rows: rows.length ? rows : [[{ ar: '', en: '' }]]
      }
    });
  }

  const hotels = pickSection(sections, ['الفنادق', 'Hotels', 'restaurants']);
  if (Array.isArray(hotels) && hotels.length) {
    hotels.forEach((item: any, idx: number) => {
      blocks.push({
        id: makeId(),
        type: 'restaurant',
        data: {
          rank: Number(item?.rank ?? idx + 1),
          name: toLocalized(item?.name, true),
          location: toLocalized(item?.location || '', true),
          rating: Number(item?.rating ?? 0),
          reviews: Number(item?.reviews ?? 0),
          description: toLocalized(item?.description || '', true),
          coverUrl: asString(item?.cover_url || item?.coverUrl || ''),
          galleryUrls: Array.isArray(item?.gallery_urls) ? item.gallery_urls.map(asString) : [],
          pros: Array.isArray(item?.pros) ? item.pros.map((v: any) => toLocalized(v, true)) : [],
          cons: Array.isArray(item?.cons) ? item.cons.map((v: any) => toLocalized(v, true)) : [],
          address: toLocalized(item?.address || '', true),
          hours: toLocalized(item?.hours || '', true),
          distance: toLocalized(item?.distance || '', true),
          price: toLocalized(item?.price || '', true),
          mapUrl: asString(item?.map_url || item?.mapUrl || ''),
          phone: asString(item?.phone || '')
        }
      });
    });
  }

  const faq = pickSection(sections, ['الأسئلة الشائعة', 'FAQ', 'faq']);
  if (Array.isArray(faq) && faq.length) {
    blocks.push({
      id: makeId(),
      type: 'faq',
      data: {
        title: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
        items: faq.map((item: any) => ({
          q: toLocalized(item?.question ?? item?.q ?? '', true),
          a: toLocalized(item?.answer ?? item?.a ?? '', true)
        }))
      }
    });
  }

  if (!blocks.length) {
    blocks.push({
      id: makeId(),
      type: 'paragraph',
      data: { text: { ar: 'تعذر استخراج الأقسام من ملف JSON.', en: 'Could not extract sections from JSON file.' } }
    });
  }

  return { values, blocks };
};

