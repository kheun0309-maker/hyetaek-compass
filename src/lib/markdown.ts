import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import type { Heading } from "./types";

/* hast 노드 최소 타입 (unist 호환) */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/** 외부 제목·AI 초안의 링크가 실행 가능한 URL이 되지 않게 한다. HTML 원문은 해석하지 않는다. */
function safeLinks() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.properties) {
        for (const key of ["href", "src"]) {
          const value = node.properties[key];
          if (typeof value !== "string") continue;
          const normalized = value.replace(/[\u0000-\u0020\u007f]/g, "");
          const scheme = /^([a-z][a-z\d+.-]*):/i.exec(normalized)?.[1]?.toLowerCase();
          const allowed = key === "href" ? ["http", "https", "mailto", "tel"] : ["http", "https"];
          if (scheme && !allowed.includes(scheme)) delete node.properties[key];
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

const toHast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug, { prefix: "heading-" })
  .use(safeLinks);

const toHtml = unified().use(rehypeStringify);

export interface RenderResult {
  /** 광고 삽입 지점으로 분할된 HTML 조각들 */
  chunks: string[];
  headings: Heading[];
}

/**
 * 마크다운 → HTML.
 * 본문 H2를 기준으로 광고 삽입 지점을 계산해 HTML을 여러 조각으로 나눠 반환합니다.
 * (funissu가 쓰는 자동광고와 달리, 위치를 직접 통제해 CLS를 막습니다.)
 *
 * @param adEveryNHeadings N개의 H2마다 광고 1개. 0이면 분할하지 않음.
 */
export async function renderMarkdown(
  markdown: string,
  adEveryNHeadings = 2,
): Promise<RenderResult> {
  const mdast = toHast.parse(markdown);
  const hast = (await toHast.run(mdast)) as unknown as HastNode;
  const children = hast.children ?? [];

  const headings: Heading[] = [];
  const splitAt: number[] = [];
  let h2Count = 0;

  children.forEach((node, i) => {
    if (node.type !== "element" || !node.tagName) return;
    const m = /^h([2-4])$/.exec(node.tagName);
    if (!m) return;

    headings.push({
      id: String(node.properties?.id ?? ""),
      text: textOf(node),
      level: Number(m[1]),
    });

    if (m[1] === "2") {
      h2Count += 1;
      // 첫 H2 앞에는 광고를 넣지 않음 (도입부 직후는 이탈률이 높음)
      if (
        adEveryNHeadings > 0 &&
        h2Count > 1 &&
        (h2Count - 1) % adEveryNHeadings === 0
      ) {
        splitAt.push(i);
      }
    }
  });

  const boundaries = [0, ...splitAt, children.length];
  const chunks: string[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const slice = children.slice(boundaries[i], boundaries[i + 1]);
    if (slice.length === 0) continue;
    chunks.push(
      toHtml.stringify({ type: "root", children: slice } as never) as string,
    );
  }

  return { chunks: chunks.length ? chunks : [""], headings };
}

/** 마크다운에서 순수 텍스트만 뽑기 (검색 인덱스/요약용) */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
