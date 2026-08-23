"use client";

import { useEffect, useState } from "react";
import AdSlot from "./AdSlot";
import { siteConfig } from "../../site.config";

/**
 * 모바일 하단 고정 앵커 광고.
 *
 * 한국 정보 블로그에서 단일 지면 기준 수익 기여가 가장 큰 자리입니다.
 * 다만 잘못 만들면 정책 위반이 되므로 아래 세 가지를 지킵니다.
 *  1) 닫기 버튼을 반드시 제공 (없으면 "콘텐츠 가림" 위반)
 *  2) 스크롤이 어느 정도 내려간 뒤에만 노출 (첫 화면 즉시 노출 금지)
 *  3) body에 하단 여백을 줘서 콘텐츠를 가리지 않음
 */
export default function StickyAnchorAd() {
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!siteConfig.ads.showStickyAnchor) return;

    // 세션 내에서 닫았으면 다시 띄우지 않습니다.
    if (sessionStorage.getItem("anchor-ad-closed") === "1") {
      setClosed(true);
      return;
    }

    const onScroll = () => {
      if (window.scrollY > 600) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = show && !closed ? "68px" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [show, closed]);

  if (!siteConfig.ads.showStickyAnchor || !show || closed) return null;

  return (
    <div className="anchor-ad" role="complementary" aria-label="하단 광고">
      <button
        type="button"
        className="anchor-ad__close"
        aria-label="광고 닫기"
        onClick={() => {
          setClosed(true);
          sessionStorage.setItem("anchor-ad-closed", "1");
        }}
      >
        ✕
      </button>
      <AdSlot format="anchor" lazy={false} />
    </div>
  );
}
