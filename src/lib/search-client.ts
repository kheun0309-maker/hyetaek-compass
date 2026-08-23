"use client";

import { useEffect, useState } from "react";
import { normalize, toChosung, isChosungQuery } from "./hangul";
import type { SearchDoc } from "./types";

export interface SearchHit extends SearchDoc {
  score: number;
}

let cached: SearchDoc[] | null = null;
let inflight: Promise<SearchDoc[]> | null = null;

/** 검색 인덱스를 한 번만 받아 메모리에 캐시 */
export function loadIndex(): Promise<SearchDoc[]> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;

  inflight = fetch("/search-index.json")
    .then((r) => (r.ok ? r.json() : []))
    .then((data: SearchDoc[]) => {
      cached = Array.isArray(data) ? data : [];
      return cached;
    })
    .catch(() => {
      cached = [];
      return cached;
    });

  return inflight;
}

/**
 * 검색 점수 계산.
 * 제목 앞부분 일치 > 제목 포함 > 태그 일치 > 본문 포함 순으로 가중치를 줍니다.
 */
export function search(docs: SearchDoc[], query: string, limit = 20): SearchHit[] {
  const q = normalize(query);
  if (q.length === 0) return [];

  const chosung = isChosungQuery(query);
  const hits: SearchHit[] = [];

  for (const doc of docs) {
    let score = 0;

    if (chosung) {
      // 초성 검색: "ㅊㄴㅇㅅ" → "청년월세"
      const idx = doc.ch.indexOf(q);
      if (idx === 0) score = 90;
      else if (idx > 0) score = 55;
    } else {
      const nTitle = normalize(doc.t);
      const nTags = normalize(doc.g.join(" "));

      if (nTitle.startsWith(q)) score = 100;
      else if (nTitle.includes(q)) score = 75;
      else if (nTags.includes(q)) score = 50;
      else if (doc.k.includes(q)) score = 30;

      // 초성으로도 걸리면 보조 점수
      if (score === 0 && doc.ch.includes(normalize(toChosung(query)))) score = 20;
    }

    if (score > 0) hits.push({ ...doc, score });
  }

  return hits
    .sort((a, b) => b.score - a.score || (a.dt < b.dt ? 1 : -1))
    .slice(0, limit);
}

/** 인덱스 로딩 상태를 다루는 훅 */
export function useSearchIndex(enabled: boolean) {
  const [docs, setDocs] = useState<SearchDoc[] | null>(cached);

  useEffect(() => {
    if (!enabled || docs) return;
    let alive = true;
    loadIndex().then((d) => {
      if (alive) setDocs(d);
    });
    return () => {
      alive = false;
    };
  }, [enabled, docs]);

  return docs;
}
