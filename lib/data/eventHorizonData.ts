export type InfluencerTier = "S" | "A" | "B" | "C" | "D" | "F";

export interface InfluencerAccount {
  id: string;
  tier: InfluencerTier;
  displayName: string;
  handle: string;
  affiliation: string;
  signalTypes: string;
  weight: number;
  hitRate: number;
  filterRuleSummary: string;
}

export interface EnsembleClockSpec {
  id: "seed-rsi" | "agi" | "rsi" | "asi";
  shortCode: string;
  koreanTitle: string;
  targetDateIso: string;
  fastTakeoffDateIso: string;
  shortDateLabel: string;
  definition: string;
  keyProxies: { label: string; current: string; target: string }[];
}

export interface UnsatBenchmarkItem {
  id: string;
  name: string;
  domain: string;
  scorePercent: number;
  note: string;
  thresholdPercent: number;
}

export interface FutureMilestoneItem {
  id: string;
  domain: "바이오 · 역노화" | "월드모델 · 인터페이스" | "연산 · 전력 인프라";
  title: string;
  organization: string;
  metricHighlight: string;
  verificationLabel: "교차검증 완료" | "동료평가 진행" | "초기 임상 단계";
  summary: string;
}

export interface MacroIndicatorItem {
  id: string;
  domain:
    | "설비투자 및 연산 인프라"
    | "생산성 및 자본 대체"
    | "청년 지식고용 선행 지표"
    | "총고용 및 분배 후행 지표";
  name: string;
  currentDelta: string;
  thresholdNote: string;
  stage: "조기경보 도달" | "관측 진행" | "후행 완충";
  interpretation: string;
}

export interface IncidentCaseFile {
  id: string;
  caseCode: string;
  title: string;
  originatorHandles: string[];
  openedDate: string;
  status: "pending" | "verified" | "debunked" | "quarantined";
  statusLabel: string;
  claimSummary: string;
  findingSummary: string;
  timelineLogs: { date: string; event: string }[];
}

export interface AuditChangelogItem {
  id: string;
  date: string;
  type: "signal_updates" | "methodology_updates";
  title: string;
  clockImpact: string;
  detail: string;
}

/**
 * Deterministic SSR/Client baseline timestamp: 2026-11-08T13:00:00+09:00
 * Prevents synchronous Date.now() prerender errors under Next.js 16 cacheComponents: true.
 */
export const BASELINE_ANCHOR_MS = 1794110400000;

export const ENSEMBLE_CLOCKS: EnsembleClockSpec[] = [
  {
    id: "seed-rsi",
    shortCode: "Seed RSI",
    koreanTitle: "초기 재귀개선 점화 (Seed RSI · AI R&D 루프)",
    targetDateIso: "2026-12-20T00:00:00+09:00",
    fastTakeoffDateIso: "2026-11-30T00:00:00+09:00",
    shortDateLabel: "2026.12",
    definition:
      "코딩·커널 최적화·합성데이터 생성·보상 검증 등 닫힌 디지털 연구 루프에서 AI가 차세대 모델 개선 속도를 유의미하게 가속하기 시작하는 선행 임계점",
    keyProxies: [
      { label: "프론티어 랩 학습·인프라 코드 AI 작성률", current: "78%+", target: "90%+" },
      { label: "SWE-Bench Verified (자율 소프트웨어 공학)", current: "88.2%", target: "90%+" },
      { label: "내부 AI R&D 연구 속도 승수", current: "1.5배", target: "2.0배 (점화)" },
    ],
  },
  {
    id: "agi",
    shortCode: "AGI",
    koreanTitle: "일반인공지능 (AGI)",
    targetDateIso: "2027-04-18T00:00:00+09:00",
    fastTakeoffDateIso: "2027-02-15T00:00:00+09:00",
    shortDateLabel: "2027.04",
    definition:
      "코딩에 국한되지 않고 비정형 행정·재무·과학·멀티모달 등 숙련된 인간 지식근로자의 주 40시간 범용 인지 과업을 중간 교정 없이 자율 완수하는 시점",
    keyProxies: [
      { label: "METR 50% 자율 작업 지평", current: "16.0시간", target: "40시간" },
      { label: "ARC-AGI-3 유동 추상 추론", current: "62.7%", target: "85%+" },
      { label: "장기 컴퓨터 제어 · OSWorld", current: "74.5%", target: "90%+" },
    ],
  },
  {
    id: "rsi",
    shortCode: "Full RSI",
    koreanTitle: "완전 자율 재귀개선 (Full End-to-End RSI)",
    targetDateIso: "2029-12-15T00:00:00+09:00",
    fastTakeoffDateIso: "2027-11-20T00:00:00+09:00",
    shortDateLabel: "2029.12",
    definition:
      "인간 연구자의 개입 없이 AI 에이전트 집단이 가설 수립·신규 아키텍처 발명·대규모 클러스터 본학습 및 검증 전체 주기의 과반을 단독 주도하는 시점",
    keyProxies: [
      { label: "AI 단독 주도 프론티어 아키텍처 비중", current: "14.2%", target: "50.0%+" },
      { label: "초장기 연구 자율 지평 (실패 복구 포함)", current: "16.0시간", target: "1,000시간" },
      { label: "클러스터 실험 검증 R&D 가속 배수", current: "1.5배", target: "5.0배+" },
    ],
  },
  {
    id: "asi",
    shortCode: "ASI",
    koreanTitle: "초인공지능 (ASI)",
    targetDateIso: "2031-12-31T00:00:00+09:00",
    fastTakeoffDateIso: "2029-03-15T00:00:00+09:00",
    shortDateLabel: "2031.12",
    definition:
      "기초과학·난제 수학·물리 공학 발견 전 영역에서 인류 전체의 최고 집단지성을 질적으로 초월하는 시점",
    keyProxies: [
      { label: "Humanity's Last Exam (HLE)", current: "38.9%", target: "95.0%" },
      { label: "FrontierMath 미해결 연구 수학", current: "41.7%", target: "95.0%+" },
      { label: "단일 연산 클러스터 규모", current: "1GW 캠퍼스", target: "5GW+ 자율 가동" },
    ],
  },
];

export const CORE_BENCHMARKS: UnsatBenchmarkItem[] = [
  {
    id: "arc-agi-3",
    name: "ARC-AGI-3",
    domain: "미포화 추상 유동지능",
    scorePercent: 62.7,
    note: "2026년 3월 1% 미만에서 8개월 만에 급상승",
    thresholdPercent: 85,
  },
  {
    id: "swebench-verified",
    name: "SWE-Bench Verified",
    domain: "자율 소프트웨어 공학",
    scorePercent: 88.2,
    note: "실전 저장소 이슈 해결 포화 근접",
    thresholdPercent: 92,
  },
  {
    id: "biobasics",
    name: "BioBasicsBench",
    domain: "웨트랩 생물학 프로토콜",
    scorePercent: 66.7,
    note: "실험 설계 역량 상승으로 생물안전 감사 병행",
    thresholdPercent: 85,
  },
  {
    id: "frontier-math",
    name: "FrontierMath",
    domain: "연구급 수리 추론",
    scorePercent: 41.7,
    note: "티어 4 최고난도 미해결 영역 추적 중",
    thresholdPercent: 80,
  },
  {
    id: "hle",
    name: "Humanity's Last Exam",
    domain: "전 학문 최고난도 종합",
    scorePercent: 38.9,
    note: "단순 암기 배제 학술 추론 한계 측정",
    thresholdPercent: 95,
  },
  {
    id: "arc-agi-2",
    name: "ARC-AGI-2",
    domain: "시각 규칙 추론 (기존 세대)",
    scorePercent: 95.0,
    note: "프론티어 모델군 사실상 포화 도달",
    thresholdPercent: 95,
  },
];

export const METR_TRAJECTORY_POINTS = [
  { period: "23.Q4", model: "GPT-4", minutes: 6, label: "6분" },
  { period: "24.Q4", model: "Claude 3.5", minutes: 28, label: "28분" },
  { period: "25.Q2", model: "o3 / Opus 4", minutes: 95, label: "1.6h" },
  { period: "25.Q4", model: "Opus 4.5", minutes: 240, label: "4.0h" },
  { period: "26.Q2", model: "Opus 5", minutes: 480, label: "8.0h" },
  { period: "현재", model: "Frontier SOTA", minutes: 960, label: "16.0h" },
  { period: "27.Q2*", model: "AGI 기준선", minutes: 2400, label: "40h" },
];

export const MACRO_12_INDICATORS: MacroIndicatorItem[] = [
  {
    id: "mac-1",
    domain: "설비투자 및 연산 인프라",
    name: "빅테크 합산 AI 설비투자 (Capex)",
    currentDelta: "$725B (+77% YoY)",
    thresholdNote: "조기경보 $400B 돌파 · 완전 전환 $1.2T",
    stage: "조기경보 도달",
    interpretation: "단일 산업 사상 최대 규모의 연산 인프라 선행 자본 투입 지속.",
  },
  {
    id: "mac-2",
    domain: "설비투자 및 연산 인프라",
    name: "데이터센터 가속기 분기 매출",
    currentDelta: "$68B / 분기",
    thresholdNote: "조기경보 $50B 돌파 · 완전 전환 $200B",
    stage: "조기경보 도달",
    interpretation: "실제 클러스터 증설 수요를 반영하는 하드웨어 집행 지표.",
  },
  {
    id: "mac-3",
    domain: "설비투자 및 연산 인프라",
    name: "단일 캠퍼스 실시간 IT 전력",
    currentDelta: "1.0 GW 가동",
    thresholdNote: "조기경보 0.5GW 돌파 · 완전 전환 5.0GW",
    stage: "조기경보 도달",
    interpretation: "원전 1기급 단일 학습·추론 캠퍼스 상용 가동 진입.",
  },
  {
    id: "mac-4",
    domain: "생산성 및 자본 대체",
    name: "정보·지식서비스 총요소생산성(TFP)",
    currentDelta: "+4.0% 가속",
    thresholdNote: "조기경보 +2.5% 돌파 · 완전 전환 +9.0%",
    stage: "조기경보 도달",
    interpretation: "소프트웨어 및 리서치 직군 중심의 산출량 반등 관측.",
  },
  {
    id: "mac-5",
    domain: "생산성 및 자본 대체",
    name: "자본-노동 한계 대체율 변화",
    currentDelta: "+5.5%",
    thresholdNote: "조기경보 +4.0% 돌파 · 완전 전환 +15.0%",
    stage: "조기경보 도달",
    interpretation: "신규 인력 충원 대신 에이전트 API 예산으로 대체하는 비중 확대.",
  },
  {
    id: "mac-6",
    domain: "생산성 및 자본 대체",
    name: "동일 성능 대비 추론 단가 하락률",
    currentDelta: "월 -22% ~ -25%",
    thresholdNote: "조기경보 월 -15% 돌파",
    stage: "조기경보 도달",
    interpretation: "경량·라우팅 최적화로 실전 컴퓨터 제어 비용 급감.",
  },
  {
    id: "mac-7",
    domain: "청년 지식고용 선행 지표",
    name: "대졸자당 지식 일자리 (3년 누적)",
    currentDelta: "-13.3% 감소",
    thresholdNote: "조기경보 -8.0% 돌파 · 완전 전환 -20.0%",
    stage: "조기경보 도달",
    interpretation: "일괄 해고보다 시니어 1인이 에이전트를 지휘하는 신입 채용 축소가 선행.",
  },
  {
    id: "mac-8",
    domain: "청년 지식고용 선행 지표",
    name: "대졸 청년층 실업률 격차",
    currentDelta: "+0.9pp 상승",
    thresholdNote: "조기경보 +0.7pp 돌파 · 완전 전환 +2.0pp",
    stage: "조기경보 도달",
    interpretation: "주니어 개발·번역·초벌 리서치 직무의 진입 장벽 상승.",
  },
  {
    id: "mac-9",
    domain: "청년 지식고용 선행 지표",
    name: "지식근로자 자발적 이직률",
    currentDelta: "-0.7pp 감소",
    thresholdNote: "조기경보 -0.8pp 근접",
    stage: "관측 진행",
    interpretation: "채용 시장 보수화로 현 직장 잔류 및 내부 AI 도구 결합 심화.",
  },
  {
    id: "mac-10",
    domain: "총고용 및 분배 후행 지표",
    name: "민간 전체 직무 대체 격차 (3년)",
    currentDelta: "+3.9pp",
    thresholdNote: "조기경보 +5.0pp 미달",
    stage: "관측 진행",
    interpretation: "물리·대면 서비스 직군의 완충 작용으로 전체 고용 충격은 제한적.",
  },
  {
    id: "mac-11",
    domain: "총고용 및 분배 후행 지표",
    name: "국민계정 노동소득분배율 변화",
    currentDelta: "-0.7pp",
    thresholdNote: "조기경보 -1.7pp 미달",
    stage: "후행 완충",
    interpretation: "거시 소득 분배 지표 반영까지는 수년의 통계 시차 존재.",
  },
  {
    id: "mac-12",
    domain: "총고용 및 분배 후행 지표",
    name: "실질 중위임금 및 핵심연령 고용률",
    currentDelta: "임금 +3.9% · 고용 +0.5pp",
    thresholdNote: "조기경보 임금 -1.7% 미달",
    stage: "후행 완충",
    interpretation: "전면적 의무 노동 소멸 및 UBI 정책 전환까지는 거시적 시차 잔존.",
  },
];

export const FUTURE_MILESTONES: FutureMilestoneItem[] = [
  {
    id: "bio-alphafold",
    domain: "바이오 · 역노화",
    title: "전장 유전체 조절 및 단백질 복합체 정밀 구조 예측",
    organization: "Google DeepMind · Isomorphic Labs",
    metricHighlight: "단백질-리간드 결합 예측 99.9%",
    verificationLabel: "교차검증 완료",
    summary:
      "단일 단백질 접힘을 넘어 비암호화 유전체 변이와 세포 내 다중 분자 상호작용까지 시뮬레이션 범위를 확장했습니다.",
  },
  {
    id: "bio-clinical",
    domain: "바이오 · 역노화",
    title: "AI 엔드투엔드 설계 섬유증·노화 표적 신약 후기 임상",
    organization: "Insilico Medicine 외 글로벌 임상",
    metricHighlight: "후보 발굴~임상 진입 기간 60% 단축",
    verificationLabel: "초기 임상 단계",
    summary:
      "전임상 후보 도출 속도는 입증되었으나 인체 장기 안전성 및 역노화 효능은 임상 3상 데이터 축적이 필요합니다.",
  },
  {
    id: "vr-worldmodel",
    domain: "월드모델 · 인터페이스",
    title: "실시간 4D 물리 일관성 월드 모델 vs 양방향 신경 BCI 격차",
    organization: "DeepMind Genie · Neuralink 컨소시엄",
    metricHighlight: "시각 월드모델 성숙 78% · 양방향 BCI 29%",
    verificationLabel: "동료평가 진행",
    summary:
      "실시간 가상 공간 생성은 상용화 궤도에 올랐으나, 오감 피드백을 뇌에 역전송하는 비침습 인터페이스는 초기 임상 단계입니다.",
  },
  {
    id: "hw-cluster",
    domain: "연산 · 전력 인프라",
    title: "기가와트(1GW)급 단일 AI 캠퍼스 가동 및 차세대 HBM4 메모리 전환",
    organization: "xAI · AWS/Anthropic · NVIDIA · AMD",
    metricHighlight: "단일 캠퍼스 1GW 돌파 · 추론 대역폭 4배 향상",
    verificationLabel: "교차검증 완료",
    summary:
      "프론티어 학습 및 상시 에이전트 추론 수요로 인해 전력망 확보와 고대역폭 메모리 공급이 핵심 물리 병목으로 작용하고 있습니다.",
  },
];

export const INFLUENCER_ACCOUNTS: InfluencerAccount[] = [
  // S Tier — Main Characters
  {
    id: "sama",
    tier: "S",
    displayName: "Sam Altman",
    handle: "@sama",
    affiliation: "OpenAI CEO",
    signalTypes: "GPT 로드맵, 연산·메모리(DRAM) 인프라 수급",
    weight: 1.0,
    hitRate: 84,
    filterRuleSummary: "공식 출시 및 인프라 발언만 반영, 단답형 암시 포스트 제외",
  },
  {
    id: "dario",
    tier: "S",
    displayName: "Dario Amodei",
    handle: "@DarioAmodei",
    affiliation: "Anthropic CEO",
    signalTypes: "Claude 프론티어 출시, RSP 안전 임계점 보고서",
    weight: 1.0,
    hitRate: 91,
    filterRuleSummary: "책임감 있는 스케일링(RSP) 평가 및 공식 모델 발표 즉시 반영",
  },
  {
    id: "karpathy",
    tier: "S",
    displayName: "Andrej Karpathy",
    handle: "@karpathy",
    affiliation: "AI 연구자 · 교육자",
    signalTypes: "사전학습 아키텍처, 코딩 에이전트 패러다임 분석",
    weight: 0.95,
    hitRate: 96,
    filterRuleSummary: "장문 기술 분석 및 오픈소스 연구 노트 우선 수집",
  },
  {
    id: "hassabis",
    tier: "S",
    displayName: "Demis Hassabis",
    handle: "@demishassabis",
    affiliation: "Google DeepMind 공동창업자",
    signalTypes: "과학 탐색 AI(생물학·물리·신소재), AGI 안전 기준",
    weight: 1.0,
    hitRate: 95,
    filterRuleSummary: "동료검증 과학 마일스톤 발표 시 바이오·월드모델 지표 직결",
  },

  // A Tier — Timeline Movers
  {
    id: "tokengremlin",
    tier: "A",
    displayName: "TokenGremlin",
    handle: "@TokenGremlin",
    affiliation: "코드·API 문자열 유출 분석가",
    signalTypes: "신규 엔드포인트 문자열, 추론 토큰 한도 비교",
    weight: 0.78,
    hitRate: 74,
    filterRuleSummary: "문자열 스냅샷 첨부 게시물 우대, 단순 추정성 단문 감쇠",
  },
  {
    id: "andrewcurran",
    tier: "A",
    displayName: "Andrew Curran",
    handle: "@AndrewCurran_",
    affiliation: "독립 AI 분석가",
    signalTypes: "프론티어 출시 임박 징후 및 수학·추론 동향",
    weight: 0.80,
    hitRate: 79,
    filterRuleSummary: "출시 예고 시그널 수집하되 학술 난제 주장은 동료평가 확인 전 보류",
  },
  {
    id: "chetaslua",
    tier: "A",
    displayName: "Chetaslua",
    handle: "@chetaslua",
    affiliation: "리버스 엔지니어 · AI 빌더",
    signalTypes: "공식 웹 번들 DOM 문자열 분석, 스텔스 모델 실전 대조",
    weight: 0.90,
    hitRate: 89,
    filterRuleSummary: "재현 가능한 코드·번들 증거가 첨부된 리포트만 채택",
  },
  {
    id: "kimmonismus",
    tier: "A",
    displayName: "Chubby",
    handle: "@kimmonismus",
    affiliation: "Superintelligence 뉴스레터 편집장",
    signalTypes: "글로벌 유출 제보 집약 및 프론티어 이슈 확산",
    weight: 0.72,
    hitRate: 71,
    filterRuleSummary: "1차 출처 링크가 포함된 포스트만 반영, 감탄사 위주 인용 제외",
  },
  {
    id: "dummerspast39",
    tier: "A",
    displayName: "Binkg",
    handle: "@dummerspast39",
    affiliation: "모델 루머 · 요금제 동향 추적",
    signalTypes: "미공개 체크포인트 명칭, 구독 한도 변화 포착",
    weight: 0.68,
    hitRate: 67,
    filterRuleSummary: "복수 채널 교차 확인 시에만 검증 등급 상향",
  },

  // B Tier — Knows Too Much & Empirical Probers
  {
    id: "lyraxana",
    tier: "B",
    displayName: "Lyra",
    handle: "@lyraxana",
    affiliation: "API 엔드포인트 · EAP 프로버",
    signalTypes: "스텔스 코드네임, 캐시·출력 API 단가 사전 포착",
    weight: 0.84,
    hitRate: 83,
    filterRuleSummary: "구체적 모델 식별자·단가 포함 시 채택, 이니셜 암시글은 주의 분류",
  },
  {
    id: "theo",
    tier: "B",
    displayName: "Theo (t3.gg)",
    handle: "@theo",
    affiliation: "T3 Chat · 개발 도구 빌더",
    signalTypes: "실전 코딩 에이전트 비용 효율 및 EAP 테스트 체감",
    weight: 0.82,
    hitRate: 85,
    filterRuleSummary: "실사용 토큰 효율 및 에이전트 지연시간 비교 데이터 반영",
  },
  {
    id: "luminabench",
    tier: "B",
    displayName: "LuminaBench",
    handle: "@LuminaBench",
    affiliation: "독립 멀티모달·에이전트 평가 플랫폼",
    signalTypes: "3D·코딩·추론 복합 평가 및 작업당 시간·비용 실측",
    weight: 0.95,
    hitRate: 98,
    filterRuleSummary: "정량 평가 테이블 갱신 시 프론티어 지능 섹션 자동 연동",
  },
  {
    id: "mia",
    tier: "B",
    displayName: "Mia AI Lab",
    handle: "@MiaAI_lab",
    affiliation: "로컬 추론 엔진 · 양자화 연구",
    signalTypes: "장문 컨텍스트 로컬 구동 및 양자화 의사결정 오차 실측",
    weight: 0.85,
    hitRate: 94,
    filterRuleSummary: "오픈웨이트 모델의 실측 처리량 및 오차율 검증 소스로 활용",
  },

  // C Tier — Practitioners & Lab Insiders
  {
    id: "gdb",
    tier: "C",
    displayName: "Greg Brockman",
    handle: "@gdb",
    affiliation: "OpenAI 공동창업자",
    signalTypes: "인프라 스케일링 및 에이전트 데모 공유",
    weight: 0.85,
    hitRate: 88,
    filterRuleSummary: "공식 제품 시연 및 클러스터 증설 관련 발표 반영",
  },
  {
    id: "logank",
    tier: "C",
    displayName: "Logan Kilpatrick",
    handle: "@OfficialLoganK",
    affiliation: "Google AI Studio · Gemini API",
    signalTypes: "API 배포 공지 및 출시 전 예고",
    weight: 0.55,
    hitRate: 61,
    filterRuleSummary: "문서 링크나 모델 식별자가 없는 단순 분위기 암시글은 과장 주의로 분리",
  },
  {
    id: "awnihannun",
    tier: "C",
    displayName: "Awni Hannun",
    handle: "@awnihannun",
    affiliation: "Apple ML Research (MLX)",
    signalTypes: "온디바이스 애플 실리콘 로컬 LLM 추론 최적화",
    weight: 0.90,
    hitRate: 95,
    filterRuleSummary: "온디바이스 메모리 대역폭 및 경량 모델 벤치마크 즉시 반영",
  },
  {
    id: "iscienceluvr",
    tier: "C",
    displayName: "iScienceLuvr",
    handle: "@iscienceluvr",
    affiliation: "arXiv 논문 핵심 도표 큐레이터",
    signalTypes: "프론티어 학습 기법 및 RL 논문 핵심 요약",
    weight: 0.88,
    hitRate: 94,
    filterRuleSummary: "원문 arXiv 식별자가 포함된 학술 스레드 우선 반영",
  },
  {
    id: "aidanmclau",
    tier: "C",
    displayName: "Aidan McLaughlin",
    handle: "@aidan_mclau",
    affiliation: "OpenAI 연구자 (구 Topo)",
    signalTypes: "추론 모델 일반화 한계 및 평가 방법론 비평",
    weight: 0.82,
    hitRate: 86,
    filterRuleSummary: "벤치마크 과적합 지적 및 추론 품질 분석 반영",
  },
  {
    id: "op7418",
    tier: "C",
    displayName: "귀장 (Guizang)",
    handle: "@op7418",
    affiliation: "아시아 오픈모델 · 멀티모달 빌더",
    signalTypes: "Qwen, DeepSeek, Kimi 등 중국권 프론티어 모델 실전 검증",
    weight: 0.80,
    hitRate: 84,
    filterRuleSummary: "오픈웨이트 신규 릴리스 및 실전 테스트 비교 수집",
  },

  // D & F Tier — High-Noise / Viral Aggregators (plus LisanBench statistical exception)
  {
    id: "jimmyapples",
    tier: "D",
    displayName: "Jimmy Apples",
    handle: "@JimmyApples",
    affiliation: "초기 루머 계정",
    signalTypes: "모호한 일정 암시 및 출시설",
    weight: 0.35,
    hitRate: 52,
    filterRuleSummary: "구체적 기술 지표 부재 시 과장 주의 필터 대상",
  },
  {
    id: "bindureddy",
    tier: "D",
    displayName: "Bindu Reddy",
    handle: "@bindureddy",
    affiliation: "Abacus AI CEO",
    signalTypes: "업계 논평 및 오픈소스 전망",
    weight: 0.40,
    hitRate: 58,
    filterRuleSummary: "자사 홍보 및 단정적 예측 문구는 기본 필터에서 감쇠",
  },
  {
    id: "rohanpaul",
    tier: "D",
    displayName: "Rohan Paul",
    handle: "@rohanpaul_ai",
    affiliation: "일일 AI 뉴스 요약",
    signalTypes: "다량 논문·뉴스 재가공 스레드",
    weight: 0.35,
    hitRate: 60,
    filterRuleSummary: "선정적 수식어 포함 시 과장 주의로 자동 분류",
  },
  {
    id: "scaling01",
    tier: "F",
    displayName: "LisanBench (@scaling01)",
    handle: "@scaling01",
    affiliation: "ML 연구자 · LisanBench 운영",
    signalTypes: "장기 계획 지구력 측정 및 과장된 벤치마크 통계 반박",
    weight: 0.90,
    hitRate: 93,
    filterRuleSummary: "커뮤니티 밈 등급과 무관하게 시스템 내부 1급 통계 검증원으로 우대",
  },
  {
    id: "rowancheung",
    tier: "F",
    displayName: "Rowan Cheung",
    handle: "@rowancheung",
    affiliation: "AI 뉴스레터 큐레이터",
    signalTypes: "대중용 2차 바이럴 요약 스레드",
    weight: 0.10,
    hitRate: 50,
    filterRuleSummary: "1차 원출처와 중복되므로 과장 주의 제외 시 숨김 처리",
  },
];

export const AUDIT_CHANGELOG: AuditChangelogItem[] = [
  {
    id: "chg-live-pipeline",
    date: "상시 자동화",
    type: "methodology_updates",
    title: "실시간 공공 연구·모델 API 및 온디바이스 LLM 자동 요약 파이프라인 가동",
    clockImpact: "수동 코드 배포 없이 최신 논문·출시 모델 자동 반영",
    detail:
      "OpenAI, Google DeepMind, arXiv, Hugging Face Daily Papers, Hacker News 및 OpenRouter 실시간 모델 레지스트리를 주기적으로 수집하고 온디바이스 AI 또는 서버 요약기로 한국어 브리프를 자동 생성합니다.",
  },
  {
    id: "chg-meth-omni",
    date: "2026-11-01",
    type: "methodology_updates",
    title: "AA-Omniscience v1.1 미포화 문항 재보정 및 파라미터 수 지표 폐기",
    clockImpact: "시계 변동 없음 (평가 기준선 보정)",
    detail:
      "단순 파라미터 규모는 희소 MoE 및 추론 시간 스케일링 확산으로 대표성을 상실하여 폐기하고, METR 자율 과업 지속시간(45% 가중치) 중심으로 일원화했습니다.",
  },
  {
    id: "chg-sig-arc3",
    date: "2026-10-24",
    type: "signal_updates",
    title: "ARC-AGI-3 62.7% 도달 및 METR 자율 작업 지평 16시간 진입 반영",
    clockImpact: "AGI 중위 예측 시점 단축 반영",
    detail:
      "표준 평가 하네스 기준 미포화 추상 추론 지수와 장기 소프트웨어 과업 완수 시간이 동반 상승하여 앙상블 추세선을 갱신했습니다.",
  },
];

export const INCIDENT_CASE_FILES: IncidentCaseFile[] = [
  {
    id: "inc-2026-0108",
    caseCode: "INC-2026-0108",
    title: "밀레니엄 수학 난제(나비에-스토크스) 비공개 동료평가 루머 검증",
    originatorHandles: ["@AndrewCurran_"],
    openedDate: "2026-09-04",
    status: "pending",
    statusLabel: "동료평가 확인 대기",
    claimSummary:
      "차세대 추론 모델이 나비에-스토크스 방정식 관련 증명을 도출해 외부 수학자 검토를 거치고 있다는 주장.",
    findingSummary:
      "공식 프리프린트나 학술지 등재 전까지 시계 가중치 반영을 보류하고 미검증 주장으로 분류합니다.",
    timelineLogs: [
      { date: "2026-09-04", event: "소셜 채널 내 최초 예측 제기" },
      { date: "2026-10-12", event: "공개 수식 및 프리프린트 부재 확인 — 보류 상태 유지" },
    ],
  },
  {
    id: "inc-2026-0092",
    caseCode: "INC-2026-0092",
    title: "대문자 'R·S·I' 두문자 암시 트윗 과대해석 사례",
    originatorHandles: ["@lyraxana"],
    openedDate: "2026-09-11",
    status: "debunked",
    statusLabel: "과장 해프닝 종결",
    claimSummary:
      "단문 축하 인사에 포함된 대문자 RSI 배열로 인해 전면적 재귀적 자기개선 달성 루머가 확산된 사례.",
    findingSummary:
      "제한된 강화학습 도메인의 기술 보고서를 지칭한 표현이었으며 전면적 자기개선 루프 완성과는 무관함이 확인되었습니다.",
    timelineLogs: [
      { date: "2026-09-11", event: "모호한 두문자 암시 게시물 확산" },
      { date: "2026-09-15", event: "개별 논문 맥락 확인 후 과장 주의 사례로 종결" },
    ],
  },
  {
    id: "inc-2026-0104",
    caseCode: "INC-2026-0104",
    title: "프론트엔드 번들 내 차세대 모델 식별자 사전 노출 검증",
    originatorHandles: ["@chetaslua", "@lyraxana"],
    openedDate: "2026-11-02",
    status: "verified",
    statusLabel: "기술 증거 재현됨",
    claimSummary:
      "공식 웹 정적 번들 내 미공개 모델 라벨 및 평가 엔드포인트 라우팅 문자열 포착 보고.",
    findingSummary:
      "복수의 독립 개발자 스냅샷에서 동일 문자열이 재현되어 실제 출시 전 안전 감사 체크포인트로 확인되었습니다.",
    timelineLogs: [
      { date: "2026-11-02", event: "평가 API 라우팅 문자열 최초 보고" },
      { date: "2026-11-05", event: "정적 번들 DOM 스냅샷 교차 재현 완료" },
    ],
  },
  {
    id: "inc-2026-0019",
    caseCode: "INC-2026-0019",
    title: "미검증 상온 초전도체 및 테마주 연계 주장 자동 격리",
    originatorHandles: ["익명 바이럴"],
    openedDate: "2026-08-19",
    status: "quarantined",
    statusLabel: "교차재현 전 영구 격리",
    claimSummary:
      "독립 연구기관의 재현 데이터 없이 신소재 합성 주장과 특정 종목 티커를 결부한 게시물.",
    findingSummary:
      "관측소 원칙에 따라 복수 학술기관의 독립 재현이 입증되기 전까지 메인 지표 반영을 영구 차단합니다.",
    timelineLogs: [
      { date: "2026-08-19", event: "키워드 가드레일에 의해 메인 스트림 노출 자동 차단" },
    ],
  },
];
