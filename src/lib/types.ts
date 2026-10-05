import type { CategorySlug } from "../../site.config";

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  category: CategorySlug;
  date: string;
  updated?: string;
  tags?: string[];
  thumbnail?: string;
  cover?: {
    alt: string;
    author: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
    capturedAt: string;
  };
  sources?: { title: string; url: string }[];
  factCheckedAt?: string;
  reviewMethod?: "editorial" | "source-feed";
  faq?: FaqItem[];
  /** 초안 상태. true면 프로덕션 빌드에서 제외됩니다. */
  draft?: boolean;
  /** AI가 생성한 초안인지 */
  aiGenerated?: boolean;
  /** 사람이 사실 확인을 마쳤는지 */
  reviewed?: boolean;
  /** 생성에 사용된 AI 프로바이더 (기록용) */
  provider?: string;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface Post extends PostFrontmatter {
  slug: string;
  body: string;
  readingMinutes: number;
}

export interface RenderedPost extends Post {
  html: string;
  headings: Heading[];
}

export interface SearchDoc {
  s: string; // slug
  t: string; // title
  d: string; // description
  c: CategorySlug; // category
  g: string[]; // tags
  k: string; // 검색용 정규화 키 (제목+설명+태그)
  ch: string; // 제목 초성
  dt: string; // date
}
