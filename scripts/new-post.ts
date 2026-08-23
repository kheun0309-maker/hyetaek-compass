/**
 * 빈 글 템플릿 생성기 (AI 없이 직접 쓸 때).
 *   npm run new -- --slug youth-monthly-rent --title "청년월세 특별지원 신청방법" --category housing
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs, str } from "./lib/cli";
import { categories } from "../site.config";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const args = parseArgs();
const slug = str(args.slug);
const title = str(args.title) ?? "제목을 입력하세요";
const category = str(args.category) ?? "subsidy";

if (!slug) {
  console.error('사용법: npm run new -- --slug my-post-slug --title "제목" --category housing');
  process.exit(1);
}
if (!categories.some((c) => c.slug === category)) {
  console.error(`카테고리는 다음 중 하나: ${categories.map((c) => c.slug).join(", ")}`);
  process.exit(1);
}

const dest = path.join(POSTS_DIR, `${slug}.md`);
if (fs.existsSync(dest)) {
  console.error(`이미 존재합니다: ${dest}`);
  process.exit(1);
}

const template = `---
title: "${title}"
description: ""
category: "${category}"
date: "${new Date().toISOString().slice(0, 10)}"
tags: []
faq:
  - q: ""
    a: ""
draft: true
aiGenerated: false
reviewed: false
---

도입부 2~3문장. 누가 얼마를 받을 수 있는지 핵심부터 씁니다.

## 한눈에 보기

| 항목 | 내용 |
| --- | --- |
| 지원 대상 |  |
| 지원 금액 |  |
| 신청 기간 |  |
| 신청처 |  |

## 지원 대상 및 자격 요건

## 신청 방법

### 온라인 신청

1.
2.

### 방문 신청

1.
2.

## 필요 서류

## 자주 묻는 질문

## 마무리
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(dest, template, "utf8");
console.log(`생성 완료: content/posts/${slug}.md`);
