import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { collectDigest, koreaDate, mdLink } from "./lib/source-feed";
import { parseArgs } from "./lib/cli";
import type { SourceKind, TopicDigest } from "../src/lib/topic-types";

const dataFile = path.join(process.cwd(), "data/topics/seoraksan.json");
const postFile = path.join(process.cwd(), "content/posts/seoraksan-latest-news.md");

function writeAtomic(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, content, "utf8");
  fs.renameSync(`${file}.tmp`, file);
}

async function main() {
  const previous: TopicDigest = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : { topic: "seoraksan", collectedAt: "", items: [], checks: [] };
  if (parseArgs().dry === true) { console.log("설악산 출처 수집 → 날짜·중복 검사 → 소식 글 갱신 (API 키 불필요). dry: 네트워크·파일 변경 없음"); return; }
  const digest = await collectDigest(previous);
  writeAtomic(dataFile, JSON.stringify(digest, null, 2) + "\n");
  for (const check of digest.checks) console.log(`${check.sourceId}: ${check.status} · ${check.count}건`);
  // 모든 공식 출처가 실패하면 기존 발행 글을 최신 글로 위장하지 않는다.
  if (!digest.checks.some((check) => ["knps", "kma"].includes(check.sourceId) && check.status === "ok")) throw new Error("공식 출처 수집 실패. 기존 소식 글을 유지합니다.");
  const today = koreaDate(new Date(digest.collectedAt));
  const names: Record<SourceKind, string> = { official: "공식 공지·기상 소식", news: "신문·지역 소식", video: "최근 유튜브 산행 영상", blog: "블로그 탐방 기록" };
  const sections = (Object.keys(names) as SourceKind[]).map((kind) => {
    const items = digest.items.filter((item) => item.kind === kind);
    return `## ${names[kind]}\n\n` + (items.length ? items.map((item) => `- ${item.publishedAt} · ${mdLink(item)} — ${item.sourceName}`).join("\n") : "현재 수집 범위에서 날짜가 확인되는 최근 자료가 없습니다. 아래 특집에서 공식 채널과 검색 링크를 확인하세요.");
  });
  const failures = digest.checks.filter((check) => check.status === "error");
  const body = `설악산 여행 전에 확인할 공지, 신문 소식, 산행 영상과 블로그 글의 원문을 모았습니다. **${today} 수집 기준**입니다. 제목과 게시일을 안내하며, 기사·영상 본문을 전재하거나 영상 속 장면을 현재 상황으로 단정하지 않습니다.\n\n[설악산 특집 한눈에 보기](/seoraksan) · [교통편 정리](/seoraksan-transport-guide) · [단풍·코스 안내](/seoraksan-autumn-guide)\n\n${failures.length ? `일부 출처(${failures.map((check) => check.sourceId).join(", ")})는 이번 수집에 실패했습니다. 해당 자료는 마지막 성공 때 저장한 목록이며 최신 여부를 원문에서 확인하세요.\n\n` : ""}${sections.join("\n\n")}\n\n## 방문 직전 확인 순서\n\n1. 국립공원공단에서 탐방로 통제와 입산시간을 확인하세요.\n2. 기상청의 단풍 사진은 촬영 날짜·위치를 함께 보세요.\n3. 교통편은 출발지와 돌아오는 정류장 기준으로 다시 조회하세요.\n4. 영상·후기의 게시일과 실제 방문일은 다를 수 있습니다. 개인의 '절정' 표현은 공식 관측 판정과 구분하세요.\n`;
  const old = fs.existsSync(postFile) ? matter(fs.readFileSync(postFile, "utf8")).data : {};
  writeAtomic(postFile, matter.stringify(body, {
    title: "설악산 최근 소식 모음, 공식 공지·유튜브·블로그",
    description: "설악산국립공원 공지, 지역신문, 유튜브 산행 영상과 블로그 글을 게시일·출처와 함께 확인하세요. 교통·단풍 안내로 이어집니다.",
    category: "travel", date: old.date ?? today, updated: today,
    tags: ["설악산", "국립공원", "최근소식", "유튜브", "단풍"],
    draft: false, aiGenerated: false, reviewed: false, reviewMethod: "source-feed",
  }));
  console.log("설악산 소식 갱신 완료 (동일 URL 유지)");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "출처 수집 실패"); process.exitCode = 1; });
