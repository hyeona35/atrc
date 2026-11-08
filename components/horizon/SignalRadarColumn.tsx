"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import type { LiveSignalItem } from "@/lib/server/liveIntel";
import {
  BASELINE_ANCHOR_MS,
  INCIDENT_CASE_FILES,
  INFLUENCER_ACCOUNTS,
} from "@/lib/data/eventHorizonData";
import { Button, EmptyState, Switch, TextField } from "@/components/ui";
import {
  IconArrowPath,
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
  IconSparkles,
} from "@/components/ui/icons";
import { triggerHaptic } from "@/lib/haptics";

function formatRelativeKoreanTime(iso: string, nowMs: number): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "방금 전";
  const diffMinutes = Math.max(1, Math.floor((nowMs - parsed) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 14) return `${diffDays}일 전`;
  const d = new Date(parsed);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

type CategoryFilter = "all" | "official" | "paper" | "ecosystem";

export interface SignalRadarColumnProps {
  signals: LiveSignalItem[];
  isLoading: boolean;
  updatedAtIso?: string;
  onRefreshLive: () => Promise<void> | void;
  onResummarizeItem: (item: LiveSignalItem) => Promise<void> | void;
  resummarizingId: string | null;
  compactPreview?: boolean;
  onViewAllSignals?: () => void;
}

export function SignalRadarColumn({
  signals,
  isLoading,
  updatedAtIso,
  onRefreshLive,
  onResummarizeItem,
  resummarizingId,
  compactPreview = false,
  onViewAllSignals,
}: SignalRadarColumnProps) {
  const [nowMs, setNowMs] = useState<number>(BASELINE_ANCHOR_MS);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [excludeHype, setExcludeHype] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showSourceMatrix, setShowSourceMatrix] = useState<boolean>(false);
  const [showCaseArchives, setShowCaseArchives] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setNowMs(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, [signals]);

  const filteredSignals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = signals.filter((item) => {
      if (excludeHype && item.isHypeWarning) return false;
      if (category !== "all" && item.sourceKind !== category) return false;
      if (!q) return true;
      return (
        item.titleKo.toLowerCase().includes(q) ||
        item.summaryKo.toLowerCase().includes(q) ||
        item.titleOriginal.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q)
      );
    });
    return compactPreview ? base.slice(0, 5) : base;
  }, [signals, excludeHype, category, searchQuery, compactPreview]);

  return (
    <section
      aria-labelledby={
        compactPreview ? "signals-preview-heading" : "signals-full-heading"
      }
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id={
              compactPreview ? "signals-preview-heading" : "signals-full-heading"
            }
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content"
          >
            실시간 검증 시그널
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--label-secondary)" }}
          >
            OpenAI, DeepMind, Hugging Face, arXiv, Hacker News 원문을 실시간 수집하여 한국어로 자동 요약합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {compactPreview && onViewAllSignals ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onViewAllSignals();
              }}
              className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 text-base-content/80 hover:text-base-content hover:bg-base-content/5 pst-press"
            >
              <span>전체 시그널 보기</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<IconArrowPath className="w-4 h-4" />}
              loadingLabel="동기화 중…"
              isLoading={isLoading}
              onClick={() => onRefreshLive()}
            >
              최신 동기화
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar (Full Signals View Only) */}
      {!compactPreview && (
        <div className="p-5 rounded-3xl material-regular space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              role="group"
              aria-label="시그널 출처 분류"
              className="flex flex-wrap items-center gap-1.5"
            >
              {(
                [
                  { id: "all", label: "전체" },
                  { id: "official", label: "공식 발표" },
                  { id: "paper", label: "검증 논문" },
                  { id: "ecosystem", label: "생태계 포착" },
                ] as const
              ).map((tab) => {
                const active = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      triggerHaptic("selection");
                      setCategory(tab.id);
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

            <Switch
              label="과장 주의 자동 제외"
              checked={excludeHype}
              onChange={(checked) => {
                triggerHaptic("selection");
                setExcludeHype(checked);
              }}
              className="sm:w-auto"
            />
          </div>

          <TextField
            label="시그널 검색"
            value={searchQuery}
            onChange={setSearchQuery}
            inputMode="search"
            placeholder="모델명, 연구 키워드, 출처로 필터링"
          />
        </div>
      )}

      {/* Main Signal Ledger Sheet */}
      {isLoading && signals.length === 0 ? (
        <div
          aria-busy="true"
          aria-label="실시간 시그널 불러오는 중"
          className="rounded-3xl material-regular divide-y divide-base-content/10"
        >
          {Array.from({ length: compactPreview ? 4 : 6 }).map((_, idx) => (
            <div key={idx} className="p-6 space-y-3 animate-pulse">
              <div className="h-3 w-36 rounded bg-base-content/10" />
              <div className="h-5 w-3/4 rounded bg-base-content/15" />
              <div className="h-4 w-full rounded bg-base-content/10" />
            </div>
          ))}
        </div>
      ) : filteredSignals.length === 0 ? (
        <EmptyState
          title="조건에 일치하는 시그널이 없습니다"
          description="검색어나 분류 필터를 초기화하면 최신 글로벌 피드를 다시 확인할 수 있습니다."
          action={
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                setCategory("all");
                setSearchQuery("");
                setExcludeHype(true);
              }}
            >
              필터 초기화
            </Button>
          }
        />
      ) : (
        <div className="rounded-3xl material-regular divide-y divide-base-content/10 overflow-hidden">
          {filteredSignals.map((item) => {
            const isExpanded = expandedId === item.id;
            const isSummarizingThis = resummarizingId === item.id;

            const dotClass =
              item.signalGrade === "공식 발표"
                ? "bg-primary"
                : item.signalGrade === "검증 논문"
                ? "bg-secondary"
                : item.isHypeWarning
                ? "bg-warning"
                : "bg-base-content/40";

            return (
              <article key={item.id} className="transition-colors">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => {
                    triggerHaptic("light");
                    setExpandedId((prev) => (prev === item.id ? null : item.id));
                  }}
                  className="w-full text-start px-5 sm:px-7 py-5 sm:py-6 hover:bg-base-content/[0.025] transition-colors space-y-2.5 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {/* Quiet Metadata Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-base-content">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${dotClass}`}
                          aria-hidden="true"
                        />
                        <span>{item.sourceName}</span>
                      </span>
                      <span
                        className="text-base-content/50"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        {item.signalGrade}
                      </span>
                      {item.metricsLabel && (
                        <span
                          className="font-mono tabular-nums"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {item.metricsLabel}
                        </span>
                      )}
                    </div>

                    <span
                      className="font-mono tabular-nums"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      {formatRelativeKoreanTime(item.publishedIso, nowMs)}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-base-content leading-snug">
                    {item.titleKo}
                  </h3>

                  {/* Concise 2-Sentence Auto-Summary */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {item.summaryKo}
                  </p>
                </button>

                {/* Progressive Disclosure Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-7 pb-6 pt-1 space-y-4 border-t border-base-content/5 bg-base-200/35">
                    <div className="pt-3 space-y-1.5">
                      <p className="text-xs font-semibold text-base-content/70">
                        원문 표제 및 초록
                      </p>
                      <p className="text-xs font-semibold text-base-content">
                        {item.titleOriginal}
                      </p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        {item.summaryOriginal}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span
                        className="text-xs"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        요약 엔진: {item.summarizedBy}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="soft"
                          size="xs"
                          leadingIcon={<IconSparkles className="w-3.5 h-3.5" />}
                          isLoading={isSummarizingThis}
                          loadingLabel="온디바이스 요약 중…"
                          onClick={() => onResummarizeItem(item)}
                        >
                          온디바이스 LLM 재요약
                        </Button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border border-base-content/15 text-base-content hover:bg-base-content/5 pst-press"
                        >
                          <span>원문 열기</span>
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
      )}

      {updatedAtIso && (
        <p
          className="text-xs text-end font-mono tabular-nums"
          style={{ color: "var(--label-secondary)" }}
        >
          최근 자동 수집 시각:{" "}
          {new Date(updatedAtIso).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      {/* Full View Reference Disclosures: Credibility Criteria & Incident Archives */}
      {!compactPreview && (
        <div className="pt-4 space-y-3">
          <div className="rounded-3xl material-regular overflow-hidden">
            <button
              type="button"
              aria-expanded={showSourceMatrix}
              onClick={() => {
                triggerHaptic("light");
                setShowSourceMatrix((prev) => !prev);
              }}
              className="w-full min-h-14 px-6 py-4 flex items-center justify-between gap-4 text-start pst-press"
            >
              <div>
                <p className="text-sm font-bold text-base-content">
                  소셜 발신원 신뢰도 가중치 기준표 (24개 주요 채널)
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--label-secondary)" }}
                >
                  공식 발표(S등급)부터 습관적 과장 계정(D·F등급)까지의 자동 필터링 규칙
                </p>
              </div>
              <IconChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  showSourceMatrix ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSourceMatrix && (
              <div className="border-t border-base-content/10 overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-base-content/10 text-base-content/60">
                      <th className="py-3 px-6 text-start font-semibold">등급</th>
                      <th className="py-3 px-4 text-start font-semibold">발신원</th>
                      <th className="py-3 px-4 text-start font-semibold">소속 및 성향</th>
                      <th className="py-3 px-4 text-end font-semibold">적중률</th>
                      <th className="py-3 px-6 text-start font-semibold">검증 규칙</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-content/8">
                    {INFLUENCER_ACCOUNTS.map((acc) => (
                      <tr key={acc.id}>
                        <td className="py-3 px-6 font-mono font-bold text-base-content">
                          {acc.tier}
                        </td>
                        <td className="py-3 px-4 font-semibold text-base-content whitespace-nowrap">
                          {acc.displayName}{" "}
                          <span className="font-mono font-normal opacity-60">
                            {acc.handle}
                          </span>
                        </td>
                        <td
                          className="py-3 px-4"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {acc.affiliation}
                        </td>
                        <td className="py-3 px-4 text-end font-mono tabular-nums text-base-content">
                          {acc.hitRate}%
                        </td>
                        <td
                          className="py-3 px-6"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {acc.filterRuleSummary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-3xl material-regular overflow-hidden">
            <button
              type="button"
              aria-expanded={showCaseArchives}
              onClick={() => {
                triggerHaptic("light");
                setShowCaseArchives((prev) => !prev);
              }}
              className="w-full min-h-14 px-6 py-4 flex items-center justify-between gap-4 text-start pst-press"
            >
              <div>
                <p className="text-sm font-bold text-base-content">
                  주요 루머 교차검증 아카이브
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--label-secondary)" }}
                >
                  대형 미확인 주장과 사후 검증 타임라인 기록
                </p>
              </div>
              <IconChevronDown
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  showCaseArchives ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCaseArchives && (
              <div className="border-t border-base-content/10 divide-y divide-base-content/10">
                {INCIDENT_CASE_FILES.map((file) => (
                  <div
                    key={file.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-base-content/70">
                          {file.caseCode}
                        </span>
                        <span style={{ color: "var(--label-secondary)" }}>
                          {file.statusLabel}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-base-content">
                        {file.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        {file.findingSummary}
                      </p>
                    </div>
                    <Link
                      href={`/preview/${file.id}`}
                      className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border border-base-content/15 text-base-content hover:bg-base-content/5 shrink-0 self-start sm:self-center pst-press"
                    >
                      <span>기록 열람…</span>
                      <IconChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
