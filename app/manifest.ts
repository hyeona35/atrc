import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ATRC — 실시간 AI 시그널 · 특이점 관측소",
    short_name: "ATRC",
    description:
      "실시간 글로벌 AI 시그널 자동 요약, 주요 인물 X 타임라인 모아보기, Seed RSI·AGI·ASI 도달 예측 시계 및 거시 전환 관측소",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#09070e",
    theme_color: "#09070e",
    categories: ["news", "productivity", "utilities"],
    lang: "ko",
    icons: [
      {
        src: "/icons/atrc-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/atrc-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/atrc-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/atrc-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "관측 요약",
        short_name: "요약",
        url: "/",
        icons: [{ src: "/icons/atrc-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "주요 인물 X 피드",
        short_name: "X 피드",
        url: "/x-feed",
        icons: [{ src: "/icons/atrc-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
