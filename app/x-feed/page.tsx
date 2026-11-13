import React from "react";
import type { Metadata } from "next";
import { EventHorizonWorkspace } from "@/components/horizon/EventHorizonWorkspace";

export const metadata: Metadata = {
  title: "주요 인물 X 피드",
  description:
    "ATRC — 개인 X API v2 Bearer Token을 브라우저 보안 쿠키에 저장하여 직접 검증된 AI 연구자·평가 기관 30인의 실시간 포스트를 모아보고 한국어로 자동 요약합니다.",
};

export default function PersonalXFeedPage() {
  return <EventHorizonWorkspace initialSection="x-feed" />;
}
