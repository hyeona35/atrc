import { NextResponse } from "next/server";
import { fetchLiveIntelligence } from "@/lib/server/liveIntel";

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const siteUrl = `${reqUrl.protocol}//${reqUrl.host}`;

  const payload = await fetchLiveIntelligence(false);
  const nowRfc = new Date(payload.updatedAtIso).toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ATRC — 실시간 AI 시그널 · 특이점 관측소</title>
    <link>${siteUrl}</link>
    <description>OpenAI, Anthropic, Google DeepMind, Mistral AI, METR, arXiv, Hugging Face 최신 시그널 한국어 자동 요약 피드</description>
    <language>ko-KR</language>
    <lastBuildDate>${nowRfc}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${payload.signals
      .slice(0, 12)
      .map(
        (item) => `
    <item>
      <title><![CDATA[[${item.sourceName}] ${item.titleKo}]]></title>
      <link>${item.url}</link>
      <guid isPermaLink="false">${item.id}</guid>
      <pubDate>${new Date(item.publishedIso).toUTCString()}</pubDate>
      <description><![CDATA[${item.summaryKo}]]></description>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
