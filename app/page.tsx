import React, { Suspense } from "react";
import type { Metadata } from "next";
import { EventHorizonWorkspace } from "@/components/horizon/EventHorizonWorkspace";
import { StreamingMetrics } from "@/components/streaming/StreamingMetrics";
import { StreamingSkeleton } from "@/components/streaming/StreamingSkeleton";

export const metadata: Metadata = {
  title: "관측 요약 · Event Horizon",
  description:
    "실시간 글로벌 AI 시그널 자동 수집·온디바이스 LLM 요약, 주요 인물 X 타임라인 모아보기, Seed RSI·AGI·ASI 도달 예측 시계 및 거시경제 전환 관측소",
};

export default function HomePage() {
  return (
    <EventHorizonWorkspace
      initialSection="overview"
      streamingSlot={
        <Suspense fallback={<StreamingSkeleton />}>
          <StreamingMetrics />
        </Suspense>
      }
    />
  );
}
