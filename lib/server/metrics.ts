import "server-only";
import { cache } from "react";

export interface TelemetryMetric {
  id: string;
  name: string;
  value: string;
  change: string;
  status: "healthy" | "optimal" | "active";
}

/**
 * Server-only ATRC ingest pipeline telemetry with React.cache() memoization.
 */
export const fetchServerTelemetry = cache(async (): Promise<TelemetryMetric[]> => {
  return [
    {
      id: "rss-ingest",
      name: "공식 채널 RSS 수집",
      value: "5분 주기",
      change: "OpenAI · Google DeepMind",
      status: "optimal",
    },
    {
      id: "paper-ingest",
      name: "학술 아카이브 연동",
      value: "실시간",
      change: "arXiv AI · Hugging Face Papers",
      status: "healthy",
    },
    {
      id: "model-registry",
      name: "모델 단가 · 컨텍스트 추적",
      value: "자동 갱신",
      change: "OpenRouter API Registry",
      status: "active",
    },
    {
      id: "ondevice-llm",
      name: "요약 정제 파이프라인",
      value: "하이브리드",
      change: "온디바이스 WebGPU · 자동 번역",
      status: "optimal",
    },
  ];
});
