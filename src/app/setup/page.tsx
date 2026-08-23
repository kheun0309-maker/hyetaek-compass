import type { Metadata } from "next";
import Link from "next/link";
import {
  getSetupStatus,
  getContentStats,
  getProgress,
  getDeploySteps,
  type StatusLevel,
} from "@/lib/setup-status";
import { siteConfig } from "../../../site.config";

export const dynamic = "force-static";

/**
 * 운영자용 설정 대시보드.
 *
 * ⚠️ 검색엔진에 노출되지 않도록 noindex 처리했고 robots.txt에서도 차단합니다.
 * ⚠️ API 키 등 비밀값은 이 페이지에 절대 표시하지 않습니다.
 *    (키 점검은 터미널 전용:  npm run doctor)
 */
export const metadata: Metadata = {
  title: "설정 대시보드",
  robots: { index: false, follow: false, nocache: true },
};

const ICON: Record<StatusLevel, string> = {
  done: "✅",
  todo: "❗",
  optional: "○",
};

const COMMANDS = [
  { cmd: "npm run doctor", desc: "API 키 연결 테스트 + 설정 진단 (터미널)" },
  { cmd: "npm run doctor -- --models", desc: "내 계정에서 쓸 수 있는 모델 ID 확인" },
  { cmd: "npm run pipeline", desc: "키워드 발굴 → 초안 생성 → 인덱스 갱신" },
  { cmd: "npm run pipeline -- --dry", desc: "비용 없이 계획만 미리보기" },
  { cmd: "npm run review", desc: "검토 대기 초안 목록" },
  { cmd: "npm run review -- --publish <슬러그>", desc: "초안 발행" },
  { cmd: "npm run build:static", desc: "배포용 정적 빌드 (out/)" },
  { cmd: "npm run preview:static", desc: "배포본을 Cloudflare 런타임으로 확인" },
];

export default function SetupPage() {
  const groups = getSetupStatus();
  const stats = getContentStats();
  const progress = getProgress(groups);
  const deploySteps = getDeploySteps();
  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <div className="article-wrap setup">
      <div className="setup__head">
        <span className="setup__badge">운영자 전용 · 검색 노출 안 됨</span>
        <h1 className="article-title">설정 대시보드</h1>
        <p className="setup__lead">
          {siteConfig.name} 운영에 필요한 항목이 어디까지 되어 있는지 한눈에
          보여줍니다. 이 페이지는 <code>site.config.ts</code> 값과 글 통계만
          읽으며, <strong>API 키 같은 비밀값은 표시하지 않습니다.</strong>
        </p>
      </div>

      {/* 진행률 */}
      <div className="setup__progress">
        <div className="setup__progress-head">
          <strong>필수 항목 진행률</strong>
          <span>
            {progress.done} / {progress.total} ({pct}%)
          </span>
        </div>
        <div className="setup__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="setup__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* 콘텐츠 요약 */}
      <div className="setup__stats">
        <div className="setup__stat">
          <span className="setup__stat-num">{stats.published}</span>
          <span className="setup__stat-label">발행된 글</span>
        </div>
        <div className="setup__stat">
          <span className="setup__stat-num">{stats.drafts}</span>
          <span className="setup__stat-label">검토 대기</span>
        </div>
        <div className="setup__stat">
          <span className="setup__stat-num">
            {Math.round(stats.totalChars / 1000)}k
          </span>
          <span className="setup__stat-label">누적 글자수</span>
        </div>
        <div className="setup__stat">
          <span className="setup__stat-num">{stats.perRun}</span>
          <span className="setup__stat-label">회당 생성량</span>
        </div>
      </div>

      <p className="setup__phase">
        현재 발행 단계: <strong>{stats.phaseLabel}</strong>
        <br />
        <small>
          발행량은 글 수에 따라 자동 조절됩니다. 바꾸려면{" "}
          <code>automation.config.ts</code> 의 <code>ramp</code> 를 수정하세요.
        </small>
      </p>

      {/* 카테고리 분포 */}
      <section className="setup__section">
        <h2>카테고리별 발행 현황</h2>
        <div className="setup__cats">
          {stats.byCategory.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="setup__cat">
              <span aria-hidden="true">{c.emoji}</span>
              <span className="setup__cat-name">{c.name}</span>
              <span className={`setup__cat-count${c.count === 0 ? " is-zero" : ""}`}>
                {c.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 체크리스트 */}
      {groups.map((group) => (
        <section key={group.title} className="setup__section">
          <h2>{group.title}</h2>
          <p className="setup__section-desc">{group.description}</p>

          <ul className="setup__list">
            {group.items.map((item) => (
              <li key={item.label} className={`setup__item is-${item.level}`}>
                <div className="setup__item-head">
                  <span className="setup__item-icon" aria-hidden="true">
                    {ICON[item.level]}
                  </span>
                  <span className="setup__item-label">{item.label}</span>
                  <span className="setup__item-detail">{item.detail}</span>
                </div>
                {item.how && <p className="setup__item-how">{item.how}</p>}
                {item.file && <code className="setup__item-file">{item.file}</code>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* API 키 안내 */}
      <section className="setup__section">
        <h2>AI 프로바이더 키</h2>
        <p className="setup__section-desc">
          키는 보안상 이 페이지에서 확인할 수 없습니다. 터미널에서 점검하세요.
        </p>
        <div className="setup__note">
          <ol>
            <li>
              <code>.env</code> 파일을 열고 <code>OPENAI_API_KEY</code> 에 키를 붙여넣습니다.
              <br />
              <small>
                키 발급: platform.openai.com/api-keys · 결제 수단이 등록되어 있어야
                API가 동작합니다 (ChatGPT Plus 구독과는 별개입니다)
              </small>
            </li>
            <li>
              <code>npm run doctor</code> 를 실행해 연결을 확인합니다.
            </li>
            <li>
              모델 ID 오류가 나면 <code>npm run doctor -- --models</code> 로 사용
              가능한 목록을 확인해 <code>.env</code> 의 <code>OPENAI_MODEL</code> 을
              맞춥니다.
            </li>
          </ol>
        </div>
      </section>

      {/* 배포 절차 */}
      <section className="setup__section">
        <h2>배포 절차 (Cloudflare Pages)</h2>
        <p className="setup__section-desc">
          순서대로 따라가면 됩니다. 로컬 커밋은 이미 되어 있습니다.
        </p>

        <ol className="deploy-steps">
          {deploySteps.map((s) => (
            <li
              key={s.no}
              className={`deploy-step${s.done === true ? " is-done" : ""}${
                s.done === false ? " is-todo" : ""
              }`}
            >
              <span className="deploy-step__no" aria-hidden="true">
                {s.done === true ? "✓" : s.no}
              </span>
              <div className="deploy-step__body">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {s.commands && (
                  <pre className="deploy-step__cmd">
                    {s.commands.join("\n")}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="setup__note">
          <strong>Cloudflare 대시보드 빌드 설정</strong>
          <table className="setup__cmds" style={{ marginTop: 10 }}>
            <tbody>
              <tr>
                <td>Framework preset</td>
                <td>
                  <code>None</code> — Next.js 프리셋을 고르면 실패합니다
                </td>
              </tr>
              <tr>
                <td>Build command</td>
                <td>
                  <code>npm run build</code>
                </td>
              </tr>
              <tr>
                <td>Build output directory</td>
                <td>
                  <code>out</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 명령어 */}
      <section className="setup__section">
        <h2>자주 쓰는 명령어</h2>
        <table className="setup__cmds">
          <tbody>
            {COMMANDS.map((c) => (
              <tr key={c.cmd}>
                <td>
                  <code>{c.cmd}</code>
                </td>
                <td>{c.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 문서 */}
      <section className="setup__section">
        <h2>문서</h2>
        <ul className="setup__docs">
          <li>
            <strong>DEPLOY.md</strong> — Cloudflare Pages 배포 단계별 가이드
          </li>
          <li>
            <strong>PLAYBOOK.md</strong> — 애드센스 승인, 포털 등록, 수익화 운영
          </li>
          <li>
            <strong>PROJECT-MAP.md</strong> — 어떤 걸 고치려면 어떤 파일을 여는지
          </li>
        </ul>
      </section>
    </div>
  );
}
