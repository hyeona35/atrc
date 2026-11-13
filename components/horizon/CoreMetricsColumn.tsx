"use client";

import React, { useMemo, useState } from "react";
import type { LiveFrontierModel } from "@/lib/server/liveIntel";
import {
  AUDIT_CHANGELOG,
  CORE_BENCHMARKS,
  FUTURE_MILESTONES,
  MACRO_12_INDICATORS,
  METR_TRAJECTORY_POINTS,
  type MacroIndicatorItem,
} from "@/lib/data/eventHorizonData";
import { TextField } from "@/components/ui";
import { IconChevronDown, IconChevronRight, IconSliders } from "@/components/ui/icons";
import { triggerHaptic } from "@/lib/haptics";

function parseUsdPrice(label: string): number | null {
  if (label === "무료") return 0;
  if (!label.startsWith("$")) return null;
  const num = Number.parseFloat(label.slice(1));
  return Number.isFinite(num) ? num : null;
}

const TOKEN_WORKLOAD_PRESETS = [
  { id: "light", label: "경량 (5M / 1M)", inM: 5, outM: 1 },
  { id: "coding", label: "코딩 에이전트 (25M / 5M)", inM: 25, outM: 5 },
  { id: "research", label: "대규모 연구 (100M / 20M)", inM: 100, outM: 20 },
] as const;

function formatContextWindow(tokens: number): string {
  if (!tokens || tokens <= 0) return "-";
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  return `${Math.round(tokens / 1000)}K`;
}

function formatShortDate(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "-";
  const d = new Date(parsed);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

export interface FrontierModelsSectionProps {
  liveModels: LiveFrontierModel[];
  isLoading: boolean;
  compactPreview?: boolean;
  onViewAllModels?: () => void;
}

export function FrontierModelsSection({
  liveModels,
  isLoading,
  compactPreview = false,
  onViewAllModels,
}: FrontierModelsSectionProps) {
  const [providerFilter, setProviderFilter] = useState<string>("전체");
  const [weightFilter, setWeightFilter] = useState<"all" | "open" | "closed">("all");
  const [modelSearch, setModelSearch] = useState<string>("");
  const [showCostEstimator, setShowCostEstimator] = useState<boolean>(false);
  const [inputMillion, setInputMillion] = useState<number>(25);
  const [outputMillion, setOutputMillion] = useState<number>(5);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  const toggleCompareModel = (id: string) => {
    triggerHaptic("selection");
    setComparedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const comparedModels = useMemo(
    () => liveModels.filter((m) => comparedIds.includes(m.id)),
    [liveModels, comparedIds]
  );

  const providers = useMemo(() => {
    const uniq = Array.from(new Set(liveModels.map((m) => m.provider)));
    return ["전체", ...uniq];
  }, [liveModels]);

  const displayedModels = useMemo(() => {
    if (compactPreview) return liveModels.slice(0, 5);
    const q = modelSearch.trim().toLowerCase();
    return liveModels
      .filter((m) => {
        if (providerFilter !== "전체" && m.provider !== providerFilter) return false;
        if (weightFilter === "open" && !m.isOpenWeight) return false;
        if (weightFilter === "closed" && m.isOpenWeight) return false;
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [compactPreview, liveModels, providerFilter, weightFilter, modelSearch]);

  return (
    <section
      aria-labelledby={
        compactPreview ? "models-preview-heading" : "models-full-heading"
      }
      className="space-y-12"
    >
      {/* 1. Live Frontier Model Registry (Auto-Updated via OpenRouter API) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <h2
              id={
                compactPreview
                  ? "models-preview-heading"
                  : "models-full-heading"
              }
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content"
            >
              실시간 프론티어 모델 레지스트리
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--label-secondary)" }}
            >
              글로벌 API 레지스트리에서 신규 등록된 주요 모델의 컨텍스트 길이와 추론 단가를 자동 추적합니다.
            </p>
          </div>

          {compactPreview && onViewAllModels ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onViewAllModels();
              }}
              className="min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 text-base-content/80 hover:text-base-content hover:bg-base-content/5 shrink-0 self-start sm:self-auto pst-press"
            >
              <span>모델 및 벤치마크 전체 보기</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              aria-expanded={showCostEstimator}
              onClick={() => {
                triggerHaptic("light");
                setShowCostEstimator((prev) => !prev);
              }}
              className={`min-h-11 px-3.5 rounded-2xl text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors shrink-0 self-start sm:self-auto pst-press ${
                showCostEstimator
                  ? "bg-primary text-primary-content border-primary"
                  : "border-base-content/15 text-base-content hover:bg-base-content/5"
              }`}
            >
              <IconSliders className="w-3.5 h-3.5" />
              <span>월간 추론 비용 시뮬레이터</span>
            </button>
          )}
        </div>

        {!compactPreview && (
          <div className="p-5 rounded-3xl material-regular space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {providers.map((prov) => {
                  const active = providerFilter === prov;
                  return (
                    <button
                      key={prov}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        triggerHaptic("selection");
                        setProviderFilter(prov);
                      }}
                      className={`min-h-11 px-3 rounded-2xl text-xs font-semibold transition-colors pst-press ${
                        active
                          ? "bg-primary text-primary-content"
                          : "bg-base-100 text-base-content/75 hover:text-base-content border border-base-content/10"
                      }`}
                    >
                      {prov}
                    </button>
                  );
                })}
              </div>

              <div
                role="group"
                aria-label="가중치 공개 유형"
                className="inline-flex items-center p-1 rounded-2xl bg-base-200/80 border border-base-content/10 self-start sm:self-auto"
              >
                {(
                  [
                    { id: "all", label: "전체" },
                    { id: "closed", label: "프론티어 API" },
                    { id: "open", label: "오픈웨이트" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={weightFilter === opt.id}
                    onClick={() => {
                      triggerHaptic("selection");
                      setWeightFilter(opt.id);
                    }}
                    className={`min-h-9 px-2.5 rounded-xl text-[11px] font-semibold transition-colors pst-press ${
                      weightFilter === opt.id
                        ? "bg-base-100 text-base-content shadow-xs"
                        : "text-base-content/65 hover:text-base-content"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <TextField
              label="모델 검색"
              value={modelSearch}
              onChange={setModelSearch}
              inputMode="search"
              placeholder="모델명 또는 ID로 필터링 (예: Claude, GPT, DeepSeek)"
            />

            {showCostEstimator && (
              <div className="pt-4 border-t border-base-content/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-base-content">
                    워크로드 기준 월간 API 예상 비용 ({inputMillion}M 입력 + {outputMillion}M 출력)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {TOKEN_WORKLOAD_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic("selection");
                          setInputMillion(preset.inM);
                          setOutputMillion(preset.outM);
                        }}
                        className="min-h-9 px-2.5 rounded-xl text-[11px] font-semibold bg-base-200 hover:bg-base-300 text-base-content transition-colors pst-press"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="est-input-m" style={{ color: "var(--label-secondary)" }}>
                        월 입력 토큰량
                      </label>
                      <span className="font-mono font-bold text-base-content">{inputMillion}M</span>
                    </div>
                    <input
                      id="est-input-m"
                      type="range"
                      min={1}
                      max={200}
                      step={1}
                      value={inputMillion}
                      onChange={(e) => setInputMillion(Number.parseInt(e.target.value, 10))}
                      className="range range-xs range-primary w-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="est-output-m" style={{ color: "var(--label-secondary)" }}>
                        월 출력(추론) 토큰량
                      </label>
                      <span className="font-mono font-bold text-base-content">{outputMillion}M</span>
                    </div>
                    <input
                      id="est-output-m"
                      type="range"
                      min={1}
                      max={60}
                      step={1}
                      value={outputMillion}
                      onChange={(e) => setOutputMillion(Number.parseInt(e.target.value, 10))}
                      className="range range-xs range-secondary w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl material-regular overflow-hidden">
          {isLoading && displayedModels.length === 0 ? (
            <div
              aria-busy="true"
              aria-label="프론티어 모델 목록 불러오는 중"
              className="divide-y divide-base-content/10"
            >
              {Array.from({ length: compactPreview ? 4 : 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse"
                >
                  <div className="h-4 w-48 rounded bg-base-content/15" />
                  <div className="h-4 w-28 rounded bg-base-content/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead>
                  <tr className="border-b border-base-content/10 text-xs text-base-content/60">
                    <th className="py-3.5 px-6 text-start font-semibold">모델</th>
                    <th className="py-3.5 px-4 text-start font-semibold">기관</th>
                    <th className="py-3.5 px-4 text-end font-semibold">컨텍스트</th>
                    <th className="py-3.5 px-4 text-end font-semibold">
                      단가 (입력 / 출력, 1M 토큰)
                    </th>
                    {showCostEstimator && !compactPreview && (
                      <th className="py-3.5 px-4 text-end font-semibold text-primary">
                        월 예상 비용
                      </th>
                    )}
                    <th className="py-3.5 px-6 text-end font-semibold">등록일</th>
                    {!compactPreview && (
                      <th className="py-3.5 pe-5 text-end font-semibold">비교</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/8">
                  {displayedModels.map((model) => {
                    const pIn = parseUsdPrice(model.promptPricePerMillion);
                    const pOut = parseUsdPrice(model.completionPricePerMillion);
                    const monthlyEst =
                      pIn !== null && pOut !== null
                        ? pIn * inputMillion + pOut * outputMillion
                        : null;
                    const isCompared = comparedIds.includes(model.id);

                    return (
                      <tr
                        key={model.id}
                        className="hover:bg-base-content/[0.02] transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-base-content">
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {model.isOpenWeight && !compactPreview && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/15 text-secondary">
                                OSS
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="py-4 px-4 whitespace-nowrap text-xs font-medium"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {model.provider}
                        </td>
                        <td className="py-4 px-4 text-end font-mono text-xs tabular-nums text-base-content">
                          {formatContextWindow(model.contextLength)}
                        </td>
                        <td
                          className="py-4 px-4 text-end font-mono text-xs tabular-nums whitespace-nowrap"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {model.promptPricePerMillion} / {model.completionPricePerMillion}
                        </td>
                        {showCostEstimator && !compactPreview && (
                          <td className="py-4 px-4 text-end font-mono text-xs font-bold tabular-nums text-primary whitespace-nowrap">
                            {monthlyEst !== null ? `$${monthlyEst.toFixed(2)}` : "-"}
                          </td>
                        )}
                        <td
                          className="py-4 px-6 text-end font-mono text-xs tabular-nums whitespace-nowrap"
                          style={{ color: "var(--label-secondary)" }}
                        >
                          {formatShortDate(model.releasedIso)}
                        </td>
                        {!compactPreview && (
                          <td className="py-3 pe-5 text-end">
                            <button
                              type="button"
                              aria-pressed={isCompared}
                              onClick={() => toggleCompareModel(model.id)}
                              className={`min-h-9 px-2.5 rounded-xl text-[11px] font-semibold border transition-colors pst-press ${
                                isCompared
                                  ? "bg-primary text-primary-content border-primary"
                                  : "border-base-content/15 text-base-content/75 hover:text-base-content"
                              }`}
                            >
                              {isCompared ? "선택됨" : "+ 비교"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison Matrix (When 2-3 Models Selected) */}
        {!compactPreview && comparedModels.length >= 2 && (
          <div className="p-5 sm:p-6 rounded-3xl material-regular space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-base-content">
                  선택 모델 나란히 비교 ({comparedModels.length}/3)
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--label-secondary)" }}
                >
                  동일 예산($100, 입력:출력 5:1 작업 기준)에서의 처리 가능량과 컨텍스트 창 비교입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setComparedIds([]);
                }}
                className="min-h-9 px-2.5 rounded-xl text-xs font-semibold text-base-content/70 hover:text-base-content pst-press"
              >
                비교 초기화
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {comparedModels.map((m) => {
                const pIn = parseUsdPrice(m.promptPricePerMillion);
                const pOut = parseUsdPrice(m.completionPricePerMillion);
                const blendedPer1MTokens =
                  pIn !== null && pOut !== null ? (pIn * 5 + pOut) / 6 : null;
                const tokensPer100Usd =
                  blendedPer1MTokens && blendedPer1MTokens > 0
                    ? `${Math.round(100 / blendedPer1MTokens).toLocaleString("ko-KR")}M`
                    : blendedPer1MTokens === 0
                    ? "무료"
                    : "-";

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-base-200/45 border border-base-content/10 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-base-content">{m.name}</p>
                        <p style={{ color: "var(--label-secondary)" }}>
                          {m.provider} {m.isOpenWeight ? "· 오픈웨이트" : "· API"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompareModel(m.id)}
                        className="text-[11px] opacity-65 hover:opacity-100"
                        aria-label={`${m.name} 비교 해제`}
                      >
                        해제
                      </button>
                    </div>

                    <div className="divide-y divide-base-content/8 font-mono tabular-nums">
                      <div className="py-1.5 flex justify-between">
                        <span style={{ color: "var(--label-secondary)" }}>컨텍스트</span>
                        <span className="font-bold text-base-content">
                          {formatContextWindow(m.contextLength)}
                        </span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span style={{ color: "var(--label-secondary)" }}>입력 / 출력 단가</span>
                        <span className="text-base-content">
                          {m.promptPricePerMillion} / {m.completionPricePerMillion}
                        </span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span style={{ color: "var(--label-secondary)" }}>$100 처리량(5:1)</span>
                        <span className="font-bold text-primary">{tokensPer100Usd}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2 & 3. Full Models View: METR Autonomous Curve + Unsaturated Reasoning Benchmarks */}
      {!compactPreview && (
        <>
          {/* METR Log-Scale Trajectory */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-base-content">
                자율 과업 지속 지평 추세 (METR 50% 성공 기준)
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--label-secondary)" }}
              >
                인간의 개입 없이 소프트웨어·연구 과업을 완수하는 시간 지평이 약 7개월마다 2배씩 확장되고 있습니다.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl material-regular space-y-6">
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 680 210"
                  role="img"
                  aria-label="2023년 6분에서 현재 16시간, AGI 기준선 40시간으로 이어지는 로그 스케일 추세선"
                  className="w-full min-w-[480px] h-auto"
                >
                  {/* Subtle horizontal log reference lines */}
                  {[40, 95, 150].map((y) => (
                    <line
                      key={y}
                      x1="40"
                      y1={y}
                      x2="640"
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray="3 4"
                    />
                  ))}

                  {/* Polyline connecting log-scaled points */}
                  <polyline
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={METR_TRAJECTORY_POINTS.map((pt, idx) => {
                      const x = 56 + idx * 94;
                      const logRatio =
                        (Math.log10(pt.minutes) - Math.log10(5)) /
                        (Math.log10(2600) - Math.log10(5));
                      const y = Math.round(168 - logRatio * 132);
                      return `${x},${y}`;
                    }).join(" ")}
                  />

                  {METR_TRAJECTORY_POINTS.map((pt, idx) => {
                    const x = 56 + idx * 94;
                    const logRatio =
                      (Math.log10(pt.minutes) - Math.log10(5)) /
                      (Math.log10(2600) - Math.log10(5));
                    const y = Math.round(168 - logRatio * 132);
                    const isProjected = pt.period.includes("*");

                    return (
                      <g key={pt.period}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isProjected ? 4.5 : 5}
                          fill={
                            isProjected ? "var(--color-base-100)" : "var(--color-primary)"
                          }
                          stroke="var(--color-primary)"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="700"
                          fill="currentColor"
                        >
                          {pt.label}
                        </text>
                        <text
                          x={x}
                          y="192"
                          textAnchor="middle"
                          fontSize="11"
                          fill="currentColor"
                          opacity="0.6"
                        >
                          {pt.period}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--label-secondary)" }}
              >
                * 27.Q2(40시간)는 현행 지수 추세 외삽 기준선이며 숙련된 지식 근로자의 주간 자율 업무 단위에 해당합니다.
              </p>
            </div>
          </div>

          {/* Unsaturated Frontier Benchmarks */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-base-content">
                미포화 핵심 추론 벤치마크
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--label-secondary)" }}
              >
                단순 암기로 해결할 수 없는 유동 추론, 실전 소프트웨어 공학, 연구급 수리·생물학 지표만 선별합니다.
              </p>
            </div>

            <div className="rounded-3xl material-regular divide-y divide-base-content/10">
              {CORE_BENCHMARKS.map((bench) => (
                <div key={bench.id} className="px-6 py-5 space-y-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <span className="text-sm sm:text-base font-bold text-base-content">
                        {bench.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        {bench.domain}
                      </span>
                    </div>

                    <div className="font-mono text-sm font-bold tabular-nums text-base-content">
                      {bench.scorePercent.toFixed(1)}%{" "}
                      <span className="text-xs font-normal opacity-55">
                        / 임계치 {bench.thresholdPercent}%
                      </span>
                    </div>
                  </div>

                  <div
                    className="h-1.5 w-full rounded-full bg-base-content/10 overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, bench.scorePercent)}%` }}
                    />
                  </div>

                  <p
                    className="text-xs"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {bench.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

const MACRO_DOMAIN_ORDER: MacroIndicatorItem["domain"][] = [
  "설비투자 및 연산 인프라",
  "생산성 및 자본 대체",
  "청년 지식고용 선행 지표",
  "총고용 및 분배 후행 지표",
];

export function MacroFutureSection() {
  const [expandedMacroId, setExpandedMacroId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<"all" | MacroIndicatorItem["stage"]>("all");
  const [showAuditLog, setShowAuditLog] = useState<boolean>(false);

  const stageCounts = useMemo(
    () => ({
      early: MACRO_12_INDICATORS.filter((m) => m.stage === "조기경보 도달").length,
      progress: MACRO_12_INDICATORS.filter((m) => m.stage === "관측 진행").length,
      lagging: MACRO_12_INDICATORS.filter((m) => m.stage === "후행 완충").length,
    }),
    []
  );

  return (
    <section aria-labelledby="macro-future-heading" className="space-y-14">
      {/* 1. 12 Macroeconomic & Labor Transition Indicators */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2
              id="macro-future-heading"
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content"
            >
              거시경제 및 고용 전환 12대 관측 지표
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--label-secondary)" }}
            >
              설비투자 선행 지표부터 지식근로 진입 장벽, 총고용·소득분배 후행 지표까지의 단계별 파급 경로를 추적합니다. 각 행을 누르면 세부 해석이 열립니다.
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="거시 지표 경보 단계 필터"
          className="flex flex-wrap items-center gap-1.5"
        >
          {(
            [
              { id: "all", label: `전체 (${MACRO_12_INDICATORS.length})` },
              { id: "조기경보 도달", label: `조기경보 도달 (${stageCounts.early})` },
              { id: "관측 진행", label: `관측 진행 (${stageCounts.progress})` },
              { id: "후행 완충", label: `후행 완충 (${stageCounts.lagging})` },
            ] as const
          ).map((tab) => {
            const active = stageFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  triggerHaptic("selection");
                  setStageFilter(tab.id);
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

        <div className="space-y-8">
          {MACRO_DOMAIN_ORDER.map((domainName) => {
            const items = MACRO_12_INDICATORS.filter(
              (item) =>
                item.domain === domainName &&
                (stageFilter === "all" || item.stage === stageFilter)
            );
            if (items.length === 0) return null;
            return (
              <div key={domainName} className="space-y-3">
                <h3 className="text-sm font-bold text-base-content px-1">
                  {domainName}
                </h3>

                <div className="rounded-3xl material-regular divide-y divide-base-content/10 overflow-hidden">
                  {items.map((item) => {
                    const isOpen = expandedMacroId === item.id;
                    const dotClass =
                      item.stage === "조기경보 도달"
                        ? "bg-primary"
                        : item.stage === "관측 진행"
                        ? "bg-secondary"
                        : "bg-base-content/30";

                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => {
                            triggerHaptic("light");
                            setExpandedMacroId((prev) =>
                              prev === item.id ? null : item.id
                            );
                          }}
                          className="w-full px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-start hover:bg-base-content/[0.025] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}
                              aria-hidden="true"
                            />
                            <span className="text-sm font-semibold text-base-content">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 ps-4 sm:ps-0">
                            <span className="font-mono text-sm font-bold tabular-nums text-base-content">
                              {item.currentDelta}
                            </span>
                            <span
                              className="text-xs whitespace-nowrap"
                              style={{ color: "var(--label-secondary)" }}
                            >
                              {item.stage}
                            </span>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4 pt-2 bg-base-200/35 border-t border-base-content/5 space-y-1 text-xs">
                            <p className="font-medium text-base-content">
                              {item.interpretation}
                            </p>
                            <p style={{ color: "var(--label-secondary)" }}>
                              임계 기준: {item.thresholdNote}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p
          className="text-xs leading-relaxed px-1"
          style={{ color: "var(--label-secondary)" }}
        >
          주석: 거시 고용 및 임금 지표에는 금리 주기, 팬데믹 이후 채용 정상화, 산업별 자본재 편향 등 교란 요인이 함께 작용하므로 단일 지표만으로 즉각적인 의무 노동 소멸이나 보편적 기본소득(UBI) 전환을 단정하지 않습니다.
        </p>
      </div>

      {/* 2. Physical, Bio & Interface Milestones */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold tracking-tight text-base-content">
            바이오 · 월드모델 · 인프라 마일스톤
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--label-secondary)" }}
          >
            역노화 임상, 실시간 물리 월드모델, 비침습 뇌-컴퓨터 인터페이스 및 기가와트급 연산 클러스터의 검증 단계입니다.
          </p>
        </div>

        <div className="rounded-3xl material-regular divide-y divide-base-content/10">
          {FUTURE_MILESTONES.map((ms) => (
            <div key={ms.id} className="px-6 py-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  className="font-semibold"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {ms.domain} · {ms.organization}
                </span>
                <span className="font-mono font-semibold text-base-content">
                  {ms.metricHighlight} ({ms.verificationLabel})
                </span>
              </div>

              <h4 className="text-base font-bold text-base-content">
                {ms.title}
              </h4>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--label-secondary)" }}
              >
                {ms.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Methodology & Audit Changelog Disclosure */}
      <div className="rounded-3xl material-regular overflow-hidden">
        <button
          type="button"
          aria-expanded={showAuditLog}
          onClick={() => {
            triggerHaptic("light");
            setShowAuditLog((prev) => !prev);
          }}
          className="w-full min-h-14 px-6 py-4 flex items-center justify-between gap-4 text-start pst-press"
        >
          <div>
            <p className="text-sm font-bold text-base-content">
              관측 모델 산출 기준 및 변경 이력
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--label-secondary)" }}
            >
              벤치마크 교체 및 시계 보정 로그 열람
            </p>
          </div>
          <IconChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              showAuditLog ? "rotate-180" : ""
            }`}
          />
        </button>

        {showAuditLog && (
          <div className="border-t border-base-content/10 divide-y divide-base-content/10">
            {AUDIT_CHANGELOG.map((log) => (
              <div key={log.id} className="px-6 py-4 space-y-1 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-base-content">
                    {log.date} · {log.title}
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    영향도: {log.clockImpact}
                  </span>
                </div>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {log.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
