import { automationConfig } from "../../automation.config";
import type { SourceItem, TopicDigest, TopicSource } from "../../src/lib/topic-types";

export function koreaDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function plainText(raw: string): string {
  return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:x[\da-f]+|\d+);/gi, (entity) => {
      const named: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&nbsp;": " " };
      if (named[entity]) return named[entity];
      const number = entity.startsWith("&#x") ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10);
      return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : "";
    }).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function tag(block: string, name: string): string {
  return new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i").exec(block)?.[1] ?? "";
}

function dateOf(raw: string): string {
  const value = plainText(raw);
  if (!value) return "";
  // 공식 페이지·신문 RSS에 시간대가 없으면 한국 시간으로 해석한다.
  const local = /^(\d{4})[./-](\d{2})[./-](\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value);
  const input = local ? `${local[1]}-${local[2]}-${local[3]}T${local[4] ?? "00"}:${local[5] ?? "00"}:${local[6] ?? "00"}+09:00` : value;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? "" : koreaDate(date);
}

export function safeSourceUrl(raw: string, source: TopicSource): string | undefined {
  try {
    const url = new URL(plainText(raw), source.url);
    if (!source.linkHosts.includes(url.hostname) || url.username || url.password || !["http:", "https:"].includes(url.protocol)) return;
    url.protocol = "https:";
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fromRss$|trackingCode$)/.test(key)) url.searchParams.delete(key);
    return url.toString();
  } catch { return; }
}

export function parseSource(text: string, source: TopicSource): SourceItem[] {
  const rows: { title: string; url: string; date: string }[] = [];
  if (source.format === "rss" || source.format === "atom") {
    const root = source.format === "rss" ? /<rss[\s>]/i : /<feed[\s>]/i;
    if (!root.test(text)) throw new Error("RSS/Atom 문서가 아닙니다");
    const entry = source.format === "rss" ? "item" : "entry";
    for (const match of text.matchAll(new RegExp(`<${entry}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${entry}>`, "gi"))) {
      const block = match[1];
      const atomLink = [...block.matchAll(/<link\b([^>]+)\/?\s*>/gi)]
        .find((m) => /rel=["']alternate["']/.test(m[1]))?.[1];
      const href = atomLink ? /href=["']([^"']+)["']/.exec(atomLink)?.[1] : undefined;
      rows.push({ title: tag(block, "title"), url: href ?? tag(block, "link"), date: tag(block, "pubDate") || tag(block, "published") || tag(block, "dc:date") });
    }
  } else {
    if (!/<html[\s>]/i.test(text)) throw new Error("HTML 문서가 아닙니다");
    let recognized = false;
    for (const match of text.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
      const block = match[1];
      for (const anchor of block.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        const supported = source.format === "knps" ? /(?:pnewsDtl|epil_viewNews)/.test(anchor[1]) : /news\/.*view\.jsp/.test(anchor[1]);
        if (!supported) continue;
        recognized = true;
        const date = /20\d{2}[./-]\d{2}[./-]\d{2}/.exec(plainText(block))?.[0] ?? "";
        rows.push({ title: anchor[2], url: anchor[1], date });
      }
    }
    if (!recognized) throw new Error("공지 목록 구조를 확인할 수 없습니다");
  }
  return rows.flatMap((row) => {
    const title = plainText(row.title).slice(0, 300);
    const url = safeSourceUrl(row.url, source);
    const publishedAt = dateOf(row.date);
    return title && url && publishedAt ? [{ title, url, publishedAt, sourceId: source.id, sourceName: source.label, kind: source.kind }] : [];
  });
}

export async function fetchSource(url: string): Promise<string> {
  const cfg = automationConfig.research;
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(cfg.timeoutMs), headers: { "User-Agent": "AdminWalk/1.0 (+source-link-directory)" } });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > cfg.maxResponseBytes) { await reader.cancel(); throw new Error("응답 크기 제한 초과"); }
        chunks.push(value);
      }
      return Buffer.concat(chunks).toString("utf8");
    } catch (error) {
      if (attempt >= cfg.retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}

export async function collectDigest(previous: TopicDigest, fetcher = fetchSource, now = new Date()): Promise<TopicDigest> {
  const cfg = automationConfig.research;
  const date = koreaDate(now);
  const cutoff = koreaDate(new Date(now.getTime() - cfg.recentDays * 86400000));
  const recent = (item: SourceItem) => item.publishedAt >= cutoff && item.publishedAt <= date;
  const results = await Promise.all(cfg.seoraksan.sources.map(async (source) => {
    const old = previous.checks.find((check) => check.sourceId === source.id);
    try {
      const items = parseSource(await fetcher(source.url), source)
        .filter((item) => cfg.seoraksan.terms.some((term) => item.title.includes(term)))
        .filter(recent).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, cfg.maxItemsPerSource);
      return { items, check: { sourceId: source.id, status: "ok" as const, attemptedAt: now.toISOString(), checkedAt: now.toISOString(), count: items.length } };
    } catch {
      const items = previous.items.filter((item) => item.sourceId === source.id && recent(item));
      return { items, check: { sourceId: source.id, status: "error" as const, attemptedAt: now.toISOString(), checkedAt: old?.checkedAt, count: items.length } };
    }
  }));
  const seen = new Set<string>();
  const items = results.flatMap((result) => result.items).filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.url.localeCompare(b.url));
  return { topic: "seoraksan", collectedAt: results.some((result) => result.check.status === "ok") ? now.toISOString() : previous.collectedAt, items, checks: results.map((result) => result.check) };
}

export function mdLink(item: Pick<SourceItem, "title" | "url">): string {
  return `[${item.title.replace(/[\[\]<>\\`*_]/g, "")}](${item.url.replace(/\(/g, "%28").replace(/\)/g, "%29")})`;
}
