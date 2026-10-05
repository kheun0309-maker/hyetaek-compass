import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post, PostFrontmatter } from "./types";
import type { CategorySlug } from "../../site.config";
import { isPublished } from "./publication";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/** 한글 기준 읽기 시간 추정 (분당 약 500자) */
function estimateReadingMinutes(body: string): number {
  const plain = body.replace(/[#*`>\-[\]()!]/g, "");
  return Math.max(1, Math.round(plain.length / 500));
}

function readPostFile(filename: string): Post | null {
  const full = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const fm = data as Partial<PostFrontmatter>;

  if (!fm.title || !fm.category || !fm.date) {
    console.warn(`[posts] 프론트매터 누락으로 건너뜀: ${filename}`);
    return null;
  }

  return {
    title: fm.title,
    description: fm.description ?? "",
    category: fm.category,
    date: fm.date,
    updated: fm.updated,
    tags: fm.tags ?? [],
    thumbnail: fm.thumbnail,
    faq: fm.faq ?? [],
    draft: fm.draft ?? false,
    aiGenerated: fm.aiGenerated ?? false,
    reviewed: fm.reviewed ?? false,
    provider: fm.provider,
    cover: fm.cover,
    sources: fm.sources,
    factCheckedAt: fm.factCheckedAt,
    reviewMethod: fm.reviewMethod,
    slug: filename.replace(/\.mdx?$/, ""),
    body: content,
    readingMinutes: estimateReadingMinutes(content),
  };
}

let cache: Post[] | null = null;

/**
 * 발행 가능한 모든 글을 최신순으로 반환.
 * draft:true 인 글은 개발 모드에서만 보입니다 (프로덕션 빌드에서 자동 제외).
 */
export function getAllPosts(): Post[] {
  if (cache && process.env.NODE_ENV !== "development") return cache;
  if (!fs.existsSync(POSTS_DIR)) return [];

  const showDrafts = process.env.NODE_ENV === "development";

  cache = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(readPostFile)
    .filter((p): p is Post => p !== null)
    .filter((p) => showDrafts || isPublished(p))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  return cache;
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: CategorySlug): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) {
    for (const t of p.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 관련 글 추천: 같은 카테고리 + 태그 겹침 점수 기준.
 * funissu의 "함께 보면 좋은 글" 섹션에 해당합니다.
 */
export function getRelatedPosts(post: Post, limit = 4): Post[] {
  const tags = new Set(post.tags ?? []);
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 3;
      for (const t of p.tags ?? []) if (tags.has(t)) score += 2;
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.post);
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    totalPages,
    total: items.length,
  };
}
