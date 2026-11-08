import { NextResponse } from "next/server";
import { fetchLiveIntelligence } from "@/lib/server/liveIntel";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";

  try {
    const payload = await fetchLiveIntelligence(forceRefresh);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": forceRefresh
          ? "no-store"
          : "public, s-maxage=180, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      {
        updatedAtIso: new Date().toISOString(),
        activeSources: [],
        signals: [],
        liveModels: [],
        stats: {
          totalSignalsFetched: 0,
          liveModelsTracked: 0,
          reasoningAndAgentPaperRatioPercent: 45,
        },
      },
      { status: 200 }
    );
  }
}
