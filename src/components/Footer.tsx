import Link from "next/link";
import { siteConfig, categories } from "../../site.config";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-brand">
          <div className="footer-brand__name">{siteConfig.name}</div>
          <p className="footer-brand__desc">{siteConfig.description}</p>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h3>카테고리</h3>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>사이트</h3>
            <ul>
              <li>
                <Link href="/about">사이트 소개</Link>
              </li>
              <li>
                <Link href="/contact">문의하기</Link>
              </li>
              <li>
                <Link href="/search">통합 검색</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>정책</h3>
            <ul>
              <li>
                <Link href="/privacy">개인정보처리방침</Link>
              </li>
              <li>
                <Link href="/terms">이용약관</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>구독</h3>
            <ul>
              <li>
                <a href="/rss.xml">RSS 피드</a>
              </li>
              <li>
                <a href="/sitemap.xml">사이트맵</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span>
            본 사이트의 정보는 참고용이며, 최종 확인은 각 기관 공식 홈페이지에서
            해주세요.
          </span>
        </div>
      </div>
    </footer>
  );
}
