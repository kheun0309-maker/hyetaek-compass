/**
 * 초안 검토 도우미.
 *
 *   npm run review                      // 검토 대기 중인 초안 목록
 *   npm run review -- --publish <slug>  // 특정 초안 발행 (draft:false, reviewed:true)
 *   npm run review -- --publish-all     // ⚠️ 확인 없이 전부 발행 (권장하지 않음)
 *
 * AI 해설의 금액·절차·근거를 검토한 뒤에만 발행한다.
 * 원문 제목·날짜 목록의 자동 갱신은 refresh-sources.ts에서 별도로 처리한다.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseArgs, str } from "./lib/cli";
import { categoryMap } from "../site.config";
import { isPublished } from "../src/lib/publication";
import { koreaDate } from "./lib/source-feed";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

interface Draft {
  slug: string;
  file: string;
  title: string;
  category: string;
  date: string;
  provider: string;
  chars: number;
}

function listDrafts(): Draft[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: f.replace(/\.mdx?$/, ""),
        file: f,
        title: String(data.title ?? ""),
        category: String(data.category ?? ""),
        date: String(data.date ?? ""),
        provider: String(data.provider ?? "-"),
        chars: content.trim().length,
        draft: !isPublished(data),
      };
    })
    .filter((d) => d.draft)
    .map(({ ...d }) => d as Draft);
}

function publish(slug: string): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error("영문 소문자·숫자·하이픈 슬러그만 발행할 수 있습니다.");
    return false;
  }
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.error(`파일 없음: content/posts/${slug}.md`);
    return false;
  }

  const parsed = matter(fs.readFileSync(file, "utf8"));
  parsed.data.draft = false;
  parsed.data.reviewed = true;
  parsed.data.updated = koreaDate();
  parsed.data.reviewMethod = "editorial";

  fs.writeFileSync(file, matter.stringify(parsed.content, parsed.data), "utf8");
  console.log(`발행: ${slug}`);
  return true;
}

function main() {
  const args = parseArgs();

  const one = str(args.publish);
  if (one) {
    if (!publish(one)) { process.exitCode = 1; return; }
    console.log("\n검색 인덱스를 갱신하세요:  npm run index");
    return;
  }

  if (args["publish-all"] === true) {
    const drafts = listDrafts();
    for (const d of drafts) publish(d.slug);
    console.log(`\n${drafts.length}개 발행 완료. 인덱스 갱신:  npm run index`);
    return;
  }

  const drafts = listDrafts();
  if (drafts.length === 0) {
    console.log("검토 대기 중인 초안이 없습니다.");
    return;
  }

  console.log(`\n검토 대기 초안 ${drafts.length}개\n`);
  console.log("  글자수  카테고리      생성모델                 슬러그");
  console.log("  " + "─".repeat(80));

  for (const d of drafts) {
    const cat = (categoryMap[d.category as never] as { name: string } | undefined)?.name ?? d.category;
    console.log(
      `  ${String(d.chars).padStart(6)}  ${cat.padEnd(10)}  ${d.provider.slice(0, 22).padEnd(24)}  ${d.slug}`,
    );
    console.log(`          ${d.title}`);
  }

  console.log(`
검토 순서
  1. content/posts/<슬러그>.md 를 열어 아래를 확인하세요
     · 금액·소득 기준·기간이 실제 공고와 일치하는가
     · 존재하지 않는 기관명·제도명을 지어내지 않았는가
     · 신청 절차의 단계가 실제 화면과 맞는가
  2. 필요하면 스크린샷을 추가하세요 (경쟁 블로그와 벌어지는 지점입니다)
  3. 확인이 끝나면:  npm run review -- --publish <슬러그>
  4. 마지막에:      npm run index && npm run build
`);
}

main();
