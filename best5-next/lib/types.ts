export type LocalizedString = {
  ar?: string;
  en?: string;
};

export interface PublicCategory {
  id: string;
  name_ar: string;
  name_en: string;
  slug_ar: string;
  slug_en: string;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PublicPost {
  id: string;
  title_ar: string;
  title_en: string;
  slug_ar: string;
  slug_en: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  seo_title_ar?: string;
  seo_title_en?: string;
  seo_desc_ar?: string;
  seo_desc_en?: string;
  canonical_url?: string;
  og_image_url?: string;
  cover_image_url?: string;
  content_ar?: string;
  content_en?: string;
  content_blocks_json?: any[];
  published_at?: string;
  updated_at?: string;
  category?: PublicCategory | null;
  author?: { full_name?: string | null } | null;
}
