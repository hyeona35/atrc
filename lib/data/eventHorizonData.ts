export type InfluencerTier = "S" | "A" | "B" | "C" | "D";

export interface InfluencerTierMeta {
  tier: InfluencerTier;
  title: string;
  subtitle: string;
  weightRange: string;
  evaluationCriteria: string;
}

export interface InfluencerAccount {
  id: string;
  tier: InfluencerTier;
  displayName: string;
  handle: string;
  affiliation: string;
  signalTypes: string;
  evidenceBasis: string;
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
    name: "FrontierMath v2",
    domain: "연구급 수리 추론 (338문항 · Open Problems)",
    scorePercent: 41.7,
    note: "v2 오류 정정 반영 · 티어 4 및 Lean 형식증명 영역 추적 중",
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

export const TIER_METHODOLOGY: InfluencerTierMeta[] = [
  {
    tier: "S",
    title: "S등급 · 1차 랩 수장 & 과학 리더",
    subtitle: "모델 로드맵·안전 임계점·거시 컴퓨트 전략 직접 결정권자",
    weightRange: "0.95 – 1.00",
    evaluationCriteria:
      "공식 모델 출시, 책임감 있는 스케일링(RSP) 평가, 대규모 클러스터 증설 등 시장·연구 기준선을 직접 움직이는 1차 원천 발신원만 포함합니다.",
  },
  {
    tier: "A",
    title: "A등급 · 프론티어 리서처 & 아키텍트",
    subtitle: "추론 스케일링·해석가능성·멀티모달 핵심 설계 주역",
    weightRange: "0.88 – 0.94",
    evaluationCriteria:
      "Test-Time Compute, RL 검증, 기계적 해석가능성, 본학습 파이프라인을 직접 구축하는 1선 연구자들의 기술 포스트를 추적합니다.",
  },
  {
    tier: "B",
    title: "B등급 · 독립 벤치마크 & 연산 검증 기관",
    subtitle: "재현 가능한 정량 평가·반도체 공급망·추론 단가 계측",
    weightRange: "0.90 – 0.96",
    evaluationCriteria:
      "자율 작업 지평(METR), 역량 지수(Epoch ECI), 유동 추론(ARC), 단가·속도(Artificial Analysis), 블라인드 Elo(LMArena), 반도체 CAPEX(SemiAnalysis) 등 검증 가능한 수치 중심 기관입니다.",
  },
  {
    tier: "C",
    title: "C등급 · 오픈웨이트 & AI 시스템 빌더",
    subtitle: "GPU 커널·온디바이스 추론·사후학습·실전 도구 검증",
    weightRange: "0.84 – 0.88",
    evaluationCriteria:
      "FlashAttention, MLX 온디바이스, Qwen 오픈웨이트 등 실제 코드·가중치·추론 처리량을 공개하며 실용 임계점을 확인하는 엔지니어 그룹입니다.",
  },
  {
    tier: "D",
    title: "D등급 · 비판적 반론 · 정책 · 논문 큐레이션",
    subtitle: "LLM 구조 한계 반증 · 컴퓨트 거버넌스 · 일일 arXiv 속보",
    weightRange: "0.48 – 0.80",
    evaluationCriteria:
      "과도한 낙관론을 견제하는 학술 반론, 정책·노동 현장 실증 분석 및 일일 논문 큐레이션을 제공하며, 단정적 주장보다 1차 논문·데이터 교차 대조를 적용합니다.",
  },
];

export const INFLUENCER_ACCOUNTS: InfluencerAccount[] = [
  // S Tier — Primary Lab Leaders & Chief Scientists
  {
    id: "dario",
    tier: "S",
    displayName: "Dario Amodei",
    handle: "@DarioAmodei",
    affiliation: "Anthropic CEO",
    signalTypes: "Claude 프론티어 출시, RSP 안전 임계점 및 AI R&D 가속 평가",
    evidenceBasis: "공식 안전 프레임워크(RSP) 및 프론티어 모델 기술 보고서 1차 책임자",
    weight: 1.0,
    hitRate: 92,
    filterRuleSummary: "책임감 있는 스케일링(RSP) 평가 및 공식 모델 발표 즉시 반영",
  },
  {
    id: "hassabis",
    tier: "S",
    displayName: "Demis Hassabis",
    handle: "@demishassabis",
    affiliation: "Google DeepMind 공동창업자",
    signalTypes: "과학 탐색 AI(생물학·물리·신소재), Gemini 연구 및 AGI 안전",
    evidenceBasis: "AlphaFold 노벨화학상 성과 및 DeepMind 장기 과학 연구 마일스톤 발신",
    weight: 1.0,
    hitRate: 95,
    filterRuleSummary: "동료검증 과학 마일스톤 발표 시 바이오·월드모델 지표 직결",
  },
  {
    id: "karpathy",
    tier: "S",
    displayName: "Andrej Karpathy",
    handle: "@karpathy",
    affiliation: "AI 연구자 · 전 OpenAI/Tesla AI 총괄",
    signalTypes: "사전학습 아키텍처, 코딩 에이전트 패러다임 및 오픈 교육 노트",
    evidenceBasis: "프로모션 없는 장문 기술 분석과 높은 커뮤니티 검증 신뢰도",
    weight: 0.98,
    hitRate: 96,
    filterRuleSummary: "장문 아키텍처·에이전트 실전 분석 및 교육 프로젝트 우선 수집",
  },
  {
    id: "sama",
    tier: "S",
    displayName: "Sam Altman",
    handle: "@sama",
    affiliation: "OpenAI CEO",
    signalTypes: "GPT·o-시리즈 로드맵, 기가와트 데이터센터 및 메모리(DRAM) 수급 전략",
    evidenceBasis: "프론티어 학습 클러스터 투자 및 OpenAI 제품 로드맵 최종 의사결정권자",
    weight: 0.95,
    hitRate: 83,
    filterRuleSummary: "공식 출시·인프라 투자 발언만 반영하고 단문 티저 게시물 감쇠",
  },
  {
    id: "jeffdean",
    tier: "S",
    displayName: "Jeff Dean",
    handle: "@JeffDean",
    affiliation: "Google Chief Scientist",
    signalTypes: "초대형 TPU 분산 학습 시스템, Gemini 아키텍처 및 희소 스케일링",
    evidenceBasis: "Google AI 인프라 및 차세대 컴퓨팅 시스템 원천 설계 총괄",
    weight: 0.98,
    hitRate: 94,
    filterRuleSummary: "학술·시스템 아키텍처 논문 및 Gemini 기술 발표 우선 채택",
  },
  {
    id: "ilyasut",
    tier: "S",
    displayName: "Ilya Sutskever",
    handle: "@ilyasut",
    affiliation: "Safe Superintelligence (SSI) 공동창업자",
    signalTypes: "사전학습 이후 패러다임 전환, 초지능 정렬 및 탐색 기반 추론",
    evidenceBasis: "현대 딥러닝 스케일링 패러다임의 핵심 설계자 · 극저빈도 고신호 발언",
    weight: 0.98,
    hitRate: 95,
    filterRuleSummary: "극도로 희소한 발언 빈도 특성상 게시물 발생 시 전건 정밀 분석",
  },

  // A Tier — Frontier Researchers & Systems Architects
  {
    id: "noambrown",
    tier: "A",
    displayName: "Noam Brown",
    handle: "@polynoamial",
    affiliation: "OpenAI 연구 과학자",
    signalTypes: "추론 시간 스케일링(Test-Time Compute), 탐색(Search) 기반 추론 패러다임",
    evidenceBasis: "o1/o3 계열 추론 패러다임 전환 및 다중 에이전트 전략 핵심 연구자",
    weight: 0.92,
    hitRate: 91,
    filterRuleSummary: "추론 연산 법칙 및 새로운 탐색 알고리즘 발표 우선 반영",
  },
  {
    id: "jasonwei",
    tier: "A",
    displayName: "Jason Wei",
    handle: "@_jasonwei",
    affiliation: "프론티어 추론 리서처",
    signalTypes: "Chain-of-Thought 창발 특성, 강화학습 기반 검증자(RLVR) 스케일링",
    evidenceBasis: "CoT 및 스케일링 법칙 핵심 공저자 · 검증 가능한 추론 도메인 연구",
    weight: 0.90,
    hitRate: 90,
    filterRuleSummary: "추론 사슬 및 자기검증 루프 관련 실증 스레드 우선 채택",
  },
  {
    id: "chrisolah",
    tier: "A",
    displayName: "Chris Olah",
    handle: "@ch402",
    affiliation: "Anthropic 공동창업자 · 해석가능성",
    signalTypes: "기계적 해석가능성(Mechanistic Interpretability), 특징 회로 및 정렬 안전",
    evidenceBasis: "모델 내부 표현 해부 및 기만적 정렬 감시 분야의 1차 권위자",
    weight: 0.94,
    hitRate: 94,
    filterRuleSummary: "해석가능성 논문 및 안전 감사 방법론 갱신 시 정렬 적자 지표 연동",
  },
  {
    id: "oriolvinyals",
    tier: "A",
    displayName: "Oriol Vinyals",
    handle: "@OriolVinyalsML",
    affiliation: "Google DeepMind 리서치 VP",
    signalTypes: "Gemini 네이티브 멀티모달 본학습 및 에이전트 도구 사용 역량",
    evidenceBasis: "Gemini 시리즈 공동 기술 총괄 · 멀티모달·장문 컨텍스트 연구 주도",
    weight: 0.90,
    hitRate: 90,
    filterRuleSummary: "Gemini 기술 보고서 및 아키텍처 개선 해설 스레드 우선 반영",
  },
  {
    id: "markchen",
    tier: "A",
    displayName: "Mark Chen",
    handle: "@markchen90",
    affiliation: "OpenAI 최고연구책임자 (CRO)",
    signalTypes: "멀티모달·추론 모델 릴리스 파이프라인 및 안전 평가 결과",
    evidenceBasis: "OpenAI 프론티어 모델 연구·검증 총괄로서 기술적 세부 수치를 직접 설명",
    weight: 0.88,
    hitRate: 88,
    filterRuleSummary: "출시 모델의 기술 보고서 수치 및 연구 방법론 해설 반영",
  },
  {
    id: "miramurati",
    tier: "A",
    displayName: "Mira Murati",
    handle: "@miramurati",
    affiliation: "Thinking Machines Lab 창립자 · 전 OpenAI CTO",
    signalTypes: "차세대 맞춤형 프론티어 연구, 멀티모달 인터페이스 및 오픈 사이언스",
    evidenceBasis: "다수 핵심 연구자를 결집한 신규 프론티어 연구 조직 대표",
    weight: 0.88,
    hitRate: 86,
    filterRuleSummary: "연구 블로그 발표 및 모델·인프라 공개 성과 중심으로 선별 수집",
  },

  // B Tier — Independent Benchmarks, Quantitative & Compute Intelligence
  {
    id: "metr",
    tier: "B",
    displayName: "METR",
    handle: "@METR_Evals",
    affiliation: "비영리 AI 자율성·위험 평가 기관",
    signalTypes: "50% 자율 과업 시간 지평(Task Horizon), 프론티어 랩 AI R&D 가속 감사",
    evidenceBasis: "가장 엄격한 오픈 하네스 기반 장기 자율성·사이버·R&D 감사 수행 기관",
    weight: 0.96,
    hitRate: 97,
    filterRuleSummary: "자율 작업 지평 보고서 갱신 시 히어로 시계·METR 곡선 직결 반영",
  },
  {
    id: "epochai",
    tier: "B",
    displayName: "Epoch AI",
    handle: "@EpochAIResearch",
    affiliation: "비영리 AI 추세 · 데이터 연구소",
    signalTypes: "Epoch 역량 지수(ECI), FrontierMath v2, 학습 연산량(FLOPs)·전력 추세",
    evidenceBasis: "감사 가능한 공개 데이터셋과 수학·연산 스케일링 통계 표준 제공",
    weight: 0.96,
    hitRate: 96,
    filterRuleSummary: "ECI 지수·연산량 데이터베이스·FrontierMath 수치 발표 전건 반영",
  },
  {
    id: "arcprize",
    tier: "B",
    displayName: "ARC Prize",
    handle: "@arcprize",
    affiliation: "ARC Prize 재단",
    signalTypes: "ARC-AGI 미포화 유동 추상 추론 검증, 비용 대비 효율(Cost-per-task) 측정",
    evidenceBasis: "오픈 소스 하네스와 사전 오염 없는 비공개 평가 세트로 진정한 추론 검증",
    weight: 0.95,
    hitRate: 96,
    filterRuleSummary: "검증 완료된 ARC-AGI-3 점수 및 효율 프론티어 갱신만 채택",
  },
  {
    id: "semianalysis",
    tier: "B",
    displayName: "SemiAnalysis",
    handle: "@SemiAnalysis_",
    affiliation: "반도체 · AI 인프라 리서치 (Dylan Patel)",
    signalTypes: "HBM4·CoWoS 공급망, 기가와트 클러스터 토폴로지, 빅테크 AI CAPEX",
    evidenceBasis: "물리적 칩·네트워킹·전력 병목을 공급망 1차 데이터로 계측",
    weight: 0.92,
    hitRate: 91,
    filterRuleSummary: "인프라·칩·전력 병목 분석 채택 (투자·주가 전망성 논평은 제외)",
  },
  {
    id: "artificialanalysis",
    tier: "B",
    displayName: "Artificial Analysis",
    handle: "@ArtificialAnlys",
    affiliation: "독립 LLM 성능 · 속도 · 단가 벤치마크",
    signalTypes: "Intelligence Index, 출력 속도(tokens/s), 첫 토큰 지연(TTFT) 및 $/1M",
    evidenceBasis: "동일 API 조건에서 전 세계 주요 모델을 자동화 계측하는 정량 플랫폼",
    weight: 0.94,
    hitRate: 95,
    filterRuleSummary: "신규 모델 독립 계측 결과 공개 시 프론티어 지능 섹션 대조 활용",
  },
  {
    id: "lmarena",
    tier: "B",
    displayName: "LMArena (LMSYS)",
    handle: "@lmsysorg",
    affiliation: "블라인드 인간 선호도 평가 플랫폼",
    signalTypes: "텍스트·코딩·비전 블라인드 Elo 레이팅 및 스텔스 모델 아레나 테스트 포착",
    evidenceBasis: "통제된 이중맹검 대결 데이터 기반으로 마케팅 편향을 배제한 순위 산출",
    weight: 0.90,
    hitRate: 92,
    filterRuleSummary: "블라인드 Elo 신뢰구간이 수렴한 공식 리더보드 변동만 반영",
  },

  // C Tier — Open-Weight Leads, Kernels & Systems Builders
  {
    id: "tridao",
    tier: "C",
    displayName: "Tri Dao",
    handle: "@tri_dao",
    affiliation: "Together AI Chief Scientist · 프린스턴 교수",
    signalTypes: "FlashAttention GPU 커널, Mamba 상태공간 아키텍처 및 추론 효율화",
    evidenceBasis: "트랜스포머 메모리 병목을 돌파한 표준 오픈소스 커널의 원저자",
    weight: 0.88,
    hitRate: 93,
    filterRuleSummary: "신규 커널·어텐션 최적화 논문 및 오픈소스 릴리스 즉시 반영",
  },
  {
    id: "awnihannun",
    tier: "C",
    displayName: "Awni Hannun",
    handle: "@awnihannun",
    affiliation: "Apple ML Research (MLX)",
    signalTypes: "애플 실리콘 통합 메모리 온디바이스 LLM 추론 및 양자화 처리량",
    evidenceBasis: "로컬 온디바이스 AI 실용화의 핵심 프레임워크(MLX) 아키텍트",
    weight: 0.86,
    hitRate: 93,
    filterRuleSummary: "로컬 모델 대역폭 효율 및 엣지 추론 마일스톤 위주로 반영",
  },
  {
    id: "junyanglin",
    tier: "C",
    displayName: "Junyang Lin (Binyuan)",
    handle: "@JustinLin610",
    affiliation: "Qwen 기술 총괄 (Alibaba)",
    signalTypes: "Qwen 오픈웨이트 추론·코딩·멀티모달 가중치 및 기술 리포트",
    evidenceBasis: "오픈웨이트 프론티어 경쟁력을 견인하는 Qwen 시리즈 1차 발신원",
    weight: 0.86,
    hitRate: 89,
    filterRuleSummary: "가중치 공개 및 재현 가능한 벤치마크 링크 포함 시 즉시 채택",
  },
  {
    id: "nathanlambert",
    tier: "C",
    displayName: "Nathan Lambert",
    handle: "@natolambert",
    affiliation: "Allen Institute for AI (Ai2) · Interconnects",
    signalTypes: "RLHF·RLVR 사후학습 레시피, 오픈 트레이닝 데이터 및 연구 랩 기술 분석",
    evidenceBasis: "사후학습 실무와 오픈모델 생태계를 정교하게 해부하는 1선 연구자",
    weight: 0.85,
    hitRate: 89,
    filterRuleSummary: "기술적 사후학습 분석 및 오픈 데이터 공개 중심 수집",
  },
  {
    id: "simonwillison",
    tier: "C",
    displayName: "Simon Willison",
    handle: "@simonw",
    affiliation: "Datasette 창시자 · AI 도구 보안 연구",
    signalTypes: "신규 프론티어 모델 실전 코딩 검증, 프롬프트 인젝션 및 에이전트 보안",
    evidenceBasis: "출시 직후 실제 코드·API·도구로 직접 검증해 과장을 가려내는 실증 기록가",
    weight: 0.86,
    hitRate: 91,
    filterRuleSummary: "재현 가능한 프롬프트·도구 테스트 및 보안 취약점 노트 반영",
  },
  {
    id: "sholtodouglas",
    tier: "C",
    displayName: "Sholto Douglas",
    handle: "@_sholtodouglas",
    affiliation: "Anthropic 리서치 엔지니어",
    signalTypes: "초장문 컨텍스트, 강화학습(RL) 인프라 확장 및 분산 컴퓨트 병목",
    evidenceBasis: "실제 프론티어 학습 클러스터에서의 RL·컨텍스트 스케일링 제약 설명",
    weight: 0.85,
    hitRate: 90,
    filterRuleSummary: "인프라 스케일링 원리 및 모델 역량 한계에 관한 기술 분석 채택",
  },

  // D Tier — Critical Counterweights, Policy & Real-Time Curation
  {
    id: "jackclark",
    tier: "D",
    displayName: "Jack Clark",
    handle: "@jackclarkSF",
    affiliation: "Anthropic 공동창업자 · Import AI",
    signalTypes: "글로벌 AI 컴퓨트 거버넌스, 수출 통제 정책 및 주간 주요 논문 큐레이션",
    evidenceBasis: "산업계 정책·안보 맥락과 기초 연구 동향을 균형 있게 조망하는 주간 분석",
    weight: 0.80,
    hitRate: 87,
    filterRuleSummary: "정책 임계점 및 연구 동향 종합 분석 참고용으로 반영",
  },
  {
    id: "fchollet",
    tier: "D",
    displayName: "François Chollet",
    handle: "@fchollet",
    affiliation: "Ndea 공동창립자 · ARC 창시자",
    signalTypes: "단순 암기 vs 유동 지능 비평, 프로그램 합성 및 뉴로심볼릭 아키텍처",
    evidenceBasis: "스케일링 만능론의 한계를 지적하고 비포화 평가 기준을 정립한 반증 축",
    weight: 0.80,
    hitRate: 86,
    filterRuleSummary: "일반화 한계 지적 및 대안 아키텍처 실증 근거 확보 시 반영",
  },
  {
    id: "ylecun",
    tier: "D",
    displayName: "Yann LeCun",
    handle: "@ylecun",
    affiliation: "Meta Chief AI Scientist · 튜링상 수상자",
    signalTypes: "자기회귀 LLM의 구조적 한계 비평, 물리 월드 모델(V-JEPA) 패러다임",
    evidenceBasis: "지배적 LLM 패러다임에 대한 대표적인 학술 반론 및 월드모델 대안 축",
    weight: 0.65,
    hitRate: 70,
    filterRuleSummary: "월드모델(JEPA) 연구 성과 우선 반영, 단문 논쟁적 예측은 분리",
  },
  {
    id: "ethanmollick",
    tier: "D",
    displayName: "Ethan Mollick",
    handle: "@emollick",
    affiliation: "펜실베이니아대 와튼스쿨 교수",
    signalTypes: "지식노동·기업 조직 내 생성형 AI 실증 도입 및 업무 생산성 변화",
    evidenceBasis: "기술 역량과 실제 현장 생산성 전환 사이의 거시 시차를 실증 추적",
    weight: 0.72,
    hitRate: 82,
    filterRuleSummary: "대조군 실험 기반의 조직·노동 생산성 연구 위주로 반영",
  },
  {
    id: "akhaliq",
    tier: "D",
    displayName: "AK",
    handle: "@_akhaliq",
    affiliation: "Hugging Face 논문 큐레이터",
    signalTypes: "일일 arXiv 신규 AI 프리프린트 실시간 아카이빙 속보",
    evidenceBasis: "논문 탐색 속도 최상위권 — 단 요약 재게시 특성상 원문 대조 필수",
    weight: 0.65,
    hitRate: 84,
    filterRuleSummary: "원문 arXiv 식별자·초록 검증 후 실증 논문만 시그널에 반영",
  },
  {
    id: "garymarcus",
    tier: "D",
    displayName: "Gary Marcus",
    handle: "@GaryMarcus",
    affiliation: "NYU 명예교수 · 인지과학자",
    signalTypes: "프론티어 모델 환각·논리 결함 반증 및 과대선전(Hype) 거짓양성 감시",
    evidenceBasis: "낙관적 벤치마크 해석의 빈틈을 검증하는 체계적 회의론(Red-Team) 레퍼런스",
    weight: 0.48,
    hitRate: 64,
    filterRuleSummary: "구체적 반례·실패 케이스 제시 시 활용하며 반복 논평은 자동 감쇠",
  },
];

export const AUDIT_CHANGELOG: AuditChangelogItem[] = [
  {
    id: "chg-live-pipeline",
    date: "상시 자동화",
    type: "methodology_updates",
    title: "무인증 공식 연구·평가 RSS/API 및 Polymarket 합의 확률 상시 연동",
    clockImpact: "수동 배포 없이 최신 모델·평가·예측시장 자동 반영",
    detail:
      "OpenAI, Anthropic, Google DeepMind, Mistral AI, METR, Hugging Face Papers, arXiv, GitHub OSS, OpenRouter 및 Polymarket 공공 데이터를 실시간 수집해 한국어 요약으로 정규화합니다.",
  },
  {
    id: "chg-tier-research",
    date: "2026-11-13",
    type: "methodology_updates",
    title: "X 발신원 티어리스트 직접 검증 전면 개편 (S~D 5계층 30인/기관)",
    clockImpact: "미확인 익명 루머 배제 · 정량 평가기관(B등급) 가중치 0.90~0.96 격상",
    detail:
      "커뮤니티 기반 밈 등급을 폐기하고 1차 랩 수장(S), 프론티어 리서처(A), 독립 벤치마크·인프라 기관(B), 시스템·오픈웨이트 빌더(C), 비판·정책·큐레이션(D) 체계로 재편했습니다.",
  },
  {
    id: "chg-meth-omni",
    date: "2026-11-01",
    type: "methodology_updates",
    title: "FrontierMath v2 오류 정정 및 METR 자율 과업 지평 중심 보정",
    clockImpact: "시계 변동 없음 (평가 기준선 정밀화)",
    detail:
      "단순 파라미터 수 지표를 폐기하고 FrontierMath v2 정정 데이터셋(338문항)과 METR 50% 자율 과업 지속시간(16.0h) 중심으로 앙상블 추세선을 보정했습니다.",
  },
  {
    id: "chg-sig-arc3",
    date: "2026-10-24",
    type: "signal_updates",
    title: "ARC-AGI-3 62.7% 도달 및 METR R&D 가속 감사 반영",
    clockImpact: "Seed RSI · AGI 중위 도달 추세선 보정",
    detail:
      "미포화 추상 유동 추론 점수와 장기 소프트웨어·연구 과업 완수 시간이 동반 상승하여 앙상블 추세선을 갱신했습니다.",
  },
];

export const INCIDENT_CASE_FILES: IncidentCaseFile[] = [
  {
    id: "inc-2026-0112",
    caseCode: "INC-2026-0112",
    title: "Epoch AI FrontierMath 초기 문항 오류 정정 (FrontierMath v2 개편)",
    originatorHandles: ["@EpochAIResearch"],
    openedDate: "2026-10-02",
    status: "verified",
    statusLabel: "기준선 공식 정정됨",
    claimSummary:
      "초기 FrontierMath 문항 중 일부 정답 검증 스크립트 및 모호한 명제 결함이 발견되어 대규모 감사가 진행됨.",
    findingSummary:
      "338문항 규모로 정밀 재검증한 FrontierMath v2와 미해결 Open Problems·Erdős 형식증명 트랙으로 기준선을 교체했습니다.",
    timelineLogs: [
      { date: "2026-10-02", event: "외부 수학자 검토를 통한 초기 문항 오류 리포트 접수" },
      { date: "2026-10-28", event: "FrontierMath v2 338문항 정정판 및 티어 1~4 기준선 반영 완료" },
    ],
  },
  {
    id: "inc-2026-0109",
    caseCode: "INC-2026-0109",
    title: "METR — Anthropic 내부 AI R&D 가속도 독립 감사 보고",
    originatorHandles: ["@METR_Evals", "@AnthropicAI"],
    openedDate: "2026-11-05",
    status: "verified",
    statusLabel: "실측 감사 데이터 반영",
    claimSummary:
      "내부 연구 인력의 코딩·디버깅·실험 루프에서 프론티어 모델이 연구 산출 속도를 2배 이상 가속하는지 여부 평가.",
    findingSummary:
      "단위 엔지니어링 생산성 향상은 실측 확인되었으나, 전면적 폐쇄 루프(Full RSI) 전 단계인 부분 가속(Seed RSI ~1.5x) 구간으로 분류했습니다.",
    timelineLogs: [
      { date: "2026-11-05", event: "METR 공식 평가 블로그 통해 Anthropic R&D 가속 감사 요약 공개" },
      { date: "2026-11-08", event: "ATRC Seed RSI 프록시 승수(1.5x) 교차 검증 완료" },
    ],
  },
  {
    id: "inc-2026-0108",
    caseCode: "INC-2026-0108",
    title: "비공개 수학 난제(나비에-스토크스) 해결 주장 동료평가 보류",
    originatorHandles: ["미확인 커뮤니티 루머"],
    openedDate: "2026-09-04",
    status: "pending",
    statusLabel: "동료평가 확인 대기",
    claimSummary:
      "차세대 추론 모델이 밀레니엄 수학 난제 증명을 도출해 외부 수학자 검토 중이라는 비공식 전언 확산.",
    findingSummary:
      "Lean 형식 증명(Formal Verification) 또는 공식 arXiv·학술지 등재 전까지 시계 가중치 반영을 전면 보류합니다.",
    timelineLogs: [
      { date: "2026-09-04", event: "소셜 채널 내 비공식 주장 포착" },
      { date: "2026-10-12", event: "공개 수식·Lean 코드 부재 확인 — 보류 상태 유지" },
    ],
  },
  {
    id: "inc-2026-0019",
    caseCode: "INC-2026-0019",
    title: "독립 재현 없는 상온 초전도체·테마주 연계 주장 자동 격리",
    originatorHandles: ["바이럴 노이즈 필터"],
    openedDate: "2026-08-19",
    status: "quarantined",
    statusLabel: "교차재현 전 영구 격리",
    claimSummary:
      "독립 연구기관의 재현 데이터 없이 신소재 합성 주장과 특정 종목 티커를 결부한 게시물.",
    findingSummary:
      "관측소 원칙에 따라 복수 학술기관의 독립 재현이 입증되기 전까지 메인 지표 반영을 영구 차단합니다.",
    timelineLogs: [
      { date: "2026-08-19", event: "키워드·증거 가드레일에 의해 메인 스트림 노출 자동 차단" },
    ],
  },
];
