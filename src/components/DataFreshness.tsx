"use client";

import { useEffect, useState } from "react";

/** 정적 배포가 멈춰도 열람 시점 기준으로 오래된 수집 상태를 알린다. */
export default function DataFreshness({ collectedAt, staleHours }: { collectedAt: string; staleHours: number }) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const check = () => {
      const time = Date.parse(collectedAt);
      setStale(!Number.isFinite(time) || Date.now() - time > staleHours * 3600000);
    };
    check();
    const timer = setInterval(check, 3600000);
    return () => clearInterval(timer);
  }, [collectedAt, staleHours]);
  return stale ? <p className="notice" role="status">원문 목록 수집이 {staleHours}시간 이상 지났습니다. 최신 공지와 운행 상황은 원문에서 확인하세요.</p> : null;
}
