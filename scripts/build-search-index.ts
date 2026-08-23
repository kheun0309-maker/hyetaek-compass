/**
 * 검색 인덱스 빌더.
 * content/posts/*.md → public/search-index.json
 *
 * 서버(검색 API) 없이 클라이언트에서 전문 검색이 가능하도록,
 * 정규화된 키와 초성 키를 미리 만들어 둡니다.
 *
 * 실행: npm run index   (npm run build 시 자동 실행)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { toChosung, normalize } from "../src/lib/hangul";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUT = path.join(process.cwd(), "public", "search-index.json");

interface Doc {
  s: string;
  t: string;
  d: string;
  c: string;
  g: string[];
  k: string;
  ch: string;
  dt: string;
}

function stripMd(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`[index] ${POSTS_DIR} 없음`);
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f));

  const docs: Doc[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    if (data.draft === true) continue;
    if (!data.title || !data.category) continue;

    const title = String(data.title);
    const desc = String(data.description ?? "");
    const tags: string[] = Array.isArray(data.tags) ? data.tags.map(String) : [];

    // 본문은 앞 600자만 인덱싱 (인덱스 파일 크기 억제)
    const bodyHead = stripMd(content).slice(0, 600);
    const searchable = [title, desc, tags.join(" "), bodyHead].join(" ");

    docs.push({
      s: file.replace(/\.mdx?$/, ""),
      t: title,
      d: desc,
      c: String(data.category),
      g: tags,
      k: normalize(searchable),
      ch: normalize(toChosung(`${title} ${tags.join(" ")}`)),
      dt: String(data.date ?? ""),
    });
  }

  docs.sort((a, b) => (a.dt < b.dt ? 1 : -1));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(docs), "utf8");

  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`[index] ${docs.length}개 문서 인덱싱 완료 → public/search-index.json (${kb} KB)`);
}

main();
