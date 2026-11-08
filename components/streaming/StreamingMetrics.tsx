import React from "react";
import { fetchServerTelemetry } from "@/lib/server/metrics";

export async function StreamingMetrics() {
  const metrics = await fetchServerTelemetry();

  return (
    <footer
      aria-label="데이터 파이프라인 구성 정보"
      className="pt-8 border-t border-base-content/10 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <span className="font-semibold text-base-content/80">
          자동 데이터 파이프라인 구성
        </span>
        <span style={{ color: "var(--label-secondary)" }}>
          수동 관리 없이 공개 API와 온디바이스 LLM을 결합해 최신 상태를 유지합니다.
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
        {metrics.map((metric) => (
          <div key={metric.id} className="space-y-0.5">
            <p
              className="text-xs"
              style={{ color: "var(--label-secondary)" }}
            >
              {metric.name}
            </p>
            <p className="text-sm font-bold font-mono tabular-nums text-base-content">
              {metric.value}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--label-secondary)" }}
            >
              {metric.change}
            </p>
          </div>
        ))}
      </div>
    </footer>
  );
}
