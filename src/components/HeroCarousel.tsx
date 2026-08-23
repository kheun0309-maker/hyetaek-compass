"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface HeroSlide {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  sub: string;
  href: string;
  cta: string;
  /** 배경 테마 (globals.css의 .hero-slide--{theme}) */
  theme: "mint" | "blue" | "peach";
  emoji: string;
}

const INTERVAL = 6000;

/**
 * 메인 히어로 캐러셀.
 * 자동 재생 + 좌우 이동 + 일시정지를 제공하고,
 * 접근성을 위해 키보드 조작과 aria-live 안내를 넣었습니다.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (!playing || slides.length <= 1) return;

    // 사용자가 애니메이션 최소화를 켰다면 자동 재생하지 않습니다.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, slides.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  };

  return (
    <section
      className="hero-carousel"
      aria-roledescription="캐러셀"
      aria-label="주요 안내"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
    >
      {slides.map((s, i) => (
        <div
          key={s.title}
          className={`hero-slide hero-slide--${s.theme}${i === index ? " is-active" : ""}`}
          aria-hidden={i !== index}
        >
          <div className="wrap hero-slide__inner">
            <div className="hero-slide__text">
              <span className="hero-slide__eyebrow">{s.eyebrow}</span>
              <h2 className="hero-slide__title">
                {s.title}
                {s.titleAccent && (
                  <>
                    <br />
                    <strong>{s.titleAccent}</strong>
                  </>
                )}
              </h2>
              <p className="hero-slide__sub">{s.sub}</p>
              <Link
                href={s.href}
                className="hero-slide__cta"
                tabIndex={i === index ? 0 : -1}
              >
                {s.cta}
              </Link>
            </div>

            <div className="hero-slide__art" aria-hidden="true">
              <span className="hero-slide__blob" />
              <span className="hero-slide__emoji">{s.emoji}</span>
              <span className="hero-slide__dot hero-slide__dot--a" />
              <span className="hero-slide__dot hero-slide__dot--b" />
              <span className="hero-slide__dot hero-slide__dot--c" />
            </div>
          </div>
        </div>
      ))}

      <div className="wrap hero-controls">
        <button
          type="button"
          className="hero-controls__btn"
          onClick={() => go(index - 1)}
          aria-label="이전 슬라이드"
        >
          ‹
        </button>

        <div className="hero-controls__dots">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`hero-controls__dot${i === index ? " is-active" : ""}`}
              onClick={() => go(i)}
              aria-label={`${i + 1}번 슬라이드로 이동`}
              aria-current={i === index}
            />
          ))}
        </div>

        <button
          type="button"
          className="hero-controls__btn"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "자동 넘김 정지" : "자동 넘김 시작"}
        >
          {playing ? "❙❙" : "▶"}
        </button>

        <button
          type="button"
          className="hero-controls__btn"
          onClick={() => go(index + 1)}
          aria-label="다음 슬라이드"
        >
          ›
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {slides[index].title} {slides[index].titleAccent ?? ""}
      </p>
    </section>
  );
}
