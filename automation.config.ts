/**
 * 자동 콘텐츠 파이프라인 설정.
 *
 * 전략: 초기에는 색인 볼륨을 빠르게 확보하고, 도메인이 자리 잡으면
 *       "꾸준함"으로 전환합니다. 구글은 발행 속도가 갑자기 튀는 사이트를
 *       스팸 신호로 보기 때문에, 무한정 대량 발행은 오히려 손해입니다.
 */

export interface RampPhase {
  /** 발행된 글이 이 개수 미만일 때 적용 (마지막 단계는 null = 무제한) */
  untilPosts: number | null;
  /** 1회 실행당 생성할 초안 개수 */
  perRun: number;
  /** 단계 설명 */
  label: string;
}

export const automationConfig = {
  /**
   * 발행량 램프.
   * 위에서부터 순서대로 검사해 처음 매칭되는 단계를 적용합니다.
   */
  ramp: [
    {
      untilPosts: 30,
      perRun: 10,
      label: "부트스트랩 — 애드센스 심사에 필요한 최소 볼륨 확보",
    },
    {
      untilPosts: 100,
      perRun: 6,
      label: "성장 — 카테고리별 주제 커버리지 확장",
    },
    {
      untilPosts: 300,
      perRun: 3,
      label: "안정 — 롱테일 확장",
    },
    {
      untilPosts: null,
      perRun: 2,
      label: "유지 — 꾸준한 신선도 신호",
    },
  ] as RampPhase[],

  /** 키워드 재고가 이 개수 밑으로 떨어지면 자동으로 발굴을 돌립니다 */
  keywordRefillThreshold: 30,

  /** 발굴 1회당 뽑을 키워드 개수 */
  keywordsPerDiscovery: 25,

  /**
   * 카테고리 균형.
   * true면 글 수가 가장 적은 카테고리부터 채웁니다.
   * (한 카테고리만 비대해지면 주제 집중도가 떨어져 순위에 불리)
   */
  balanceCategories: true,

  /**
   * 콘텐츠 기둥 최소 비중 (발행+초안 합 기준).
   * admin = 행정 코어 6카테고리, tips = digital+life, money = money.
   * 생활팁이 폭증해도 행정 코어가 전체의 이 비율 아래로 안 내려가게 발굴·생성을 우선한다.
   */
  pillarMinShare: {
    admin: 0.45,
    tips: 0.25,
    money: 0.1,
  },

  /** 하루 최대 생성 개수 안전장치 — 실수로 API 비용이 폭주하는 것을 막습니다 */
  hardDailyLimit: 15,
} as const;

/** 현재 발행 글 수에 맞는 램프 단계를 고릅니다 */
export function currentPhase(publishedCount: number): RampPhase {
  for (const phase of automationConfig.ramp) {
    if (phase.untilPosts === null || publishedCount < phase.untilPosts) {
      return phase;
    }
  }
  return automationConfig.ramp[automationConfig.ramp.length - 1];
}
