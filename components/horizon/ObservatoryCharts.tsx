"use client";

import React, { useMemo, useState } from "react";
import {
  CORE_BENCHMARKS,
  MACRO_12_INDICATORS,
  type MacroIndicatorItem,
} from "@/lib/data/eventHorizonData";
import { triggerHaptic } from "@/lib/haptics";

/* -------------------------------------------------------------------------- */
/* 1. Frontier Benchmark Observatory Graph (Bar vs 6-Axis Radar Profile)      */
/* -------------------------------------------------------------------------- */

const RADAR_SIZE = 300;
const RADAR_CX = RADAR_SIZE / 2;
const RADAR_CY = RADAR_SIZE / 2;
const RADAR_MAX_R = 104;

export function BenchmarkObservatoryChart() {
  const [chartType, setChartType] = useState<"bar" | "radar">("bar");
  const [selectedId, setSelectedId] = useState<string>(CORE_BENCHMARKS[0]!.id);

  const selected =
    CORE_BENCHMARKS.find((b) => b.id === selectedId) ?? CORE_BENCHMARKS[0]!;
  const jumpDelta = selected.scorePercent - selected.previousScorePercent;

  const radarSize = RADAR_SIZE;
  const cx = RADAR_CX;
  const cy = RADAR_CY;
  const maxR = RADAR_MAX_R;

  const radarData = useMemo(() => {
    const count = CORE_BENCHMARKS.length;
    const toCoord = (idx: number, pct: number) => {
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
      const r = (Math.min(100, Math.max(0, pct)) / 100) * RADAR_MAX_R;
      return {
        x: Math.round((RADAR_CX + r * Math.cos(angle)) * 10) / 10,
        y: Math.round((RADAR_CY + r * Math.sin(angle)) * 10) / 10,
        labelX: Math.round((RADAR_CX + (RADAR_MAX_R + 24) * Math.cos(angle)) * 10) / 10,
        labelY: Math.round((RADAR_CY + (RADAR_MAX_R + 24) * Math.sin(angle)) * 10) / 10,
      };
    };

    const currentPts = CORE_BENCHMARKS.map((b, i) => ({
      item: b,
      ...toCoord(i, b.scorePercent),
    }));
    const prevPts = CORE_BENCHMARKS.map((b, i) => toCoord(i, b.previousScorePercent));
    const threshPts = CORE_BENCHMARKS.map((b, i) => toCoord(i, b.thresholdPercent));

    return {
      currentPts,
      currentPoly: currentPts.map((p) => `${p.x},${p.y}`).join(" "),
      prevPoly: prevPts.map((p) => `${p.x},${p.y}`).join(" "),
      threshPoly: threshPts.map((p) => `${p.x},${p.y}`).join(" "),
    };
  }, []);

  return (
    <div className="p-5 sm:p-6 rounded-3xl material-regular border border-base-content/8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-base-content">
            추론 벤치마크 1년 도약 및 임계치 그래프
          </p>
          <p className="text-xs" style={{ color: "var(--label-secondary)" }}>
            2025년 기준선 대비 현재 SOTA 상승폭과 포화 임계치를 시각적으로 대조합니다.
          </p>
        </div>

        <div
          role="group"
          aria-label="벤치마크 그래프 유형 전환"
          className="inline-flex items-center p-1 rounded-2xl bg-base-200/80 border border-base-content/10"
        >
          {(
            [
              { id: "bar", label: "막대 대조" },
              { id: "radar", label: "레이더" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={chartType === opt.id}
              onClick={() => {
                triggerHaptic("selection");
                setChartType(opt.id);
              }}
              className={`min-h-9 px-3 rounded-xl text-xs font-semibold transition-colors pst-press cursor-pointer ${
                chartType === opt.id
                  ? "bg-base-100 text-base-content shadow-xs"
                  : "text-base-content/65 hover:text-base-content"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {chartType === "bar" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-[11px]" style={{ color: "var(--label-secondary)" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              현재 SOTA (2026.11)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-base-content/25" />
              이전 기준선 (2025)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-0.5 h-3 bg-base-content/65" />
              포화 임계치
            </span>
          </div>

          <div className="space-y-2.5">
            {CORE_BENCHMARKS.map((b) => {
              const isSelected = b.id === selected.id;
              const delta = b.scorePercent - b.previousScorePercent;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedId(b.id);
                  }}
                  className={`w-full text-start p-3 rounded-2xl transition-colors cursor-pointer border ${
                    isSelected
                      ? "bg-base-200/65 border-primary/40"
                      : "bg-transparent border-base-content/8 hover:bg-base-200/35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-bold text-base-content truncate">
                      {b.name}
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      <span className="text-base-content/50 me-1.5">
                        {b.previousScorePercent.toFixed(1)}% →
                      </span>
                      <span className="font-extrabold text-primary">
                        {b.scorePercent.toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-success font-semibold ms-1.5">
                        +{delta.toFixed(1)}p
                      </span>
                    </span>
                  </div>

                  {/* Layered Comparison Track */}
                  <div className="relative h-3 rounded-full bg-base-content/10 overflow-visible">
                    {/* Current SOTA Bar */}
                    <div
                      className="absolute inset-y-0 start-0 rounded-full bg-primary/85 transition-all duration-500"
                      style={{ width: `${Math.min(100, b.scorePercent)}%` }}
                    />
                    {/* Previous Baseline Bar Overlay */}
                    <div
                      className="absolute inset-y-0 start-0 rounded-full bg-base-content/30 transition-all duration-500"
                      style={{ width: `${Math.min(100, b.previousScorePercent)}%` }}
                    />
                    {/* Saturation Threshold Marker */}
                    <span
                      title={`임계치 ${b.thresholdPercent}%`}
                      style={{ left: `${Math.min(99, b.thresholdPercent)}%` }}
                      className="absolute -top-1 -bottom-1 w-0.5 bg-base-content/75 rounded-full"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 items-center">
          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${radarSize} ${radarSize}`}
              role="img"
              aria-label="핵심 추론 벤치마크 6축 레이더 프로파일"
              className="w-full max-w-[300px] h-auto select-none"
            >
              {/* Concentric rings 25%, 50%, 75%, 100% */}
              {[25, 50, 75, 100].map((pct) => (
                <circle
                  key={pct}
                  cx={cx}
                  cy={cy}
                  r={(pct / 100) * maxR}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray={pct === 100 ? undefined : "2 3"}
                />
              ))}

              {/* Axis Spokes */}
              {radarData.currentPts.map((pt, i) => {
                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / CORE_BENCHMARKS.length;
                return (
                  <line
                    key={pt.item.id}
                    x1={cx}
                    y1={cy}
                    x2={cx + maxR * Math.cos(angle)}
                    y2={cy + maxR * Math.sin(angle)}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                  />
                );
              })}

              {/* Threshold Polygon */}
              <polygon
                points={radarData.threshPoly}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.32"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* 2025 Previous Polygon */}
              <polygon
                points={radarData.prevPoly}
                fill="currentColor"
                fillOpacity="0.10"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeWidth="1.5"
              />

              {/* Current SOTA Polygon */}
              <polygon
                points={radarData.currentPoly}
                fill="var(--color-primary)"
                fillOpacity="0.22"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
              />

              {/* Interactive Vertices & Labels */}
              {radarData.currentPts.map((pt) => {
                const isSelected = pt.item.id === selected.id;
                const shortName = pt.item.name
                  .replace(" (Tiers 1–3)", "")
                  .replace("Humanity's Last Exam", "HLE")
                  .replace("SWE-Bench Verified", "SWE-Bench");
                return (
                  <g
                    key={pt.item.id}
                    onClick={() => {
                      triggerHaptic("light");
                      setSelectedId(pt.item.id);
                    }}
                    className="cursor-pointer"
                  >
                    <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5.5 : 3.8}
                      fill="var(--color-primary)"
                      stroke="var(--color-base-100)"
                      strokeWidth="1.8"
                    />
                    <text
                      x={pt.labelX}
                      y={pt.labelY + 3}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isSelected ? "800" : "600"}
                      fill={isSelected ? "var(--color-primary)" : "currentColor"}
                      opacity={isSelected ? 1 : 0.72}
                    >
                      {shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-content/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-base-content">
                {selected.name}
              </span>
              <span className="font-mono font-extrabold text-primary tabular-nums">
                {selected.scorePercent.toFixed(1)}%
              </span>
            </div>
            <p style={{ color: "var(--label-secondary)" }}>{selected.domain}</p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono tabular-nums">
              <div className="p-2.5 rounded-xl bg-base-100/80 border border-base-content/8">
                <p className="text-[10px]" style={{ color: "var(--label-secondary)" }}>
                  이전 기준
                </p>
                <p className="font-bold text-base-content">
                  {selected.previousScorePercent.toFixed(1)}%
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-base-100/80 border border-base-content/8">
                <p className="text-[10px]" style={{ color: "var(--label-secondary)" }}>
                  상승폭
                </p>
                <p className="font-bold text-success">+{jumpDelta.toFixed(1)}p</p>
              </div>
              <div className="p-2.5 rounded-xl bg-base-100/80 border border-base-content/8">
                <p className="text-[10px]" style={{ color: "var(--label-secondary)" }}>
                  임계치
                </p>
                <p className="font-bold text-base-content">
                  {selected.thresholdPercent}%
                </p>
              </div>
            </div>
            <p className="leading-relaxed" style={{ color: "var(--label-secondary)" }}>
              {selected.note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Macroeconomic 12-Indicator Observatory Graph                            */
/* -------------------------------------------------------------------------- */

const DOMAIN_META: Array<{
  domain: MacroIndicatorItem["domain"];
  shortLabel: string;
}> = [
  { domain: "설비투자 및 연산 인프라", shortLabel: "설비 · 연산" },
  { domain: "생산성 및 자본 대체", shortLabel: "생산성 · 대체" },
  { domain: "청년 지식고용 선행 지표", shortLabel: "청년 고용" },
  { domain: "총고용 및 분배 후행 지표", shortLabel: "총고용 · 분배" },
];

export interface MacroIndicatorsChartProps {
  selectedIndicatorId: string | null;
  onSelectIndicator: (id: string) => void;
}

export function MacroIndicatorsChart({
  selectedIndicatorId,
  onSelectIndicator,
}: MacroIndicatorsChartProps) {
  const [viewMode, setViewMode] = useState<"indicators" | "domains">("domains");

  const domainSummaries = useMemo(
    () =>
      DOMAIN_META.map((meta) => {
        const items = MACRO_12_INDICATORS.filter((i) => i.domain === meta.domain);
        const avgProgress = Math.round(
          items.reduce((sum, i) => sum + i.progressPercent, 0) / Math.max(1, items.length)
        );
        const avgEarly = Math.round(
          items.reduce((sum, i) => sum + i.earlyWarningPercent, 0) /
            Math.max(1, items.length)
        );
        const earlyCount = items.filter((i) => i.stage === "조기경보 도달").length;
        return {
          ...meta,
          items,
          avgProgress,
          avgEarly,
          earlyCount,
        };
      }),
    []
  );

  return (
    <div className="p-5 sm:p-6 rounded-3xl material-regular border border-base-content/8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-bold text-base-content">
            관측 지표 전환 진행률 그래프
          </p>
          <p className="text-xs" style={{ color: "var(--label-secondary)" }}>
            선행 설비투자에서 후행 총고용·분배로 전파되는 파급 강도와 조기경보 임계선을 시각화합니다.
          </p>
        </div>

        <div
          role="group"
          aria-label="거시 관측 그래프 보기 전환"
          className="inline-flex items-center p-1 rounded-2xl bg-base-200/80 border border-base-content/10"
        >
          {(
            [
              { id: "domains", label: "4대 영역 파급" },
              { id: "indicators", label: "12개 전체" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={viewMode === opt.id}
              onClick={() => {
                triggerHaptic("selection");
                setViewMode(opt.id);
              }}
              className={`min-h-9 px-3 rounded-xl text-xs font-semibold transition-colors pst-press cursor-pointer ${
                viewMode === opt.id
                  ? "bg-base-100 text-base-content shadow-xs"
                  : "text-base-content/65 hover:text-base-content"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "domains" ? (
        <div className="space-y-4">
          {/* Clean SVG Vertical Bar Chart across the 4 macro propagation stages */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 640 205"
              role="img"
              aria-label="설비투자에서 총고용으로 이어지는 4대 거시 전환 영역별 평균 진행률 그래프"
              className="w-full min-w-[440px] h-auto select-none"
            >
              {[0, 25, 50, 75, 100].map((pct) => {
                const y = 160 - (pct / 100) * 132;
                return (
                  <g key={pct}>
                    <line
                      x1="44"
                      y1={y}
                      x2="616"
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.09"
                      strokeDasharray="2 4"
                    />
                    <text
                      x="36"
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10.5"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fill="currentColor"
                      opacity="0.55"
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}

              {domainSummaries.map((d, idx) => {
                const colW = 136;
                const xCenter = 114 + idx * colW;
                const barW = 54;
                const barH = (d.avgProgress / 100) * 132;
                const barY = 160 - barH;
                const earlyY = 160 - (d.avgEarly / 100) * 132;
                const isHot = d.earlyCount >= 2;
                return (
                  <g key={d.domain}>
                    <rect
                      x={xCenter - barW / 2}
                      y={barY}
                      width={barW}
                      height={Math.max(4, barH)}
                      rx="10"
                      fill={isHot ? "var(--color-primary)" : "var(--color-secondary)"}
                      fillOpacity={isHot ? 0.85 : 0.6}
                    />
                    {/* Early-warning reference marker */}
                    <line
                      x1={xCenter - barW / 2 - 8}
                      y1={earlyY}
                      x2={xCenter + barW / 2 + 8}
                      y2={earlyY}
                      stroke="currentColor"
                      strokeOpacity="0.7"
                      strokeWidth="1.8"
                      strokeDasharray="3 2"
                    />
                    <text
                      x={xCenter}
                      y={barY - 8}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="800"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                      fill="currentColor"
                    >
                      {d.avgProgress}%
                    </text>
                    <text
                      x={xCenter}
                      y="180"
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight="700"
                      fill="currentColor"
                    >
                      {d.shortLabel}
                    </text>
                    <text
                      x={xCenter}
                      y="196"
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      opacity="0.58"
                    >
                      경보 {d.earlyCount}/{d.items.length}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-xs" style={{ color: "var(--label-secondary)" }}>
            점선 표식은 각 영역의 평균 조기경보 임계치입니다. 선행 지표(설비·생산성·청년고용)는 임계치를 돌파했으나 후행 총고용·분배 지표는 아직 완충 구간에 머물러 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="flex flex-wrap items-center gap-4 text-[11px] pb-1"
            style={{ color: "var(--label-secondary)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              조기경보 도달
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
              관측 진행
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-base-content/30" />
              후행 완충
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-0.5 h-3 bg-base-content/75" />
              조기경보 기준선
            </span>
          </div>

          {MACRO_12_INDICATORS.map((item) => {
            const isSelected = selectedIndicatorId === item.id;
            const barColor =
              item.stage === "조기경보 도달"
                ? "bg-primary"
                : item.stage === "관측 진행"
                ? "bg-secondary"
                : "bg-base-content/35";
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  onSelectIndicator(item.id);
                }}
                className={`w-full text-start px-3 py-2.5 rounded-2xl transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-base-200/65 border-primary/40"
                    : "border-transparent hover:bg-base-200/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <span className="font-semibold text-base-content truncate">
                    {item.name}
                  </span>
                  <span className="font-mono font-bold tabular-nums shrink-0 text-base-content">
                    {item.currentDelta}
                    <span className="text-[11px] font-normal opacity-55 ms-1.5">
                      ({item.progressPercent}%)
                    </span>
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-base-content/10">
                  <div
                    className={`absolute inset-y-0 start-0 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, item.progressPercent)}%` }}
                  />
                  <span
                    title={`조기경보 임계치 (${item.earlyWarningPercent}%)`}
                    style={{ left: `${Math.min(98, item.earlyWarningPercent)}%` }}
                    className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-base-content/80 rounded-full"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
