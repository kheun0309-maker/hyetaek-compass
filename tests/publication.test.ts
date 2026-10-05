import assert from "node:assert/strict";
import test from "node:test";
import { isPublished } from "../src/lib/publication";
import { renderMarkdown } from "../src/lib/markdown";
import { boundedCount } from "../scripts/lib/cli";
import { pickKeywords, type Inventory, type KeywordRow } from "../scripts/lib/inventory";
import { categories } from "../site.config";

test("AI 미검토 글은 draft를 꺼도 공개하지 않음, 출처 목록은 별도 발행 가능", () => {
  assert.equal(isPublished({ draft: true, reviewed: true }), false);
  assert.equal(isPublished({ draft: false, aiGenerated: true }), false);
  assert.equal(isPublished({ draft: false, aiGenerated: true, reviewed: false }), false);
  assert.equal(isPublished({ draft: false, aiGenerated: true, reviewed: true }), true);
  assert.equal(isPublished({ draft: false, aiGenerated: false, reviewed: false }), true);
});

test("Markdown HTML·실행 링크를 차단하면서 표·목차는 유지", async () => {
  const result = await renderMarkdown('## location\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[악성](javascript:alert%281%29)\n\n[공식](https://www.knps.or.kr/)\n\n|항목|값|\n|---|---|\n|단풍|확인|');
  const html = result.chunks.join("");
  assert.doesNotMatch(html, /<script|onerror=|href="javascript:/);
  assert.match(html, /href="https:\/\/www.knps.or.kr\//);
  assert.match(html, /<table>/);
  assert.equal(result.headings[0].id, "heading-location");
});

test("생성 개수의 플래그·음수·소수·상한 처리를 검증", () => {
  assert.equal(boundedCount(true, 10, 15), 10);
  assert.equal(boundedCount("-4", 10, 15), 0);
  assert.equal(boundedCount("3.7", 10, 15), 3);
  assert.equal(boundedCount("10000", 10, 15), 15);
  assert.equal(boundedCount("invalid", 10, 15), 10);
});

test("한 배치의 선택마다 삼기둥 비중을 재계산하고 중복 없이 처리", () => {
  const pending: KeywordRow[] = categories.flatMap((cat) => Array.from({ length: 12 }, (_, i) => ({ keyword: `${cat.slug}-${i}`, category: cat.slug, status: "", intent: "" })));
  const counts = Object.fromEntries(categories.map((cat) => [cat.slug, cat.pillar === "tips" ? 20 : 0]));
  const inv: Inventory = { published: 60, total: 60, byCategory: counts, titles: [], slugs: new Set(), pendingKeywords: pending, allKeywords: pending };
  const picks = pickKeywords(inv, 20, true);
  assert.equal(picks.length, 20);
  assert.equal(new Set(picks.map((p) => p.keyword)).size, 20);
  assert.ok(picks.every((p) => categories.find((c) => c.slug === p.category)!.pillar !== "tips"));
  assert.deepEqual(inv.byCategory, counts);
  assert.deepEqual(pickKeywords(inv, 2, false), pending.slice(0, 2));
});
