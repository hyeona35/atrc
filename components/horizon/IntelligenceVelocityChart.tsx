"use client";

import React, { useMemo, useState } from "react";
import {
  AI_VELOCITY_TIMELINE,
  type AiVelocityPoint,
} from "@/lib/data/eventHorizonData";
import { triggerHaptic } from "@/lib/haptics";

export type VelocityAxisMode = "linear" | "log" | "exp" | "percent";
export type VelocitySeriesId = "metr" | "eci" | "composite";

const AXIS_OPTIONS: Array<{
  id: VelocityAxisMode;
  label: string;
  caption: string;
}> = [
  { id: "linear", label: "일반", caption: "절대 수치 선형 축 (가속 구간 체감)" },
  { id: "log", label: "로그", caption: "상용로그(log₁₀) 축 (일정한 배가 추세 확인)" },
  { id: "exp", label: "지수", caption: "2023년 GPT-4 대비 2ⁿ 배수 확장 곡선" },
  { id: "percent", label: "백분율", caption: "AGI 기준선(100%) 대비 현재 도달률" },
];

const SERIES_OPTIONS: Array<{
  id: VelocitySeriesId;
  label: string;
  shortLabel: string;
}> = [
  { id: "metr", label: "자율 과업 지평 (METR)", shortLabel: "자율 지평" },
  { id: "eci", label: "종합 역량 지수 (ECI)", shortLabel: "역량 지수" },
  { id: "composite", label: "프론티어 벤치마크 종합", shortLabel: "종합 포화도" },
];

interface PlottedPoint {
  point: AiVelocityPoint;
  x: number;
  y: number;
  rawValue: number;
  displayValue: string;
  multiplier: number;
  doublings: number;
  percentOfTarget: number;
}

interface AxisTick {
  y: number;
  label: string;
}

const CHART_W = 700;
const CHART_H = 256;
const PAD_LEFT = 64;
const PAD_RIGHT = 28;
const PAD_TOP = 26;
const PAD_BOTTOM = 40;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

function getRawValue(pt: AiVelocityPoint, series: VelocitySeriesId): number {
  if (series === "metr") return pt.metrHours;
  if (series === "eci") return pt.eciScore;
  return pt.compositePercent;
}

function getMultiplier(pt: AiVelocityPoint, series: VelocitySeriesId): number {
  if (series === "metr") return pt.metrHours / 0.1;
  if (series === "eci") return Math.pow(2, (pt.eciScore - 100) / 15);
  return pt.compositePercent / 12;
}

function getPercentOfTarget(pt: AiVelocityPoint, series: VelocitySeriesId): number {
  if (series === "metr") return Math.min(100, (pt.metrHours / 40) * 100);
  if (series === "eci") return Math.min(100, Math.max(0, ((pt.eciScore - 100) / 90) * 100));
  return Math.min(100, pt.compositePercent);
}

function formatMultiplier(m: number): string {
  if (m >= 100) return `${Math.round(m)}×`;
  if (m >= 10) return `${m.toFixed(0)}×`;
  return `${m.toFixed(1)}×`;
}

function formatDisplayValue(
  pt: AiVelocityPoint,
  series: VelocitySeriesId,
  axis: VelocityAxisMode
): string {
  if (axis === "percent") {
    const pct = getPercentOfTarget(pt, series);
    return pct < 10 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;
  }
  if (axis === "exp") {
    return formatMultiplier(getMultiplier(pt, series));
  }
  if (series === "metr") return pt.metrLabel;
  if (series === "eci") return `${pt.eciScore}`;
  return `${pt.compositePercent}%`;
}

export interface IntelligenceVelocityChartProps {
  compact?: boolean;
  onExploreModels?: () => void;
}

export function IntelligenceVelocityChart({
  compact = false,
  onExploreModels,
}: IntelligenceVelocityChartProps) {
  const [axisMode, setAxisMode] = useState<VelocityAxisMode>("log");
  const [seriesId, setSeriesId] = useState<VelocitySeriesId>("metr");
  const [selectedId, setSelectedId] = useState<string>("vel-26q4");

  const { plotted, ticks, actualPolyline, projectedSegment, areaPath, expGuidePath } =
    useMemo(() => {
      const n = AI_VELOCITY_TIMELINE.length;
      const toX = (idx: number) =>
        PAD_LEFT + (n <= 1 ? PLOT_W / 2 : (idx / (n - 1)) * PLOT_W);

      const mapValueToRatio = (pt: AiVelocityPoint): number => {
        const raw = getRawValue(pt, seriesId);
        if (axisMode === "linear") {
          if (seriesId === "metr") return raw / 40;
          if (seriesId === "eci") return (raw - 90) / 110;
          return raw / 100;
        }
        if (axisMode === "log") {
          if (seriesId === "metr") {
            const minL = Math.log10(0.08);
            const maxL = Math.log10(45);
            return (Math.log10(Math.max(0.08, raw)) - minL) / (maxL - minL);
          }
          if (seriesId === "eci") {
            const minL = Math.log10(95);
            const maxL = Math.log10(200);
            return (Math.log10(raw) - minL) / (maxL - minL);
          }
          const minL = Math.log10(10);
          const maxL = Math.log10(105);
          return (Math.log10(Math.max(10, raw)) - minL) / (maxL - minL);
        }
        if (axisMode === "exp") {
          // Plot exponential multiplier directly on a power-emphasized curve so doubling acceleration stands out
          const mult = getMultiplier(pt, seriesId);
          const maxMult =
            seriesId === "metr" ? 400 : seriesId === "eci" ? 64 : 8.5;
          // Mild gamma (0.65) keeps early multiples distinguishable while strongly visualizing exponential surge
          return Math.pow(Math.max(0, mult) / maxMult, 0.65);
        }
        // percent
        return getPercentOfTarget(pt, seriesId) / 100;
      };

      const toY = (ratio: number) => {
        const clamped = Math.min(1, Math.max(0, ratio));
        return Math.round((PAD_TOP + (1 - clamped) * PLOT_H) * 10) / 10;
      };

      const points: PlottedPoint[] = AI_VELOCITY_TIMELINE.map((pt, idx) => {
        const ratio = mapValueToRatio(pt);
        const mult = getMultiplier(pt, seriesId);
        return {
          point: pt,
          x: Math.round(toX(idx) * 10) / 10,
          y: toY(ratio),
          rawValue: getRawValue(pt, seriesId),
          displayValue: formatDisplayValue(pt, seriesId, axisMode),
          multiplier: mult,
          doublings: Math.log2(Math.max(1, mult)),
          percentOfTarget: getPercentOfTarget(pt, seriesId),
        };
      });

      const buildTicks = (): AxisTick[] => {
        if (axisMode === "percent") {
          return [0, 25, 50, 75, 100].map((v) => ({
            y: toY(v / 100),
            label: `${v}%`,
          }));
        }
        if (axisMode === "linear") {
          if (seriesId === "metr") {
            return [0, 10, 20, 30, 40].map((v) => ({
              y: toY(v / 40),
              label: `${v}h`,
            }));
          }
          if (seriesId === "eci") {
            return [100, 130, 160, 190].map((v) => ({
              y: toY((v - 90) / 110),
              label: `${v}`,
            }));
          }
          return [0, 25, 50, 75, 100].map((v) => ({
            y: toY(v / 100),
            label: `${v}%`,
          }));
        }
        if (axisMode === "log") {
          if (seriesId === "metr") {
            const minL = Math.log10(0.08);
            const maxL = Math.log10(45);
            return [
              { v: 0.1, label: "6분" },
              { v: 1, label: "1h" },
              { v: 10, label: "10h" },
              { v: 40, label: "40h" },
            ].map((item) => ({
              y: toY((Math.log10(item.v) - minL) / (maxL - minL)),
              label: item.label,
            }));
          }
          if (seriesId === "eci") {
            const minL = Math.log10(95);
            const maxL = Math.log10(200);
            return [100, 125, 155, 190].map((v) => ({
              y: toY((Math.log10(v) - minL) / (maxL - minL)),
              label: `${v}`,
            }));
          }
          const minL = Math.log10(10);
          const maxL = Math.log10(105);
          return [10, 25, 50, 100].map((v) => ({
            y: toY((Math.log10(v) - minL) / (maxL - minL)),
            label: `${v}%`,
          }));
        }
        // exp mode ticks
        const maxMult =
          seriesId === "metr" ? 400 : seriesId === "eci" ? 64 : 8.5;
        const rawTicks =
          seriesId === "metr"
            ? [
                { v: 1, label: "1× (2⁰)" },
                { v: 32, label: "32× (2⁵)" },
                { v: 128, label: "128× (2⁷)" },
                { v: 256, label: "256× (2⁸)" },
                { v: 400, label: "400×" },
              ]
            : seriesId === "eci"
            ? [
                { v: 1, label: "1× (2⁰)" },
                { v: 8, label: "8× (2³)" },
                { v: 32, label: "32× (2⁵)" },
                { v: 64, label: "64× (2⁶)" },
              ]
            : [
                { v: 1, label: "1×" },
                { v: 3, label: "3×" },
                { v: 6, label: "6×" },
                { v: 8.3, label: "8.3×" },
              ];
        return rawTicks.map((t) => ({
          y: toY(Math.pow(t.v / maxMult, 0.65)),
          label: t.label,
        }));
      };

      const actualPts = points.filter((p) => !p.point.isProjected);
      const projectedPt = points.find((p) => p.point.isProjected);
      const lastActual = actualPts[actualPts.length - 1];

      const actualPoly = actualPts.map((p) => `${p.x},${p.y}`).join(" ");
      const projSeg =
        lastActual && projectedPt
          ? `${lastActual.x},${lastActual.y} ${projectedPt.x},${projectedPt.y}`
          : "";

      const bottomY = PAD_TOP + PLOT_H;
      const area =
        actualPts.length > 1
          ? `M ${actualPts[0]!.x} ${bottomY} L ${actualPts
              .map((p) => `${p.x} ${p.y}`)
              .join(" L ")} L ${lastActual!.x} ${bottomY} Z`
          : "";

      // Smooth theoretical exponential trend guide for exp mode
      let guide = "";
      if (axisMode === "exp" && points.length > 2) {
        const samples = 24;
        const maxMult =
          seriesId === "metr" ? 400 : seriesId === "eci" ? 64 : 8.5;
        const coords: string[] = [];
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const x = PAD_LEFT + t * PLOT_W;
          const mult = Math.pow(maxMult, t);
          const y = toY(Math.pow(mult / maxMult, 0.65));
          coords.push(`${Math.round(x * 10) / 10},${y}`);
        }
        guide = coords.join(" ");
      }

      return {
        plotted: points,
        ticks: buildTicks(),
        actualPolyline: actualPoly,
        projectedSegment: projSeg,
        areaPath: area,
        expGuidePath: guide,
      };
    }, [axisMode, seriesId]);

  const activePoint =
    plotted.find((p) => p.point.id === selectedId) ?? plotted[plotted.length - 2]!;
  const activeAxisMeta =
    AXIS_OPTIONS.find((a) => a.id === axisMode) ?? AXIS_OPTIONS[0]!;

  return (
    <section
      aria-labelledby="ai-velocity-heading"
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="ai-velocity-heading"
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content"
          >
            AI 지능 발전 속도
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--label-secondary)" }}
          >
            {activeAxisMeta.caption}
          </p>
        </div>

        {/* 4-Way Axis Scale Switcher: 일반 / 로그 / 지수 / 백분율 */}
        <div
          role="group"
          aria-label="그래프 Y축 스케일 전환"
          className="inline-flex items-center p-1 rounded-2xl bg-base-200/80 border border-base-content/10 self-start sm:self-auto"
        >
          {AXIS_OPTIONS.map((opt) => {
            const active = axisMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  triggerHaptic("selection");
                  setAxisMode(opt.id);
                }}
                className={`min-h-11 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-colors pst-press cursor-pointer ${
                  active
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-7 rounded-3xl material-regular border border-base-content/8 space-y-5">
        {/* Series Switcher + Current Velocity Highlight */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="측정 지표 계열 선택"
            className="flex flex-wrap items-center gap-1.5"
          >
            {SERIES_OPTIONS.map((s) => {
              const active = seriesId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    triggerHaptic("light");
                    setSeriesId(s.id);
                  }}
                  className={`min-h-9 px-3 rounded-xl text-xs font-semibold transition-colors pst-press cursor-pointer border ${
                    active
                      ? "bg-base-100 border-primary/45 text-base-content shadow-xs"
                      : "bg-transparent border-base-content/10 text-base-content/65 hover:text-base-content"
                  }`}
                >
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-bold text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
              배가 주기 약 3.6개월
            </span>
            <span style={{ color: "var(--label-secondary)" }}>
              2023 대비 {formatMultiplier(plotted[plotted.length - 2]!.multiplier)}
            </span>
          </div>
        </div>

        {/* Interactive Responsive SVG Graph */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            role="img"
            aria-label={`AI 지능 발전 속도 그래프 (${activeAxisMeta.label} 축, ${
              SERIES_OPTIONS.find((s) => s.id === seriesId)?.label
            })`}
            className="w-full min-w-[520px] h-auto select-none"
          >
            {/* Horizontal Gridlines & Dynamic Y-Axis Labels */}
            {ticks.map((tick, i) => (
              <g key={`${axisMode}-${seriesId}-${i}`}>
                <line
                  x1={PAD_LEFT}
                  y1={tick.y}
                  x2={CHART_W - PAD_RIGHT}
                  y2={tick.y}
                  stroke="currentColor"
                  strokeOpacity={i === ticks.length - 1 ? 0.16 : 0.08}
                  strokeDasharray={i === ticks.length - 1 ? "4 4" : "2 4"}
                />
                <text
                  x={PAD_LEFT - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  fill="currentColor"
                  opacity="0.6"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Subtle filled area under realized trajectory */}
            {areaPath && (
              <path
                d={areaPath}
                fill="var(--color-primary)"
                fillOpacity="0.10"
              />
            )}

            {/* Theoretical exponential reference curve in exp mode */}
            {expGuidePath && (
              <polyline
                fill="none"
                stroke="var(--color-secondary)"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                strokeOpacity="0.5"
                points={expGuidePath}
              />
            )}

            {/* Realized Velocity Curve */}
            <polyline
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={actualPolyline}
            />

            {/* Dashed Extrapolation to AGI Baseline */}
            {projectedSegment && (
              <polyline
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.25"
                strokeDasharray="5 5"
                strokeOpacity="0.65"
                strokeLinecap="round"
                points={projectedSegment}
              />
            )}

            {/* Interactive Milestone Nodes */}
            {plotted.map((item) => {
              const isSelected = item.point.id === activePoint.point.id;
              const isProj = Boolean(item.point.isProjected);
              return (
                <g
                  key={item.point.id}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedId(item.point.id);
                  }}
                  className="cursor-pointer"
                >
                  {/* Large invisible hit target for easy touch selection */}
                  <circle cx={item.x} cy={item.y} r="18" fill="transparent" />

                  {isSelected && (
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r="11"
                      fill="var(--color-primary)"
                      fillOpacity="0.18"
                    />
                  )}

                  <circle
                    cx={item.x}
                    cy={item.y}
                    r={isSelected ? 6 : 4.5}
                    fill={isProj ? "var(--color-base-100)" : "var(--color-primary)"}
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                  />

                  <text
                    x={item.x}
                    y={Math.max(14, item.y - 12)}
                    textAnchor="middle"
                    fontSize={isSelected ? "12" : "11"}
                    fontWeight="700"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                    fill={isSelected ? "var(--color-primary)" : "currentColor"}
                    opacity={isSelected ? 1 : 0.85}
                  >
                    {item.displayValue}
                  </text>

                  <text
                    x={item.x}
                    y={CHART_H - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isSelected ? "700" : "500"}
                    fill="currentColor"
                    opacity={isSelected ? 0.95 : 0.58}
                  >
                    {item.point.period}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Checkpoint Detail Bar */}
        <div className="p-4 rounded-2xl bg-base-200/50 border border-base-content/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-primary">
                {activePoint.point.period}
              </span>
              <span className="font-bold text-base-content">
                {activePoint.point.model}
              </span>
              {activePoint.point.isProjected && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/12 text-primary">
                  외삽 기준선
                </span>
              )}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--label-secondary)" }}
            >
              {activePoint.point.note}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 shrink-0 font-mono text-xs tabular-nums">
            <div className="text-start sm:text-end">
              <p className="text-[10px]" style={{ color: "var(--label-secondary)" }}>
                2023 대비 배수
              </p>
              <p className="font-bold text-base-content">
                {formatMultiplier(activePoint.multiplier)} (2^{activePoint.doublings.toFixed(1)})
              </p>
            </div>
            <div className="text-start sm:text-end border-s border-base-content/12 ps-3 sm:ps-4">
              <p className="text-[10px]" style={{ color: "var(--label-secondary)" }}>
                AGI 기준선 도달률
              </p>
              <p className="font-bold text-primary">
                {activePoint.percentOfTarget < 10
                  ? `${activePoint.percentOfTarget.toFixed(1)}%`
                  : `${Math.round(activePoint.percentOfTarget)}%`}
              </p>
            </div>
          </div>
        </div>

        {compact && onExploreModels && (
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <span style={{ color: "var(--label-secondary)" }}>
              각 시점 점을 눌러 모델별 배가 속도와 기준선 도달률을 확인할 수 있습니다.
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onExploreModels();
              }}
              className="font-semibold text-primary hover:underline shrink-0 pst-press cursor-pointer"
            >
              벤치마크 · 모델 상세 보기 →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
