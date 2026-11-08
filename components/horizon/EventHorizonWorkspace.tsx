"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppShell,
  type SectionMeta,
} from "@/components/layout/AppShell";
import type {
  BottomBarItem,
  CommandMenuItem,
  SidebarNavItem,
} from "@/components/ui";
import {
  IconArrowPath,
  IconChart,
  IconCompass,
  IconDownload,
  IconGrid,
  IconLayers,
  IconSparkles,
  IconUser,
} from "@/components/ui/icons";
import { useModal, useToast } from "@/context/OverlayContext";
import type {
  LiveFrontierModel,
  LiveIntelPayload,
  LiveSignalItem,
} from "@/lib/server/liveIntel";
import {
  probeInitialOnDeviceStatus,
  readCachedLocalSummaries,
  summarizeWithBestEngine,
  useOnDeviceAi,
} from "@/lib/ai/onDeviceLlm";
import {
  triggerPwaInstallPrompt,
  usePwaInstall,
} from "@/lib/pwaInstall";
import { HeroMultiClock } from "./HeroMultiClock";
import { SignalRadarColumn } from "./SignalRadarColumn";
import { FrontierModelsSection, MacroFutureSection } from "./CoreMetricsColumn";
import { PersonalXFeedSection } from "./PersonalXFeedSection";
import { OnDeviceAiModalBody } from "./OnDeviceAiPanel";

export type HorizonSectionId =
  | "overview"
  | "signals"
  | "x-feed"
  | "models"
  | "macro";

export const HORIZON_PAGE_CONFIG: {
  pageTitle: string;
  pageSubtitle: string;
  sections: Record<HorizonSectionId, SectionMeta>;
} = {
  pageTitle: "Event Horizon",
  pageSubtitle:
    "실시간 AI 시그널 자동 요약, 인물 X 모아보기 및 특이점 · 거시 전환 관측소",
  sections: {
    overview: {
      title: "관측 요약",
      badge: "실시간 관측",
      description: "중위 도달 시계, 최신 검증 시그널 및 프론티어 모델 요약",
    },
    signals: {
      title: "실시간 시그널",
      badge: "자동 요약",
      description: "공식 발표, 학술 프리프린트, 생태계 동향 실시간 수집 및 온디바이스 요약",
    },
    "x-feed": {
      title: "인물 X 피드",
      badge: "개인 API 연동",
      description: "쿠키 기반 개인 X API 키 저장 및 S~F 등급 24인 타임라인 통합 조회",
    },
    models: {
      title: "프론티어 지능",
      badge: "레지스트리",
      description: "실시간 모델 레지스트리, 자율 과업 추세 및 미포화 추론 벤치마크",
    },
    macro: {
      title: "거시 · 미래",
      badge: "12대 지표",
      description: "설비투자·고용 전환 12대 지표 및 바이오·인프라 마일스톤",
    },
  },
};

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: "overview",
    label: "관측 요약",
    icon: <IconGrid className="w-5 h-5" />,
    activeIcon: <IconGrid className="w-5 h-5" filled />,
  },
  {
    id: "signals",
    label: "실시간 시그널",
    icon: <IconCompass className="w-5 h-5" />,
    activeIcon: <IconCompass className="w-5 h-5" filled />,
  },
  {
    id: "x-feed",
    label: "인물 X 피드",
    icon: <IconUser className="w-5 h-5" />,
    activeIcon: <IconUser className="w-5 h-5" filled />,
  },
  {
    id: "models",
    label: "프론티어 지능",
    icon: <IconLayers className="w-5 h-5" />,
    activeIcon: <IconLayers className="w-5 h-5" filled />,
  },
  {
    id: "macro",
    label: "거시 · 미래",
    icon: <IconChart className="w-5 h-5" />,
    activeIcon: <IconChart className="w-5 h-5" filled />,
  },
];

// Strictly 5 items (pstui Mobile TabBar rule: 3~5 items max)
const MOBILE_TAB_ITEMS: BottomBarItem[] = [
  {
    id: "overview",
    label: "요약",
    icon: <IconGrid className="w-5 h-5" />,
    activeIcon: <IconGrid className="w-5 h-5" filled />,
  },
  {
    id: "signals",
    label: "시그널",
    icon: <IconCompass className="w-5 h-5" />,
    activeIcon: <IconCompass className="w-5 h-5" filled />,
  },
  {
    id: "x-feed",
    label: "X 피드",
    icon: <IconUser className="w-5 h-5" />,
    activeIcon: <IconUser className="w-5 h-5" filled />,
  },
  {
    id: "models",
    label: "지능",
    icon: <IconLayers className="w-5 h-5" />,
    activeIcon: <IconLayers className="w-5 h-5" filled />,
  },
  {
    id: "macro",
    label: "거시",
    icon: <IconChart className="w-5 h-5" />,
    activeIcon: <IconChart className="w-5 h-5" filled />,
  },
];

function applyLocalSummaryCache(items: LiveSignalItem[]): LiveSignalItem[] {
  const cached = readCachedLocalSummaries();
  return items.map((item) => {
    const hit = cached[item.id];
    if (!hit) return item;
    return {
      ...item,
      summaryKo: hit.summaryKo,
      summarizedBy: hit.engine,
    };
  });
}

export interface EventHorizonWorkspaceProps {
  pageTitle?: string;
  pageSubtitle?: string;
  sections?: Record<string, SectionMeta>;
  initialSection?: HorizonSectionId;
  streamingSlot?: React.ReactNode;
}

export function EventHorizonWorkspace({
  pageTitle = HORIZON_PAGE_CONFIG.pageTitle,
  pageSubtitle = HORIZON_PAGE_CONFIG.pageSubtitle,
  sections = HORIZON_PAGE_CONFIG.sections,
  initialSection = "overview",
  streamingSlot,
}: EventHorizonWorkspaceProps) {
  const [activeSection, setActiveSection] =
    useState<HorizonSectionId>(initialSection);
  const [signals, setSignals] = useState<LiveSignalItem[]>([]);
  const [liveModels, setLiveModels] = useState<LiveFrontierModel[]>([]);
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [updatedAtIso, setUpdatedAtIso] = useState<string | undefined>(
    undefined
  );
  const [liveStats, setLiveStats] = useState<
    LiveIntelPayload["stats"] | undefined
  >(undefined);
  const [isLoadingIntel, setIsLoadingIntel] = useState<boolean>(true);
  const [resummarizingId, setResummarizingId] = useState<string | null>(null);

  const aiStatus = useOnDeviceAi();
  const pwaState = usePwaInstall();
  const { openModal } = useModal();
  const { showToast } = useToast();

  const fetchLiveIntel = useCallback(
    async (forceRefresh = false, silent = false) => {
      if (!silent) setIsLoadingIntel(true);
      try {
        const res = await fetch(
          forceRefresh ? "/api/live-intel?refresh=1" : "/api/live-intel",
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const payload = (await res.json()) as LiveIntelPayload;
        const mergedSignals = applyLocalSummaryCache(payload.signals ?? []);
        setSignals(mergedSignals);
        setLiveModels(payload.liveModels ?? []);
        setActiveSources(payload.activeSources ?? []);
        setUpdatedAtIso(payload.updatedAtIso);
        setLiveStats(payload.stats);

        if (forceRefresh) {
          showToast({
            title: "실시간 피드 동기화 완료",
            description: `${mergedSignals.length}건의 최신 시그널과 ${payload.liveModels.length}개 모델을 갱신했습니다.`,
            variant: "success",
          });
        }
      } catch {
        if (forceRefresh) {
          showToast({
            title: "피드 갱신 지연",
            description: "네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
            variant: "warning",
          });
        }
      } finally {
        if (!silent) setIsLoadingIntel(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const [, status] = await Promise.all([
        fetchLiveIntel(false, false),
        probeInitialOnDeviceStatus(),
      ]);

      if (
        !cancelled &&
        (status.chromeBuiltinAvailable || status.ollamaModelName)
      ) {
        setSignals((current) => {
          const candidates = current.slice(0, 2);
          void (async () => {
            for (const item of candidates) {
              if (cancelled) break;
              const refined = await summarizeWithBestEngine(
                item.id,
                item.titleOriginal,
                item.summaryOriginal
              );
              if (refined && !cancelled) {
                setSignals((prev) =>
                  prev.map((s) =>
                    s.id === item.id
                      ? {
                          ...s,
                          summaryKo: refined.summaryKo,
                          summarizedBy: refined.engine,
                        }
                      : s
                  )
                );
              }
            }
          })();
          return current;
        });
      }
    };

    void bootstrap();

    const interval = window.setInterval(() => {
      void fetchLiveIntel(false, true);
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [fetchLiveIntel]);

  const handleResummarizeItem = useCallback(
    async (item: LiveSignalItem) => {
      setResummarizingId(item.id);
      try {
        const result = await summarizeWithBestEngine(
          item.id,
          item.titleOriginal,
          item.summaryOriginal,
          true
        );
        if (result) {
          setSignals((prev) =>
            prev.map((s) =>
              s.id === item.id
                ? {
                    ...s,
                    summaryKo: result.summaryKo,
                    summarizedBy: result.engine,
                  }
                : s
            )
          );
          showToast({
            title: "요약 정제 완료",
            description: `${result.engine}로 요약을 갱신했습니다.`,
            variant: "success",
          });
        }
      } finally {
        setResummarizingId(null);
      }
    },
    [showToast]
  );

  const handleBatchSummarizeVisible = useCallback(async () => {
    const targets = signals.slice(0, 4);
    for (const item of targets) {
      setResummarizingId(item.id);
      const result = await summarizeWithBestEngine(
        item.id,
        item.titleOriginal,
        item.summaryOriginal,
        aiStatus.workerState === "ready"
      );
      if (result) {
        setSignals((prev) =>
          prev.map((s) =>
            s.id === item.id
              ? {
                  ...s,
                  summaryKo: result.summaryKo,
                  summarizedBy: result.engine,
                }
              : s
          )
        );
      }
    }
    setResummarizingId(null);
    showToast({
      title: "상위 시그널 요약 갱신 완료",
      description: "온디바이스 캐시에 최신 요약본이 저장되었습니다.",
      variant: "success",
    });
  }, [signals, aiStatus.workerState, showToast]);

  const handleOpenAiModal = useCallback(() => {
    openModal({
      id: "on-device-ai-settings",
      title: "앱 설치 · 실시간 수집 및 온디바이스 LLM",
      description:
        "PWA 독립 앱 설치, 자동 피드 수집 파이프라인, 브라우저 로컬 LLM 설정입니다.",
      size: "md",
      content: (
        <OnDeviceAiModalBody
          activeSources={activeSources}
          updatedAtIso={updatedAtIso}
          isSyncing={isLoadingIntel}
          onSyncNow={() => fetchLiveIntel(true, false)}
          onBatchSummarizeVisible={handleBatchSummarizeVisible}
        />
      ),
    });
  }, [
    openModal,
    activeSources,
    updatedAtIso,
    isLoadingIntel,
    fetchLiveIntel,
    handleBatchSummarizeVisible,
  ]);

  const handleQuickInstallPwa = useCallback(async () => {
    const outcome = await triggerPwaInstallPrompt();
    if (outcome === "accepted") {
      showToast({
        title: "앱 설치 완료",
        description: "Event Horizon이 독립형 앱으로 설치되었습니다.",
        variant: "success",
      });
    } else if (outcome === "manual_guide_needed") {
      handleOpenAiModal();
    }
  }, [showToast, handleOpenAiModal]);

  const handleSelectSection = useCallback((sectionId: string) => {
    if (
      sectionId === "overview" ||
      sectionId === "signals" ||
      sectionId === "x-feed" ||
      sectionId === "models" ||
      sectionId === "macro"
    ) {
      setActiveSection(sectionId);
      if (typeof window !== "undefined") {
        const targetPath = sectionId === "x-feed" ? "/x-feed" : "/";
        if (window.location.pathname !== targetPath) {
          window.history.replaceState(null, "", targetPath);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, []);

  const commandItems: CommandMenuItem[] = useMemo(
    () => [
      {
        id: "nav-overview",
        title: "관측 요약으로 이동",
        category: "화면 이동",
        icon: <IconGrid className="w-4 h-4" />,
        keywords: ["home", "overview", "agi", "rsi", "시계", "요약"],
        onSelect: () => handleSelectSection("overview"),
      },
      {
        id: "nav-signals",
        title: "실시간 검증 시그널 열기",
        category: "화면 이동",
        icon: <IconCompass className="w-4 h-4" />,
        keywords: ["signals", "arxiv", "openai", "deepmind", "시그널", "뉴스"],
        onSelect: () => handleSelectSection("signals"),
      },
      {
        id: "nav-x-feed",
        title: "주요 인물 X(트위터) 모아보기 열기",
        category: "화면 이동",
        icon: <IconUser className="w-4 h-4" />,
        keywords: ["x", "twitter", "트위터", "인물", "api", "쿠키"],
        onSelect: () => handleSelectSection("x-feed"),
      },
      {
        id: "nav-models",
        title: "프론티어 지능 및 벤치마크 열기",
        category: "화면 이동",
        icon: <IconLayers className="w-4 h-4" />,
        keywords: ["models", "metr", "arc", "openrouter", "모델", "벤치마크"],
        onSelect: () => handleSelectSection("models"),
      },
      {
        id: "nav-macro",
        title: "거시경제 · 미래 마일스톤 열기",
        category: "화면 이동",
        icon: <IconChart className="w-4 h-4" />,
        keywords: ["macro", "ubi", "employment", "거시", "고용"],
        onSelect: () => handleSelectSection("macro"),
      },
      {
        id: "action-sync",
        title: "지금 실시간 피드 강제 동기화",
        category: "자동화 및 앱",
        icon: <IconArrowPath className="w-4 h-4" />,
        keywords: ["refresh", "sync", "동기화", "새로고침"],
        onSelect: () => {
          void fetchLiveIntel(true, false);
        },
      },
      {
        id: "action-pwa-install",
        title: "Event Horizon 앱 설치 (PWA)…",
        category: "자동화 및 앱",
        icon: <IconDownload className="w-4 h-4" />,
        keywords: ["pwa", "install", "설치", "앱"],
        onSelect: () => {
          void handleQuickInstallPwa();
        },
      },
      {
        id: "action-ondevice-ai",
        title: "온디바이스 LLM 요약 설정 열기…",
        category: "자동화 및 앱",
        icon: <IconSparkles className="w-4 h-4" />,
        keywords: ["llm", "webgpu", "ollama", "온디바이스", "요약"],
        onSelect: () => handleOpenAiModal(),
      },
    ],
    [
      handleSelectSection,
      fetchLiveIntel,
      handleQuickInstallPwa,
      handleOpenAiModal,
    ]
  );

  const headerControls = (
    <div className="inline-flex items-center gap-1.5">
      {!pwaState.isStandalone && (
        <button
          type="button"
          onClick={handleQuickInstallPwa}
          aria-label="Event Horizon 앱 설치"
          className="min-h-11 px-3 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border border-base-content/12 bg-base-100/70 hover:bg-base-100 text-base-content transition-colors pst-press"
        >
          <IconDownload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">앱 설치</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleOpenAiModal}
        aria-label="자동 요약 및 실시간 동기화 설정 열기"
        className="min-h-11 px-3 rounded-2xl text-xs font-semibold inline-flex items-center gap-2 border border-base-content/12 bg-base-100/70 hover:bg-base-100 text-base-content transition-colors pst-press"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isLoadingIntel ? "bg-warning animate-pulse" : "bg-success"
          }`}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">
          {aiStatus.activeEngine === "server-api"
            ? "자동 요약…"
            : "온디바이스 AI…"}
        </span>
        <span className="sm:hidden">AI…</span>
      </button>
    </div>
  );

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      title={pageTitle}
      subtitle={pageSubtitle}
      brandLabel="Event Horizon"
      sectionTitles={sections}
      sidebarItems={SIDEBAR_NAV_ITEMS}
      mobileTabs={MOBILE_TAB_ITEMS}
      activeMobileTabId={activeSection}
      hideSplitViewToggle
      hideAuthControls
      minimalHeader
      headerRightExtraSlot={headerControls}
      mobileRightExtraSlot={headerControls}
      commandItems={commandItems}
    >
      <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-14 sm:space-y-20">
        {activeSection === "overview" && (
          <>
            <HeroMultiClock liveStats={liveStats} />

            <SignalRadarColumn
              signals={signals}
              isLoading={isLoadingIntel}
              updatedAtIso={updatedAtIso}
              onRefreshLive={() => fetchLiveIntel(true, false)}
              onResummarizeItem={handleResummarizeItem}
              resummarizingId={resummarizingId}
              compactPreview
              onViewAllSignals={() => handleSelectSection("signals")}
            />

            <FrontierModelsSection
              liveModels={liveModels}
              isLoading={isLoadingIntel}
              compactPreview
              onViewAllModels={() => handleSelectSection("models")}
            />

            {streamingSlot}
          </>
        )}

        {activeSection === "signals" && (
          <SignalRadarColumn
            signals={signals}
            isLoading={isLoadingIntel}
            updatedAtIso={updatedAtIso}
            onRefreshLive={() => fetchLiveIntel(true, false)}
            onResummarizeItem={handleResummarizeItem}
            resummarizingId={resummarizingId}
          />
        )}

        {activeSection === "x-feed" && <PersonalXFeedSection />}

        {activeSection === "models" && (
          <FrontierModelsSection
            liveModels={liveModels}
            isLoading={isLoadingIntel}
          />
        )}

        {activeSection === "macro" && <MacroFutureSection />}
      </div>
    </AppShell>
  );
}
