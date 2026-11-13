"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  XFeedApiResponse,
  XTimelineItem,
} from "@/app/api/x-feed/route";
import {
  BASELINE_ANCHOR_MS,
  INFLUENCER_ACCOUNTS,
  TIER_METHODOLOGY,
} from "@/lib/data/eventHorizonData";
import {
  readCachedLocalSummaries,
  summarizeWithBestEngine,
} from "@/lib/ai/onDeviceLlm";
import { Button, EmptyState, Switch, TextField } from "@/components/ui";
import {
  IconArrowPath,
  IconCheckCircle,
  IconChevronDown,
  IconClipboard,
  IconExternalLink,
  IconLock,
  IconSparkles,
  IconTrash,
} from "@/components/ui/icons";
import { useModal, useToast } from "@/context/OverlayContext";
import { triggerHaptic } from "@/lib/haptics";

type TierFilter = "all" | "S" | "A" | "B" | "C" | "D";

function formatRelativeTime(iso: string, nowMs: number): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "방금 전";
  const diffMin = Math.max(1, Math.floor((nowMs - parsed) / 60000));
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}일 전`;
}

export function PersonalXFeedSection() {
  const [nowMs, setNowMs] = useState<number>(BASELINE_ANCHOR_MS);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [configured, setConfigured] = useState<boolean>(false);
  const [maskedToken, setMaskedToken] = useState<string | null>(null);
  const [tweets, setTweets] = useState<XTimelineItem[]>([]);
  const [apiNotice, setApiNotice] = useState<string | undefined>(undefined);
  const [updatedAtIso, setUpdatedAtIso] = useState<string | undefined>(
    undefined
  );

  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [excludeHype, setExcludeHype] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [showKeyEditForm, setShowKeyEditForm] = useState<boolean>(false);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);
  const [resummarizingId, setResummarizingId] = useState<string | null>(null);

  const { openAlertDialog } = useModal();
  const { showToast } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => setNowMs(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, [tweets]);

  const fetchFeedData = useCallback(
    async (selectedTier: TierFilter, forceRefresh = false) => {
      const qs = new URLSearchParams({
        tier: selectedTier,
        ...(forceRefresh ? { refresh: "1" } : {}),
      });
      const res = await fetch(`/api/x-feed?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as XFeedApiResponse;
      const localCache = readCachedLocalSummaries();
      const merged = (data.tweets ?? []).map((tw) => {
        const hit = localCache[`x-${tw.id}`];
        return hit
          ? { ...tw, summaryKo: hit.summaryKo, summarizedBy: hit.engine }
          : tw;
      });
      return { data, merged };
    },
    []
  );

  const loadXFeed = useCallback(
    async (selectedTier: TierFilter, forceRefresh = false) => {
      setIsLoadingFeed(true);
      try {
        const result = await fetchFeedData(selectedTier, forceRefresh);
        if (!result) return;
        const { data, merged } = result;

        setConfigured(data.configured);
        setMaskedToken(data.maskedToken);
        setTweets(merged);
        setApiNotice(data.apiNotice);
        setUpdatedAtIso(data.updatedAtIso);

        if (forceRefresh && data.configured && !data.errorCode) {
          showToast({
            title: "인물 X 피드 동기화 완료",
            description: `${merged.length}건의 최신 포스트를 불러왔습니다.`,
            variant: "success",
          });
        }
      } finally {
        setIsLoadingFeed(false);
      }
    },
    [fetchFeedData, showToast]
  );

  useEffect(() => {
    let cancelled = false;
    fetchFeedData("all", false)
      .then((result) => {
        if (cancelled || !result) return;
        const { data, merged } = result;
        setConfigured(data.configured);
        setMaskedToken(data.maskedToken);
        setTweets(merged);
        setApiNotice(data.apiNotice);
        setUpdatedAtIso(data.updatedAtIso);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingFeed(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchFeedData]);

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsSavingKey(true);
    try {
      const res = await fetch("/api/x-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bearerToken: tokenInput }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        maskedToken?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        showToast({
          title: "토큰 형식 확인 필요",
          description:
            json.error ?? "유효한 Bearer Token 문자열을 입력해 주세요.",
          variant: "warning",
        });
        return;
      }

      setTokenInput("");
      setShowKeyEditForm(false);
      setConfigured(true);
      setMaskedToken(json.maskedToken ?? null);
      showToast({
        title: "X API 키 쿠키 저장 완료",
        description:
          "브라우저 HttpOnly 보안 쿠키에 저장되었습니다. 최신 타임라인을 불러옵니다.",
        variant: "success",
      });
      await loadXFeed(tierFilter, true);
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteCookieConfirm = () => {
    triggerHaptic("medium");
    openAlertDialog({
      title: "저장된 X API 키 쿠키를 삭제하시겠습니까?",
      description:
        "브라우저 쿠키에 보관된 Bearer Token이 즉시 파기되며 인물 타임라인 연동이 해제됩니다.",
      actionVerb: "삭제",
      isDestructive: true,
      onAction: async () => {
        await fetch("/api/x-feed", { method: "DELETE" });
        setConfigured(false);
        setMaskedToken(null);
        setTweets([]);
        setApiNotice(undefined);
        showToast({
          title: "API 키 쿠키 삭제됨",
          description: "저장된 인증 쿠키가 완전히 제거되었습니다.",
          variant: "info",
        });
      },
    });
  };

  const handleResummarizeTweet = async (item: XTimelineItem) => {
    setResummarizingId(item.id);
    try {
      const result = await summarizeWithBestEngine(
        `x-${item.id}`,
        `${item.authorName} (${item.handle})`,
        item.textOriginal,
        true
      );
      if (result) {
        setTweets((prev) =>
          prev.map((tw) =>
            tw.id === item.id
              ? {
                  ...tw,
                  summaryKo: result.summaryKo,
                  summarizedBy: result.engine,
                }
              : tw
          )
        );
        showToast({
          title: "포스트 요약 갱신 완료",
          description: `${result.engine}로 한국어 요약을 정제했습니다.`,
          variant: "success",
        });
      }
    } finally {
      setResummarizingId(null);
    }
  };

  const filteredTweets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tweets.filter((tw) => {
      if (excludeHype && tw.isHypeWarning) return false;
      if (!q) return true;
      return (
        tw.authorName.toLowerCase().includes(q) ||
        tw.handle.toLowerCase().includes(q) ||
        tw.summaryKo.toLowerCase().includes(q) ||
        tw.textOriginal.toLowerCase().includes(q)
      );
    });
  }, [tweets, excludeHype, searchQuery]);

  const filteredDirectoryAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return INFLUENCER_ACCOUNTS.filter((acc) => {
      if (tierFilter !== "all" && acc.tier !== tierFilter) return false;
      if (!q) return true;
      return (
        acc.displayName.toLowerCase().includes(q) ||
        acc.handle.toLowerCase().includes(q) ||
        acc.affiliation.toLowerCase().includes(q) ||
        acc.signalTypes.toLowerCase().includes(q)
      );
    });
  }, [tierFilter, searchQuery]);

  const activeTierMeta = useMemo(
    () => TIER_METHODOLOGY.find((m) => m.tier === tierFilter) ?? null,
    [tierFilter]
  );

  const [showTierMethodology, setShowTierMethodology] = useState<boolean>(false);

  const xSearchPack = useMemo(() => {
    const targets =
      tierFilter === "all"
        ? INFLUENCER_ACCOUNTS.filter((a) => a.tier === "S" || a.tier === "B").slice(0, 10)
        : filteredDirectoryAccounts.slice(0, 12);
    const fromClause = targets
      .map((a) => `from:${a.handle.replace(/^@/, "")}`)
      .join(" OR ");
    const query = `(${fromClause}) -filter:replies -filter:retweets`;
    const url = `https://x.com/search?q=${encodeURIComponent(query)}&f=live`;
    return { count: targets.length, query, url };
  }, [tierFilter, filteredDirectoryAccounts]);

  const handleCopyXQuery = async () => {
    triggerHaptic("light");
    try {
      await navigator.clipboard.writeText(xSearchPack.query);
      showToast({
        title: "X 고급 검색 쿼리 복사 완료",
        description: `${xSearchPack.count}인 통합 필터 쿼리가 클립보드에 복사되었습니다.`,
        variant: "success",
      });
    } catch {
      showToast({
        title: "복사 실패",
        description: "클립보드 접근 권한을 확인해 주세요.",
        variant: "warning",
      });
    }
  };

  return (
    <section aria-labelledby="x-feed-heading" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="x-feed-heading"
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content"
          >
            주요 인물 X(트위터) 실시간 모아보기
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            개인 X API v2 Bearer Token을 쿠키에 안전하게 보관하여 1차 검증된 S~D 등급 30인(기관 포함)의 최신 발언을 한곳에서 수집·자동 요약합니다.
          </p>
        </div>

        {configured && (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<IconArrowPath className="w-4 h-4" />}
            isLoading={isLoadingFeed}
            loadingLabel="수집 중…"
            onClick={() => loadXFeed(tierFilter, true)}
          >
            최신 포스트 동기화
          </Button>
        )}
      </div>

      {/* API Key Cookie Connection / Status Sheet */}
      {!configured || showKeyEditForm ? (
        <form
          onSubmit={handleSaveToken}
          className="p-6 sm:p-7 rounded-3xl material-regular space-y-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content">
                <IconLock className="w-3.5 h-3.5 text-accent-primary" />
                <span>브라우저 HttpOnly 보안 쿠키 저장 방식</span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--label-secondary)" }}
              >
                입력한 API 키는 외부 데이터베이스에 기록되지 않으며 사용자의 브라우저 쿠키(유효기간 90일, HttpOnly)에만 저장되어 요청 시 프록시 인증에만 사용됩니다.
              </p>
            </div>

            {configured && showKeyEditForm && (
              <button
                type="button"
                onClick={() => setShowKeyEditForm(false)}
                className="min-h-11 px-3 rounded-xl text-xs font-semibold text-base-content/70 hover:text-base-content pst-press shrink-0"
              >
                취소
              </button>
            )}
          </div>

          <TextField
            id="x-bearer-token-input"
            label="X API v2 Bearer Token"
            type="password"
            autoComplete="off"
            value={tokenInput}
            onChange={setTokenInput}
            placeholder="AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA..."
            helperText="X Developer Portal (developer.x.com) → Projects & Apps → Keys and tokens → Bearer Token"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              aria-expanded={showSetupGuide}
              onClick={() => {
                triggerHaptic("light");
                setShowSetupGuide((prev) => !prev);
              }}
              className="min-h-11 px-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 text-base-content/70 hover:text-base-content pst-press"
            >
              <span>발급 방법 및 요금제 안내</span>
              <IconChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showSetupGuide ? "rotate-180" : ""
                }`}
              />
            </button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingKey}
              loadingLabel="쿠키 저장 중…"
              disabled={tokenInput.trim().length < 20}
            >
              쿠키에 저장 및 피드 연결
            </Button>
          </div>

          {showSetupGuide && (
            <div className="pt-4 border-t border-base-content/10 space-y-2 text-xs leading-relaxed">
              <p style={{ color: "var(--label-secondary)" }}>
                1. <strong className="text-base-content">토큰 발급</strong>: developer.x.com 콘솔에서 Project 산하 App을 생성한 뒤 Read 권한의 Bearer Token을 복사해 붙여넣으세요 (`Bearer ` 접두사나 URL 인코딩 문자열도 자동 정제됩니다).
              </p>
              <p style={{ color: "var(--label-secondary)" }}>
                2. <strong className="text-base-content">엔드포인트 호환성</strong>: 공식 `GET /2/tweets/search/recent` 엔드포인트를 512자 이하 배치 쿼리로 호출하므로 X API Pay-per-use 크레딧 또는 Basic 이상 플랜에서 최근 7일 타임라인이 즉시 수집됩니다.
              </p>
            </div>
          )}
        </form>
      ) : (
        <div className="px-6 py-4 rounded-3xl material-regular flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-base-content">
              <IconCheckCircle className="w-4 h-4 text-success" />
              <span>API 키 쿠키 활성</span>
            </span>
            {maskedToken && (
              <span
                className="font-mono"
                style={{ color: "var(--label-secondary)" }}
              >
                {maskedToken}
              </span>
            )}
            {updatedAtIso && (
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--label-secondary)" }}
              >
                · 최근 조회{" "}
                {new Date(updatedAtIso).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyEditForm(true)}
              className="min-h-11 px-3 rounded-2xl text-xs font-semibold border border-base-content/15 text-base-content hover:bg-base-content/5 pst-press"
            >
              키 변경
            </button>
            <Button
              variant="destructive"
              size="xs"
              opensModal
              leadingIcon={<IconTrash className="w-3.5 h-3.5" />}
              onClick={handleDeleteCookieConfirm}
            >
              쿠키 삭제
            </Button>
          </div>
        </div>
      )}

      {/* Tier & Search Controls */}
      <div className="p-5 rounded-3xl material-regular space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="group"
            aria-label="인물 티어 등급 필터"
            className="flex flex-wrap items-center gap-1.5"
          >
            {(
              [
                { id: "all", label: `전체 (${INFLUENCER_ACCOUNTS.length}인)` },
                { id: "S", label: "S등급 리더" },
                { id: "A", label: "A등급 리서처" },
                { id: "B", label: "B등급 검증기관" },
                { id: "C", label: "C등급 빌더" },
                { id: "D", label: "D등급 비평·큐레이션" },
              ] as const
            ).map((tab) => {
              const active = tierFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    triggerHaptic("selection");
                    setTierFilter(tab.id);
                    void loadXFeed(tab.id, false);
                  }}
                  className={`min-h-11 px-3.5 rounded-2xl text-xs font-semibold transition-colors pst-press ${
                    active
                      ? "bg-primary text-primary-content"
                      : "bg-base-100 text-base-content/75 hover:text-base-content border border-base-content/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {configured && (
            <Switch
              label="과장 주의 자동 제외"
              checked={excludeHype}
              onChange={(checked) => {
                triggerHaptic("selection");
                setExcludeHype(checked);
              }}
            />
          )}
        </div>

        <TextField
          label="인물 · 기관 · 분야 검색"
          value={searchQuery}
          onChange={setSearchQuery}
          inputMode="search"
          placeholder="이름, @핸들, 기관명(METR/Epoch) 또는 키워드 검색"
        />

        {activeTierMeta ? (
          <div className="px-4 py-3 rounded-2xl bg-base-200/50 border border-base-content/10 text-xs space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-base-content">
                {activeTierMeta.title}
              </span>
              <span className="font-mono text-base-content/70">
                신호 가중치 {activeTierMeta.weightRange}
              </span>
            </div>
            <p style={{ color: "var(--label-secondary)" }}>
              {activeTierMeta.evaluationCriteria}
            </p>
          </div>
        ) : (
          <div>
            <button
              type="button"
              aria-expanded={showTierMethodology}
              onClick={() => {
                triggerHaptic("light");
                setShowTierMethodology((prev) => !prev);
              }}
              className="min-h-11 px-1 text-xs font-semibold inline-flex items-center gap-1.5 text-base-content/75 hover:text-base-content pst-press"
            >
              <span>직접 검증 티어 분류 기준 (S~D 5단계)</span>
              <IconChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showTierMethodology ? "rotate-180" : ""
                }`}
              />
            </button>
            {showTierMethodology && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {TIER_METHODOLOGY.map((meta) => (
                  <div
                    key={meta.tier}
                    className="p-3.5 rounded-2xl bg-base-200/45 border border-base-content/10 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-base-content">
                        {meta.title}
                      </span>
                      <span className="font-mono text-[11px] opacity-70">
                        {meta.weightRange}
                      </span>
                    </div>
                    <p
                      className="leading-relaxed"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      {meta.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Keyless Direct X Timeline Launch Strip */}
        <div className="pt-3 border-t border-base-content/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            API 키가 없어도 선택한 등급({xSearchPack.count}인)의 최신 글을 X.com 실시간 검색 피드로 바로 열어볼 수 있습니다.
          </p>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyXQuery}
              className="min-h-11 px-3 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border border-base-content/15 text-base-content hover:bg-base-content/5 pst-press"
            >
              <IconClipboard className="w-3.5 h-3.5" />
              <span>검색 쿼리 복사</span>
            </button>
            <a
              href={xSearchPack.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 bg-base-100 border border-primary/35 text-primary hover:bg-primary/5 pst-press"
            >
              <span>X.com 타임라인 바로 열기</span>
              <IconExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Live Timeline Ledger (When Configured) */}
      {configured && (
        <>
          {apiNotice && (
            <div className="px-5 py-4 rounded-2xl border border-base-content/15 bg-base-100 text-xs leading-relaxed text-base-content">
              {apiNotice}
            </div>
          )}

          {isLoadingFeed && tweets.length === 0 ? (
            <div
              aria-busy="true"
              aria-label="X 타임라인 불러오는 중"
              className="rounded-3xl material-regular divide-y divide-base-content/10"
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-6 space-y-3 animate-pulse">
                  <div className="h-3 w-40 rounded bg-base-content/10" />
                  <div className="h-4 w-full rounded bg-base-content/15" />
                  <div className="h-4 w-2/3 rounded bg-base-content/10" />
                </div>
              ))}
            </div>
          ) : filteredTweets.length > 0 ? (
            <div className="rounded-3xl material-regular divide-y divide-base-content/10 overflow-hidden">
              {filteredTweets.map((tw) => {
                const isExpanded = expandedTweetId === tw.id;
                const isSummarizing = resummarizingId === tw.id;

                return (
                  <article key={tw.id}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => {
                        triggerHaptic("light");
                        setExpandedTweetId((prev) =>
                          prev === tw.id ? null : tw.id
                        );
                      }}
                      className="w-full text-start px-5 sm:px-7 py-5 space-y-2.5 hover:bg-base-content/[0.025] transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-accent-primary">
                            [{tw.tier}]
                          </span>
                          <span className="font-bold text-base-content">
                            {tw.authorName}
                          </span>
                          <span
                            className="font-mono"
                            style={{ color: "var(--label-secondary)" }}
                          >
                            {tw.handle}
                          </span>
                          <span style={{ color: "var(--label-secondary)" }}>
                            · {tw.affiliation} (적중률 {tw.hitRate}%)
                          </span>
                        </div>

                        <span
                          className="font-mono tabular-nums"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {formatRelativeTime(tw.createdAtIso, nowMs)}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-medium leading-relaxed text-base-content">
                        {tw.summaryKo}
                      </p>
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-7 pb-5 pt-2 bg-base-200/35 border-t border-base-content/5 space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-base-content/70">
                            X 원문 포스트
                          </p>
                          <p
                            className="text-xs leading-relaxed whitespace-pre-line"
                            style={{ color: "var(--label-secondary)" }}
                          >
                            {tw.textOriginal}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                          <span
                            className="font-mono tabular-nums"
                            style={{ color: "var(--label-secondary)" }}
                          >
                            반응: 좋아요 {tw.metrics.likeCount.toLocaleString("ko-KR")} · 재게시{" "}
                            {tw.metrics.retweetCount.toLocaleString("ko-KR")} · 답글{" "}
                            {tw.metrics.replyCount.toLocaleString("ko-KR")} ({tw.summarizedBy})
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="soft"
                              size="xs"
                              leadingIcon={<IconSparkles className="w-3.5 h-3.5" />}
                              isLoading={isSummarizing}
                              loadingLabel="요약 중…"
                              onClick={() => handleResummarizeTweet(tw)}
                            >
                              온디바이스 LLM 재요약
                            </Button>

                            <a
                              href={tw.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border border-base-content/15 text-base-content hover:bg-base-content/5 pst-press"
                            >
                              <span>X에서 열기</span>
                              <IconExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            !apiNotice && (
              <EmptyState
                title="표시할 포스트가 없습니다"
                description="선택한 등급 조건을 변경하거나 검색어를 비워 다시 확인해 보세요."
              />
            )
          )}
        </>
      )}

      {/* Curated Research-Backed Account Directory (Always Available for Reference & Direct X Profile Access) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <h3 className="text-base font-bold text-base-content">
            추적 대상 인물 · 검증 기관 디렉터리 ({filteredDirectoryAccounts.length}인)
          </h3>
          <span
            className="text-xs"
            style={{ color: "var(--label-secondary)" }}
          >
            S~D 실증 신뢰도 가중치 및 선정 근거
          </span>
        </div>

        <div className="rounded-3xl material-regular divide-y divide-base-content/10 overflow-hidden">
          {filteredDirectoryAccounts.map((acc) => {
            const cleanHandle = acc.handle.replace(/^@/, "");
            return (
              <div
                key={acc.id}
                className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-accent-primary">
                      {acc.tier}등급
                    </span>
                    <span className="text-sm font-bold text-base-content">
                      {acc.displayName}
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      {acc.handle}
                    </span>
                    <span style={{ color: "var(--label-secondary)" }}>
                      · {acc.affiliation} · 적중 {acc.hitRate}% · 가중치 {acc.weight.toFixed(2)}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {acc.signalTypes} — <span className="text-base-content/75">{acc.evidenceBasis}</span>
                  </p>
                  <p className="text-[11px] opacity-65">
                    검증 규칙: {acc.filterRuleSummary}
                  </p>
                </div>

                <a
                  href={`https://x.com/${cleanHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border border-base-content/12 text-base-content/80 hover:text-base-content hover:bg-base-content/5 shrink-0 self-start sm:self-center pst-press"
                >
                  <span>프로필</span>
                  <IconExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
