"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../../site.config";

export type AdFormat = "in-article" | "display" | "anchor";

interface AdSlotProps {
  format?: AdFormat;
  /** 지정하면 site.config의 기본 슬롯 대신 이 슬롯 ID를 사용 */
  slot?: string;
  /**
   * 화면에 가까워질 때 광고를 요청합니다.
   * 첫 화면 밖 광고는 지연 로딩해야 LCP가 좋아지고, 노출되지 않은 광고 요청이
   * 줄어 뷰어빌리티(=단가)가 올라갑니다.
   */
  lazy?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function slotFor(format: AdFormat): string {
  const s = siteConfig.adsense.slots;
  if (format === "in-article") return s.inArticle;
  if (format === "anchor") return s.anchor;
  return s.display;
}

/**
 * 애드센스 광고 슬롯.
 *
 * 설계 의도:
 * - client가 비어 있으면(=승인 전) 실제와 같은 크기의 자리표시자를 그립니다.
 *   개발 중에도 광고를 포함한 최종 레이아웃을 그대로 볼 수 있습니다.
 * - CSS에서 min-height를 예약해 CLS(레이아웃 이동)를 0에 가깝게 유지합니다.
 *   funissu가 쓰는 자동광고는 이 부분을 통제할 수 없어 Core Web Vitals에 불리합니다.
 * - lazy=true면 IntersectionObserver로 뷰포트 근처에서만 광고를 요청합니다.
 */
export default function AdSlot({
  format = "in-article",
  slot,
  lazy = true,
}: AdSlotProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [visible, setVisible] = useState(!lazy);

  const client = siteConfig.adsense.client;
  const slotId = slot ?? slotFor(format);

  // 뷰포트 300px 전에 미리 로드
  useEffect(() => {
    if (!lazy || visible || !wrapRef.current) return;
    const el = wrapRef.current;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, visible]);

  useEffect(() => {
    if (!visible || !client || !slotId || pushed.current) return;
    // StrictMode의 이중 실행에서 중복 push를 막습니다.
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      /* 광고 차단기로 실패해도 페이지는 정상 동작해야 합니다 */
    }
  }, [visible, client, slotId]);

  const className = `ad ad--${format}`;

  if (!client || !slotId) {
    return (
      <div ref={wrapRef} className={className} aria-hidden="true">
        <span className="ad__label">광고</span>
        <div className="ad__placeholder">
          광고 자리 · {format}
          <br />
          <small>site.config.ts의 adsense 값을 채우면 실제 광고가 표시됩니다</small>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={className}>
      <span className="ad__label">광고</span>
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format={format === "in-article" ? "fluid" : "auto"}
          {...(format === "in-article"
            ? { "data-ad-layout": "in-article" }
            : { "data-full-width-responsive": "true" })}
        />
      )}
    </div>
  );
}
