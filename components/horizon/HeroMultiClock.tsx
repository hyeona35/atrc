"use client";

import React, { useEffect, useState } from "react";
import {
  BASELINE_ANCHOR_MS,
  ENSEMBLE_CLOCKS,
  type EnsembleClockSpec,
} from "@/lib/data/eventHorizonData";
import type { PredictionMarketItem } from "@/lib/server/liveIntel";
import {
  IconCalendar,
  IconChevronDown,
  IconExternalLink,
  IconShare,
  IconSliders,
} from "@/components/ui/icons";
import { useToast } from "@/context/OverlayContext";
import { triggerHaptic } from "@/lib/haptics";

interface CountdownParts {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
}

function computeCountdown(targetMs: number, nowMs: number): CountdownParts {
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function formatKoreanYearMonth(ms: number): string {
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  return `${year}년 ${month}월`;
}

function formatShortYearMonth(ms: number): string {
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

const TIMELINE_START_MS = Date.parse("2026-06-01T00:00:00+09:00");
const TIMELINE_END_MS = Date.parse("2033-06-01T00:00:00+09:00");
const MS_PER_MONTH = 30.4375 * 86400 * 1000;
const SAFETY_BUFFER_MS = 14 * MS_PER_MONTH;

function toTimelinePercent(ms: number): number {
  const ratio = (ms - TIMELINE_START_MS) / (TIMELINE_END_MS - TIMELINE_START_MS);
  return Math.min(97, Math.max(3, ratio * 100));
}

type ScenarioMode = "fast-rsi" | "baseline" | "safety-buffer";

export interface HeroMultiClockProps {
  liveStats?: {
    totalSignalsFetched: number;
    liveModelsTracked: number;
    reasoningAndAgentPaperRatioPercent: number;
  };
  predictionMarkets?: PredictionMarketItem[];
}

export function HeroMultiClock({
  liveStats,
  predictionMarkets = [],
}: HeroMultiClockProps) {
  const [nowMs, setNowMs] = useState<number>(BASELINE_ANCHOR_MS);
  const [selectedClockId, setSelectedClockId] =
    useState<EnsembleClockSpec["id"]>("agi");
  const [scenario, setScenario] = useState<ScenarioMode>("baseline");
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [showAllMarkets, setShowAllMarkets] = useState<boolean>(false);
  const [rdSpeedupFactor, setRdSpeedupFactor] = useState<number>(1.0);
  const [infraOffsetMonths, setInfraOffsetMonths] = useState<number>(0);
  const { showToast } = useToast();

  useEffect(() => {
    const updateClock = () => setNowMs(Date.now());
    const initialTimer = window.setTimeout(updateClock, 0);
    const interval = window.setInterval(updateClock, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const selectedClock =
    ENSEMBLE_CLOCKS.find((c) => c.id === selectedClockId) ?? ENSEMBLE_CLOCKS[1];

  const computeScenarioTargetMs = (
    spec: EnsembleClockSpec,
    targetScenario: ScenarioMode
  ): number => {
    let baseTargetMs: number;
    if (targetScenario === "fast-rsi") {
      baseTargetMs = Date.parse(spec.fastTakeoffDateIso);
    } else {
      const baseMs = Date.parse(spec.targetDateIso);
      if (targetScenario === "baseline") {
        baseTargetMs = baseMs;
      } else if (spec.id === "seed-rsi") {
        baseTargetMs = baseMs + SAFETY_BUFFER_MS * 0.25;
      } else if (spec.id === "agi") {
        baseTargetMs = baseMs + SAFETY_BUFFER_MS;
      } else if (spec.id === "rsi") {
        baseTargetMs = baseMs + SAFETY_BUFFER_MS * 0.85;
      } else {
        baseTargetMs = baseMs + SAFETY_BUFFER_MS * 0.75;
      }
    }

    const remainingFromAnchor = Math.max(0, baseTargetMs - BASELINE_ANCHOR_MS);
    const scaledRemaining = remainingFromAnchor / Math.max(0.5, rdSpeedupFactor);
    const finalMs =
      BASELINE_ANCHOR_MS + scaledRemaining + infraOffsetMonths * MS_PER_MONTH;
    return Math.max(nowMs + 86400 * 1000, finalMs);
  };

  const getAdjustedTargetMs = (spec: EnsembleClockSpec): number =>
    computeScenarioTargetMs(spec, scenario);

  const isCustomModified =
    Math.abs(rdSpeedupFactor - 1.0) > 0.01 || infraOffsetMonths !== 0;

  const activeTargetMs = getAdjustedTargetMs(selectedClock);
  const countdown = computeCountdown(activeTargetMs, nowMs);
  const nowPercent = toTimelinePercent(nowMs);

  const seedMs = getAdjustedTargetMs(ENSEMBLE_CLOCKS[0]!);
  const agiMs = getAdjustedTargetMs(ENSEMBLE_CLOCKS[1]!);
  const fullRsiMs = getAdjustedTargetMs(ENSEMBLE_CLOCKS[2]!);
  const gapMonths = Math.max(1, Math.round((fullRsiMs - seedMs) / MS_PER_MONTH));

  const fastTargetMs = computeScenarioTargetMs(selectedClock, "fast-rsi");
  const baselineTargetMs = computeScenarioTargetMs(selectedClock, "baseline");
  const safetyTargetMs = computeScenarioTargetMs(selectedClock, "safety-buffer");

  const handleShareForecast = async () => {
    triggerHaptic("light");
    const scenarioLabel =
      scenario === "fast-rsi"
        ? "선행 RSI 가속"
        : scenario === "safety-buffer"
        ? "안전 완충"
        : "기본 추세";
    const summaryText = `ATRC 도달 예측 | ${selectedClock.shortCode}: ${formatKoreanYearMonth(
      activeTargetMs
    )} (D-${countdown.days}) · 시나리오: ${scenarioLabel} | METR 27.0h · ARC-AGI-3 81.2%`;
    const shareUrl =
      typeof window !== "undefined" ? window.location.href : "https://atrc.hyeona3.com";

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: `ATRC — ${selectedClock.shortCode} 도달 예측`,
          text: summaryText,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(`${summaryText}\n${shareUrl}`);
      showToast({
        title: "예측 스냅샷 복사 완료",
        description: "도달 예측 시기와 핵심 지표 요약이 클립보드에 복사되었습니다.",
        variant: "success",
      });
    } catch {
      // User cancelled native share sheet or clipboard unavailable
    }
  };

  const handleDownloadIcs = () => {
    triggerHaptic("light");
    const d = new Date(activeTargetMs);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const nextDay = new Date(activeTargetMs + 86400 * 1000);
    const ny = nextDay.getUTCFullYear();
    const nm = String(nextDay.getUTCMonth() + 1).padStart(2, "0");
    const nday = String(nextDay.getUTCDate()).padStart(2, "0");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ATRC Observatory//Forecast//KO",
      "BEGIN:VEVENT",
      `UID:atrc-${selectedClock.id}-${scenario}-${y}${m}${day}@atrc.hyeona3.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${y}${m}${day}`,
      `DTEND;VALUE=DATE:${ny}${nm}${nday}`,
      `SUMMARY:ATRC — ${selectedClock.koreanTitle} 도달 예측`,
      `DESCRIPTION:${selectedClock.definition} (https://atrc.hyeona3.com)`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atrc-${selectedClock.id}-${y}${m}.ics`;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      title: "캘린더 일정(.ics) 저장 완료",
      description: `${selectedClock.shortCode} 예측 시점(${formatKoreanYearMonth(
        activeTargetMs
      )}) 일정을 내려받았습니다.`,
      variant: "success",
    });
  };

  return (
    <section
      aria-labelledby="horizon-timepiece-heading"
      className="pt-2 pb-10 border-b border-base-content/10 space-y-7"
    >
      {/* Editorial Header Row: quiet milestone title + underline scenario tabs (no boxes, no badges) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-base-content/10">
        <div className="space-y-1">
          <p className="text-xs font-mono tracking-wider uppercase text-base-content/50">
            {selectedClock.shortCode}
            {isCustomModified ? " · 커스텀 가정" : ""}
          </p>
          <h2
            id="horizon-timepiece-heading"
            className="text-lg sm:text-xl font-bold tracking-tight text-base-content"
          >
            {selectedClock.koreanTitle}
          </h2>
        </div>

        <div
          role="group"
          aria-label="예측 시나리오 전환"
          className="flex items-center gap-5 sm:gap-6"
        >
          {(
            [
              { id: "fast-rsi", label: "선행 가속", ms: fastTargetMs },
              { id: "baseline", label: "기본 추세", ms: baselineTargetMs },
              { id: "safety-buffer", label: "안전 완충", ms: safetyTargetMs },
            ] as const
          ).map((opt) => {
            const active = scenario === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  setScenario(opt.id);
                }}
                aria-pressed={active}
                className={`min-h-11 pb-2 -mb-[17px] text-start transition-colors cursor-pointer border-b-2 ${
                  active
                    ? "border-primary text-base-content"
                    : "border-transparent text-base-content/45 hover:text-base-content/80"
                }`}
              >
                <span className="block text-[11px] font-medium">
                  {opt.label}
                </span>
                <span className="block text-xs sm:text-sm font-mono font-bold tabular-nums">
                  {formatShortYearMonth(opt.ms)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focal Arrival Period & Open Typographic Live Countdown (no gradients, no boxes, no badges) */}
      <div className="py-1 sm:py-2 space-y-5">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
          <p className="text-5xl sm:text-7xl font-black tracking-[-0.04em] text-base-content tabular-nums leading-none">
            {formatKoreanYearMonth(activeTargetMs)}
          </p>
          <span className="text-xl sm:text-2xl font-mono font-bold tabular-nums text-primary">
            D-{countdown.days.toLocaleString("ko-KR")}
          </span>
        </div>

        {/* Hairline-Separated Live Countdown Numerals */}
        <div className="flex flex-wrap items-baseline gap-y-2 font-mono tabular-nums text-base-content">
          <div className="pe-4 sm:pe-6 border-e border-base-content/12">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              {countdown.days.toLocaleString("ko-KR")}
            </span>
            <span className="text-xs font-sans font-medium text-base-content/45 ms-1">
              일
            </span>
          </div>
          <div className="px-4 sm:px-6 border-e border-base-content/12">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              {countdown.hours}
            </span>
            <span className="text-xs font-sans font-medium text-base-content/45 ms-1">
              시간
            </span>
          </div>
          <div className="px-4 sm:px-6 border-e border-base-content/12">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              {countdown.minutes}
            </span>
            <span className="text-xs font-sans font-medium text-base-content/45 ms-1">
              분
            </span>
          </div>
          <div className="ps-4 sm:ps-6">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content/70">
              {countdown.seconds}
            </span>
            <span className="text-xs font-sans font-medium text-base-content/45 ms-1">
              초
            </span>
          </div>
        </div>

        <p
          className="text-sm leading-relaxed max-w-2xl"
          style={{ color: "var(--label-secondary)" }}
        >
          {selectedClock.definition}
        </p>
      </div>

      {/* Linear 2026 — 2033 Architectural Horizon Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-base-content/55">
          <span>2026</span>
          <span>2028</span>
          <span>2030</span>
          <span>2032</span>
        </div>

        <div className="relative h-2.5 rounded-full bg-base-content/10">
          <div
            className="absolute inset-y-0 start-0 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${nowPercent}%` }}
            aria-hidden="true"
          />
          {ENSEMBLE_CLOCKS.map((clock) => {
            const pct = toTimelinePercent(getAdjustedTargetMs(clock));
            const isSelected = clock.id === selectedClockId;
            return (
              <span
                key={clock.id}
                aria-hidden="true"
                style={{ left: `${pct}%` }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all ${
                  isSelected
                    ? "w-4 h-4 bg-primary ring-4 ring-primary/25"
                    : "w-2.5 h-2.5 bg-base-content/45"
                }`}
              />
            );
          })}
        </div>

        {/* Milestone Selector Pills + Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {ENSEMBLE_CLOCKS.map((clock) => {
              const adjustedMs = getAdjustedTargetMs(clock);
              const isSelected = clock.id === selectedClockId;
              return (
                <button
                  key={clock.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setSelectedClockId(clock.id);
                  }}
                  aria-pressed={isSelected}
                  className={`min-h-11 px-3.5 rounded-2xl text-xs font-semibold transition-colors pst-press cursor-pointer inline-flex items-center gap-2 border ${
                    isSelected
                      ? "bg-base-100 border-primary/45 text-base-content shadow-xs"
                      : "bg-transparent border-base-content/12 text-base-content/70 hover:text-base-content hover:border-base-content/25"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-primary" : "bg-base-content/35"
                    }`}
                  />
                  <span>{clock.shortCode}</span>
                  <span className="font-mono tabular-nums opacity-75">
                    {formatShortYearMonth(adjustedMs)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setShowSimulator((prev) => !prev);
                if (showMethodology) setShowMethodology(false);
              }}
              aria-expanded={showSimulator}
              className={`min-h-11 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 pst-press cursor-pointer transition-colors ${
                showSimulator || isCustomModified
                  ? "text-primary bg-primary/10"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              <IconSliders className="w-3.5 h-3.5" />
              <span>
                What-If 조절{isCustomModified ? " (적용)" : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setShowMethodology((prev) => !prev);
                if (showSimulator) setShowSimulator(false);
              }}
              aria-expanded={showMethodology}
              className="min-h-11 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 text-base-content/70 hover:text-base-content pst-press cursor-pointer"
            >
              <span>지표 · RSI 해설</span>
              <IconChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showMethodology ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={handleShareForecast}
              aria-label="현재 도달 예측 스냅샷 공유 또는 복사"
              title="예측 공유"
              className="min-w-11 min-h-11 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 text-base-content/70 hover:text-base-content hover:bg-base-content/5 pst-press cursor-pointer"
            >
              <IconShare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">공유</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadIcs}
              aria-label="도달 예측 시점을 캘린더 일정(.ics)으로 저장"
              title="캘린더(.ics) 추가"
              className="min-w-11 min-h-11 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 text-base-content/70 hover:text-base-content hover:bg-base-content/5 pst-press cursor-pointer"
            >
              <IconCalendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">일정</span>
            </button>
          </div>
        </div>

        {/* Interactive What-If Sensitivity Simulator */}
        {showSimulator && (
          <div className="mt-3 p-5 sm:p-6 rounded-3xl material-regular space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-base-content">
                  What-If 도달 시점 민감도 시뮬레이터
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--label-secondary)" }}
                >
                  알고리즘 R&D 자동화 배수와 전력·규제 병목 완충 기간을 조절해 4개 마일스톤의 변동을 관측합니다.
                </p>
              </div>
              {isCustomModified && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setRdSpeedupFactor(1.0);
                    setInfraOffsetMonths(0);
                  }}
                  className="min-h-11 px-3 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 pst-press cursor-pointer"
                >
                  기본값 초기화
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="sim-rd-speedup"
                    className="font-semibold text-base-content"
                  >
                    AI R&D 자동화 가속 계수
                  </label>
                  <span className="font-mono font-bold tabular-nums text-primary">
                    {rdSpeedupFactor.toFixed(2)}x
                  </span>
                </div>
                <input
                  id="sim-rd-speedup"
                  type="range"
                  min={0.7}
                  max={1.8}
                  step={0.05}
                  value={rdSpeedupFactor}
                  onChange={(e) => setRdSpeedupFactor(Number.parseFloat(e.target.value))}
                  className="range range-xs range-primary w-full"
                />
                <div
                  className="flex justify-between text-[11px] font-mono"
                  style={{ color: "var(--label-secondary)" }}
                >
                  <span>0.7x (정체)</span>
                  <span>1.0x (기본)</span>
                  <span>1.8x (급가속)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="sim-infra-offset"
                    className="font-semibold text-base-content"
                  >
                    전력 · 연산 · 규제 병목 가감
                  </label>
                  <span className="font-mono font-bold tabular-nums text-base-content">
                    {infraOffsetMonths > 0
                      ? `+${infraOffsetMonths}개월`
                      : `${infraOffsetMonths}개월`}
                  </span>
                </div>
                <input
                  id="sim-infra-offset"
                  type="range"
                  min={-6}
                  max={18}
                  step={1}
                  value={infraOffsetMonths}
                  onChange={(e) => setInfraOffsetMonths(Number.parseInt(e.target.value, 10))}
                  className="range range-xs range-secondary w-full"
                />
                <div
                  className="flex justify-between text-[11px] font-mono"
                  style={{ color: "var(--label-secondary)" }}
                >
                  <span>-6개월 (조기 증설)</span>
                  <span>0개월</span>
                  <span>+18개월 (병목)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progressive Disclosure: Empirical Proxies + Seed RSI vs Full RSI Analysis */}
        {showMethodology && (
          <div className="mt-3 p-5 sm:p-6 rounded-3xl material-regular space-y-5">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-base-content">
                {selectedClock.koreanTitle} 관측 대리 지표
              </p>
              <div className="divide-y divide-base-content/10">
                {selectedClock.keyProxies.map((proxy) => (
                  <div
                    key={proxy.label}
                    className="py-2.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <span style={{ color: "var(--label-secondary)" }}>
                      {proxy.label}
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-base-content">
                      현재 {proxy.current} → 임계치 {proxy.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-base-content/10 space-y-3 text-xs leading-relaxed">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-base-content">
                  왜 초기 RSI(Seed RSI)는 AGI보다 먼저 오고, 완전 자율 RSI(Full RSI)는 뒤에 배치되는가?
                </p>
                <span className="font-mono text-[11px] font-semibold text-primary tabular-nums">
                  현재 시나리오 기준 단계 간격 {gapMonths}개월
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-base-200/45 border border-base-content/10 space-y-0.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-base-content">1단계 · Seed RSI</span>
                    <span className="text-primary font-bold">{formatShortYearMonth(seedMs)}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--label-secondary)" }}>
                    코딩·커널·보상검증 등 디지털 폐쇄 루프 R&D 자동화 점화
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-base-200/45 border border-base-content/10 space-y-0.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-base-content">2단계 · 범용 AGI</span>
                    <span className="text-primary font-bold">{formatShortYearMonth(agiMs)}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--label-secondary)" }}>
                    비정형 지식·멀티모달 주 40시간 범용 인지 과업 자율 완수
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-base-200/45 border border-base-content/10 space-y-0.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-base-content">3단계 · Full RSI</span>
                    <span className="text-primary font-bold">{formatShortYearMonth(fullRsiMs)}</span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--label-secondary)" }}>
                    인간 개입 없이 신규 아키텍처 발명·클러스터 본학습 단독 주도
                  </p>
                </div>
              </div>

              <p style={{ color: "var(--label-secondary)" }}>
                코딩·합성데이터 정제·강화학습 검증은 정답 피드백이 즉각적인 디지털 루프이므로 범용 AGI보다 먼저 가속(Seed RSI)되지만, 아키텍처 발명과 수만 장 가속기 본학습 전체를 인간 없이 순환하는 완전 자율(Full RSI)은 장기 실패 복구(1,000h+) 및 물리 연산·전력 병목 때문에 AGI 이후에 도달합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Three Inline Telemetry Figures with Mini Visual Progress Gauges */}
      <div className="pt-5 border-t border-base-content/10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div className="space-y-2">
          <div className="space-y-1">
            <p
              className="text-xs font-medium"
              style={{ color: "var(--label-secondary)" }}
            >
              자율 과업 지속 지평 (METR TH2)
            </p>
            <p className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-base-content">
              27.0시간{" "}
              <span className="text-xs font-semibold text-base-content/50">
                / 40h
              </span>
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-base-content/10 overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: "67.5%" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--label-secondary)" }}>
            약 3.6개월 주기로 2배 확장 중
          </p>
        </div>

        <div className="space-y-2 sm:border-s sm:border-base-content/10 sm:ps-8">
          <div className="space-y-1">
            <p
              className="text-xs font-medium"
              style={{ color: "var(--label-secondary)" }}
            >
              ARC-AGI-3 추상 추론
            </p>
            <p className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-base-content">
              81.2%{" "}
              <span className="text-xs font-semibold text-base-content/50">
                / 85%
              </span>
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-base-content/10 overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full bg-secondary" style={{ width: "81.2%" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--label-secondary)" }}>
            {liveStats
              ? `최신 arXiv 에이전트·추론 비중 ${liveStats.reasoningAndAgentPaperRatioPercent}%`
              : "표준 하네스 기준 8개월 만에 <1%→81.2%"}
          </p>
        </div>

        <div className="space-y-2 sm:border-s sm:border-base-content/10 sm:ps-8">
          <div className="space-y-1">
            <p
              className="text-xs font-medium"
              style={{ color: "var(--label-secondary)" }}
            >
              거시 고용 전환 조기경보
            </p>
            <p className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-base-content">
              8{" "}
              <span className="text-sm font-semibold text-base-content/50">
                / 12 지표
              </span>
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-base-content/10 overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: "66.7%" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--label-secondary)" }}>
            선행 8개 조기경보 도달 · 후행 4개 완충
          </p>
        </div>
      </div>

      {/* Live Polymarket Capital-Weighted Prediction Odds */}
      {predictionMarkets.length > 0 && (
        <div className="pt-5 border-t border-base-content/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-base-content">
              실시간 AI 예측 시장 합의 확률 (Polymarket)
            </span>
            <div className="flex items-center gap-3">
              <span
                className="font-mono"
                style={{ color: "var(--label-secondary)" }}
              >
                글로벌 실시간 베팅 유동성 반영
              </span>
              {predictionMarkets.length > 3 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setShowAllMarkets((prev) => !prev);
                  }}
                  className="text-xs font-semibold text-primary hover:underline pst-press"
                >
                  {showAllMarkets
                    ? "상위 3개만"
                    : `전체 ${predictionMarkets.length}개 보기`}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {predictionMarkets
              .slice(0, showAllMarkets ? predictionMarkets.length : 3)
              .map((pm) => (
              <a
                key={pm.id}
                href={pm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl material-regular hover:border-primary/40 border border-base-content/10 transition-colors flex flex-col justify-between gap-2 group"
              >
                <p className="text-xs font-semibold text-base-content leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {pm.titleKo}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                  <span className="font-extrabold text-primary">
                    YES {pm.yesProbabilityPercent.toFixed(1)}%
                  </span>
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    ${(pm.volumeUsd / 1000).toFixed(0)}K Vol
                    <IconExternalLink className="w-3 h-3 opacity-60" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
