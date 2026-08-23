import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "../../../site.config";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "개인정보처리방침",
  description: `${siteConfig.name}의 개인정보 수집·이용 및 광고 쿠키 정책 안내입니다.`,
  path: "/privacy",
});

/**
 * ⚠️ 애드센스 심사 필수 페이지입니다.
 *    구글은 광고 쿠키 사용 사실과 옵트아웃 방법의 명시를 요구합니다.
 *    아래 내용은 표준 템플릿이며, 실제 운영 사실에 맞게 수정하세요.
 */
export default function PrivacyPage() {
  return (
    <div className="article-wrap legal">
      <h1 className="article-title">개인정보처리방침</h1>
      <div className="article-meta">
        <span>최종 개정일: 2026년 1월 1일</span>
      </div>

      <div className="prose">
        <p>
          {siteConfig.name}(이하 &ldquo;사이트&rdquo;)은 이용자의 개인정보를
          중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
        </p>

        <h2>1. 수집하는 정보</h2>
        <p>
          사이트는 회원가입 절차가 없으며, 이름·연락처 등 개인을 직접 식별할 수
          있는 정보를 직접 수집하지 않습니다. 다만 서비스 이용 과정에서 아래
          정보가 자동으로 생성·수집될 수 있습니다.
        </p>
        <ul>
          <li>접속 IP 주소, 브라우저 종류, 운영체제, 방문 일시</li>
          <li>방문한 페이지 및 사이트 이용 기록</li>
          <li>쿠키(cookie)를 통해 저장되는 방문 식별자</li>
        </ul>

        <h2>2. 수집 목적</h2>
        <ul>
          <li>서비스 이용 통계 분석 및 콘텐츠 품질 개선</li>
          <li>맞춤형 광고 제공 및 광고 성과 측정</li>
          <li>부정 이용 방지 및 서비스 안정성 확보</li>
        </ul>

        <h2>3. 광고 및 쿠키</h2>
        <p>
          사이트는 제3자 광고 사업자인 Google을 포함한 광고 네트워크를 이용합니다.
          Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이전 방문
          기록에 기반한 광고를 게재할 수 있습니다.
        </p>
        <ul>
          <li>
            Google의 광고 쿠키(DoubleClick DART 쿠키) 사용을 원하지 않는 경우,
            Google 광고 설정 페이지에서 맞춤 광고를 해제할 수 있습니다.
          </li>
          <li>
            브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 일부 기능
            이용에 제한이 있을 수 있습니다.
          </li>
        </ul>

        <h2>4. 분석 도구</h2>
        <p>
          사이트는 방문 통계 분석을 위해 Google Analytics를 사용합니다. 수집된
          데이터는 익명화된 형태로 처리되며, 개인을 식별하는 목적으로 사용하지
          않습니다.
        </p>

        <h2>5. 보유 및 이용 기간</h2>
        <p>
          자동 수집된 접속 기록은 수집일로부터 최대 26개월간 보관 후 파기합니다.
          단, 관련 법령에서 별도의 보관 기간을 정한 경우 해당 기간을 따릅니다.
        </p>

        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 자신의 정보에 대한 열람·정정·삭제·처리정지를 요청할
          수 있습니다. 요청은 아래 연락처로 접수해 주세요.
        </p>

        <h2>7. 개인정보 보호 책임자</h2>
        <ul>
          <li>담당: {siteConfig.name} 운영팀</li>
          <li>이메일: {siteConfig.email}</li>
        </ul>

        <h2>8. 고지 의무</h2>
        <p>
          본 방침의 내용 추가·삭제·수정이 있을 경우 시행 7일 전부터 사이트를 통해
          공지합니다.
        </p>
      </div>
    </div>
  );
}
