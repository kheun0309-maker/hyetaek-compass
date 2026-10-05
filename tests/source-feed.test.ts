import assert from "node:assert/strict";
import test from "node:test";
import { automationConfig } from "../automation.config";
import { collectDigest, koreaDate, mdLink, parseSource, safeSourceUrl } from "../scripts/lib/source-feed";
import type { TopicDigest, TopicSource } from "../src/lib/topic-types";

const rss: TopicSource = { id: "test", label: "출처", kind: "news", format: "rss", url: "https://www.kado.net/rss/allArticle.xml", home: "https://www.kado.net/", linkHosts: ["www.kado.net"] };
const now = new Date("2026-10-05T02:00:00Z");
const empty: TopicDigest = { topic: "seoraksan", collectedAt: "", checks: [], items: [] };
const item = (title: string, date: string, id: number) => `<item><title><![CDATA[${title}]]></title><link>https://www.kado.net/news/articleView.html?idxno=${id}</link><pubDate>${date}</pubDate></item>`;

test("RSS 날짜는 한국시간, CDATA·태그는 제목 텍스트만 처리", () => {
  const parsed = parseSource(`<rss><channel>${item("설악산 &amp; &lt;b&gt;소식&lt;/b&gt;", "2026-10-05 01:30:00", 1)}</channel></rss>`, rss);
  assert.equal(parsed[0].publishedAt, "2026-10-05");
  assert.equal(parsed[0].title, "설악산 & 소식");
  assert.equal(koreaDate(new Date("2026-10-04T16:30:00Z")), "2026-10-05");
});

test("외부·실행 URL을 제외하고 추적 인자를 제거", () => {
  for (const url of ["javascript:alert(1)", "https://www.kado.net.evil.com/", "https://user@www.kado.net/", "https://evil.com/"]) assert.equal(safeSourceUrl(url, rss), undefined);
  assert.equal(safeSourceUrl("http://www.kado.net/a?idxno=1&utm_source=x#foo", rss), "https://www.kado.net/a?idxno=1");
  assert.equal(parseSource(`<rss><channel><item><title>설악산</title><link>javascript:alert(1)</link><pubDate>2026-10-05</pubDate></item></channel></rss>`, rss).length, 0);
  assert.throws(() => parseSource("<html>차단 페이지</html>", rss));
});

test("Atom alternate URL과 ISO 게시일 처리", () => {
  const source = { ...rss, format: "atom" as const, linkHosts: ["www.youtube.com"] };
  const data = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>설악산 산행</title><link rel="alternate" href="https://www.youtube.com/watch?v=JSiH96MfFNI"/><published>2026-10-04T16:00:00+00:00</published></entry></feed>';
  assert.equal(parseSource(data, source)[0].publishedAt, "2026-10-05");
});

test("기상청 슬래시 날짜와 공원 점 날짜를 인식, 목록 구조 변경은 실패", () => {
  const kma = automationConfig.research.seoraksan.sources.find((s) => s.id === "kma")!;
  const knps = automationConfig.research.seoraksan.sources.find((s) => s.id === "knps")!;
  assert.equal(parseSource('<html><li><a href="../news/notice_view.jsp?articleno=1">설악산 첫 단풍</a><span>2026/09/28</span></li></html>', kma)[0].publishedAt, "2026-09-28");
  assert.equal(parseSource('<html><li><a href="/front/portal/open/pnewsDtl.do?pnewsId=1">설악산 공지</a>2026.10.02</li></html>', knps)[0].publishedAt, "2026-10-02");
  assert.throws(() => parseSource("<html>새 페이지</html>", kma));
});

test("최근 목록은 주제·45일·미래 날짜·중복을 검사", async () => {
  const feed = `<rss><channel>${item("설악산 최근", "2026-10-05", 1)}${item("설악산 중복", "2026-10-05", 1)}${item("설악산 미래", "2026-10-06", 2)}${item("설악산 과거", "2026-08-01", 3)}${item("다른 산 소식", "2026-10-04", 4)}</channel></rss>`;
  const digest = await collectDigest(empty, async (url) => { if (url.includes("kado.net")) return feed; throw new Error("오프라인"); }, now);
  assert.equal(digest.items.length, 1);
  assert.equal(digest.checks.find((check) => check.sourceId === "kado")?.status, "ok");
});

test("출처 장애에는 캐시·마지막 성공일을 유지하며 최신 수집으로 가장하지 않음", async () => {
  const previous: TopicDigest = { topic: "seoraksan", collectedAt: "2026-10-04T02:00:00Z", items: [{ title: "설악산 기존 공지", url: "https://www.kado.net/a", publishedAt: "2026-10-04", sourceId: "kado", sourceName: "신문", kind: "news" }], checks: [{ sourceId: "kado", status: "ok", count: 1, attemptedAt: "2026-10-04T02:00:00Z", checkedAt: "2026-10-04T02:00:00Z" }] };
  const digest = await collectDigest(previous, async () => { throw new Error("실패"); }, now);
  assert.equal(digest.collectedAt, previous.collectedAt);
  assert.equal(digest.items.length, 1);
  const check = digest.checks.find((c) => c.sourceId === "kado")!;
  assert.equal(check.status, "error");
  assert.equal(check.checkedAt, previous.collectedAt);
  assert.equal(check.attemptedAt, now.toISOString());
  const older = await collectDigest(previous, async () => { throw new Error("실패"); }, new Date("2026-12-01T02:00:00Z"));
  assert.equal(older.items.length, 0);
});

test("제목이 Markdown 링크 경계를 탈출하지 않음", () => {
  const link = mdLink({ title: "설악산 ](javascript:alert) <script>", url: "https://www.kado.net/a(test)" });
  assert.ok(link.endsWith("(https://www.kado.net/a%28test%29)"));
  assert.equal((link.match(/\]\(/g) ?? []).length, 1);
});
