import React from "react";
import type { Metadata } from "next";
import { EventHorizonWorkspace } from "@/components/horizon/EventHorizonWorkspace";

export const metadata: Metadata = {
  title: "주요 인물 X · 소셜 피드",
  description:
    "ATRC — API 키 없이 X 공개 타임라인·Bluesky 공개 API·1차 연구 블로그에서 검증된 AI 연구자·평가 기관 30인의 최신 포스트를 자동 수집하고 한국어로 요약합니다.",
};

export default function PersonalXFeedPage() {
  return <EventHorizonWorkspace initialSection="x-feed" />;
}
