"use client";

import React, { useEffect, useState } from "react";
import {
  BASELINE_ANCHOR_MS,
  ENSEMBLE_CLOCKS,
  type EnsembleClockSpec,
} from "@/lib/data/eventHorizonData";
import { IconChevronDown } from "@/components/ui/icons";
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
const SAFETY_BUFFER_MS = 14 * 30.4375 * 86400 * 1000;

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
}

export function HeroMultiClock({ liveStats }: HeroMultiClockProps) {
  const [nowMs, setNowMs] = useState<number>(BASELINE_ANCHOR_MS);
  const [selectedClockId, setSelectedClockId] =
    useState<EnsembleClockSpec["id"]>("agi");
  const [scenario, setScenario] = useState<ScenarioMode>("baseline");
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

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

  const getAdjustedTargetMs = (spec: EnsembleClockSpec): number => {
    if (scenario === "fast-rsi") {
      return Date.parse(spec.fastTakeoffDateIso);
    }
    const baseMs = Date.parse(spec.targetDateIso);
    if (scenario === "baseline") return baseMs;
    if (spec.id === "seed-rsi") return baseMs + SAFETY_BUFFER_MS * 0.25;
    if (spec.id === "agi") return baseMs + SAFETY_BUFFER_MS;
    if (spec.id === "rsi") return baseMs + SAFETY_BUFFER_MS * 0.85;
    return baseMs + SAFETY_BUFFER_MS * 0.75;
  };

  const activeTargetMs = getAdjustedTargetMs(selectedClock);
  const countdown = computeCountdown(activeTargetMs, nowMs);
  const nowPercent = toTimelinePercent(nowMs);

  return (
    <section
      aria-labelledby="horizon-timepiece-heading"
      className="pt-2 pb-10 border-b border-base-content/10 space-y-8"
    >
      {/* Top context bar: quiet title + 3-way scenario toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--label-secondary)" }}
          >
            가중 앙상블 중위 도달 예측
          </p>
          <h2
            id="horizon-timepiece-heading"
            className="text-base sm:text-lg font-bold tracking-tight text-base-content"
          >
            {selectedClock.koreanTitle}
          </h2>
        </div>

        <div
          role="group"
          aria-label="예측 시나리오 전환"
          className="inline-flex flex-wrap items-center p-1 rounded-2xl bg-base-200/80 border border-base-content/10 self-start sm:self-auto"
        >
          {(
            [
              { id: "fast-rsi", label: "선행 RSI 가속" },
              { id: "baseline", label: "기본 추세" },
              { id: "safety-buffer", label: "안전 완충 (+14개월)" },
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
                className={`min-h-11 px-3 rounded-xl text-xs font-semibold transition-colors pst-press ${
                  active
                    ? "bg-base-100 text-base-content shadow-xs"
                    : "text-base-content/65 hover:text-base-content"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Focal Point: Target Year/Month + Quiet Tabular Countdown */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5">
          <p className="text-4xl sm:text-6xl font-extrabold tracking-tight text-base-content tabular-nums leading-none">
            {formatKoreanYearMonth(activeTargetMs)}
          </p>
          <p
            className="text-sm sm:text-base font-mono font-semibold tabular-nums"
            style={{ color: "var(--label-secondary)" }}
          >
            잔여 {countdown.days.toLocaleString("ko-KR")}일 {countdown.hours}시간{" "}
            {countdown.minutes}분 {countdown.seconds}초
          </p>
        </div>
        <p
          className="text-sm leading-relaxed max-w-2xl"
          style={{ color: "var(--label-secondary)" }}
        >
          {selectedClock.definition}
        </p>
      </div>

      {/* Linear 2026 — 2033 Architectural Horizon Timeline */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-base-content/55">
          <span>2026</span>
          <span>2028</span>
          <span>2030</span>
          <span>2032</span>
        </div>

        <div className="relative h-2 rounded-full bg-base-content/10">
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
                    ? "w-3.5 h-3.5 bg-primary ring-4 ring-primary/20"
                    : "w-2.5 h-2.5 bg-base-content/45"
                }`}
              />
            );
          })}
        </div>

        {/* Milestone Selector Pills */}
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
                  className={`min-h-11 px-3.5 rounded-2xl text-xs font-semibold transition-colors pst-press inline-flex items-center gap-2 border ${
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

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setShowMethodology((prev) => !prev);
            }}
            aria-expanded={showMethodology}
            className="min-h-11 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 text-base-content/70 hover:text-base-content pst-press"
          >
            <span>산출 기준 · RSI 선후 분석 {showMethodology ? "접기" : "보기"}</span>
            <IconChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showMethodology ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

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

            <div className="pt-4 border-t border-base-content/10 space-y-2 text-xs leading-relaxed">
              <p className="font-bold text-base-content">
                왜 초기 RSI(Seed RSI)는 AGI보다 먼저 오고, 완전 자율 RSI(Full RSI)는 뒤에 배치되는가?
              </p>
              <p style={{ color: "var(--label-secondary)" }}>
                1. <strong className="text-base-content">Seed RSI 선행 (2026.12)</strong>: 코딩, 커널 최적화, 합성 데이터 정제, 강화학습 보상 검증(RLVR)은 정답 확인이 즉각적인 디지털 폐쇄 루프입니다. 따라서 물리·행정·대면 상식까지 요구하는 범용 AGI보다 좁은 의미의 AI 연구 자동화가 먼저 점화되어 AGI 도달을 끌어당깁니다.
              </p>
              <p style={{ color: "var(--label-secondary)" }}>
                2. <strong className="text-base-content">Full RSI 후행 (2029.12 · 가속 시 2027.11)</strong>: 반면 인간 연구자 개입 없이 신규 패러다임 아키텍처를 창안하고 수만 장 가속기 클러스터의 본학습·검증까지 과반을 단독 주도하려면 수개월 단위 연구 실패 복구 지평(1,000시간+)과 물리적 연산·전력 시간(암달의 법칙 병목)이 필요하므로 범용 AGI 이후에 도달합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Three Quiet Inline Telemetry Figures */}
      <div className="pt-6 border-t border-base-content/10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div className="space-y-1">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            자율 과업 지속 지평 (METR 50%)
          </p>
          <p className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-base-content">
            16.0시간
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--label-secondary)" }}
          >
            약 7개월 주기로 2배 확장 중
          </p>
        </div>

        <div className="space-y-1 sm:border-s sm:border-base-content/10 sm:ps-8">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            역량 대비 정렬 안전 격차
          </p>
          <p className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-base-content">
            1.76배
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--label-secondary)" }}
          >
            {liveStats
              ? `최신 arXiv 에이전트·추론 비중 ${liveStats.reasoningAndAgentPaperRatioPercent}%`
              : "역량 가속 대비 안전성 검증 후행"}
          </p>
        </div>

        <div className="space-y-1 sm:border-s sm:border-base-content/10 sm:ps-8">
          <p
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            거시 고용 전환 지수
          </p>
          <p className="text-2xl font-extrabold tracking-tight font-mono tabular-nums text-base-content">
            26.1{" "}
            <span className="text-sm font-semibold text-base-content/50">
              / 100
            </span>
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--label-secondary)" }}
          >
            12개 거시 지표 중 8개 조기경보 진입
          </p>
        </div>
      </div>
    </section>
  );
}
