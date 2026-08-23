"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export interface CarouselCard {
  badge: string;
  badgeTone: "service" | "recommend" | "new";
  title: string;
  desc: string;
  href: string;
}

/**
 * 가로 스크롤 카드 캐러셀.
 * 좌우 버튼으로 한 화면씩 밀며, 터치/트랙패드 스와이프도 그대로 동작합니다.
 */
export default function CardCarousel({ cards }: { cards: CarouselCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const slide = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (cards.length === 0) return null;

  return (
    <div className="card-carousel">
      <div className="card-carousel__track" ref={trackRef}>
        {cards.map((c) => (
          <Link key={c.href + c.title} href={c.href} className="feature-card">
            <span className={`feature-card__badge is-${c.badgeTone}`}>{c.badge}</span>
            <span className="feature-card__title">{c.title}</span>
            <span className="feature-card__desc">{c.desc}</span>
          </Link>
        ))}
      </div>

      <div className="card-carousel__nav">
        <button
          type="button"
          onClick={() => slide(-1)}
          disabled={atStart}
          aria-label="이전 카드"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => slide(1)}
          disabled={atEnd}
          aria-label="다음 카드"
        >
          ›
        </button>
      </div>
    </div>
  );
}
