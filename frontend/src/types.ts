export interface Term {
  id: number;
  word: string;
  pronunciation_placeholder: string;
  meaning: string;
  usage_scene: string;
  era: string;
  category: string;
  status: 'pending' | 'confirmed' | 'needs_revision';
  created_by: string;
  created_at: string;
  updated_at: string;
  pronunciation_count?: number;
  annotation_count?: number;
  version_count?: number;
}

export interface TermDetail extends Term {
  pronunciations: Pronunciation[];
  annotations: Annotation[];
  versions: Version[];
}

export interface Pronunciation {
  id: number;
  term: number;
  ipa_notation: string;
  tone_description: string;
  phonetic_spelling: string;
  notes: string;
  contributed_by: string;
  role: 'elder' | 'youth';
  created_at: string;
}

export interface Annotation {
  id: number;
  term: number;
  type: 'example_sentence' | 'kinship_term' | 'synonym' | 'mandarin_translation' | 'image_association' | 'family_note';
  content: string;
  extra_data: Record<string, string>;
  contributed_by: string;
  role: 'elder' | 'youth';
  created_at: string;
  updated_at: string;
}

export interface Version {
  id: number;
  term: number;
  interpretation: string;
  scope: string;
  is_common: boolean;
  contributed_by: string;
  role: 'elder' | 'youth';
  created_at: string;
}

export interface Statistics {
  category_distribution: Record<string, number>;
  polysemy_count: { polysemy_count: number; total_terms: number; ratio: number };
  pending_ratio: { pending: number; confirmed: number; needs_revision: number; total: number };
  era_coverage: Record<string, number>;
  overview: { total_terms: number; total_pronunciations: number; total_annotations: number; total_versions: number; pending_count: number };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const ERA_OPTIONS = ['1950年代前', '1950年代', '1960年代', '1970年代', '1980年代', '1990年代', '2000年代', '2010年代及以后'];
export const CATEGORY_OPTIONS = ['日常用语', '亲属称谓', '农事用语', '饮食用语', '旧行话', '俗语谚语', '其他'];
export const STATUS_MAP: Record<string, string> = { pending: '待确认', confirmed: '已确认', needs_revision: '需修订' };
export const ROLE_MAP: Record<string, string> = { elder: '长辈', youth: '晚辈' };
export const ANNOTATION_TYPE_MAP: Record<string, string> = {
  example_sentence: '例句',
  kinship_term: '人物关系称呼',
  synonym: '近义词',
  mandarin_translation: '普通话对照',
  image_association: '图片联想',
  family_note: '家庭备注',
};
