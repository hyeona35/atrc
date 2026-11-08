import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  INFLUENCER_ACCOUNTS,
  type InfluencerAccount,
  type InfluencerTier,
} from "@/lib/data/eventHorizonData";
import { summarizeTextServerSide } from "@/lib/server/liveIntel";

const TOKEN_COOKIE_NAME = "eh_x_bearer_token";
const HINT_COOKIE_NAME = "eh_x_token_hint";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export interface XTimelineItem {
  id: string;
  authorName: string;
  handle: string;
  tier: InfluencerTier;
  affiliation: string;
  hitRate: number;
  isHypeWarning: boolean;
  createdAtIso: string;
  textOriginal: string;
  summaryKo: string;
  summarizedBy: string;
  url: string;
  metrics: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
  };
}

export interface XFeedApiResponse {
  configured: boolean;
  maskedToken: string | null;
  updatedAtIso?: string;
  tweets: XTimelineItem[];
  trackedCount: number;
  apiNotice?: string;
  errorCode?: "invalid_token" | "credits_required" | "rate_limited" | "network_error";
}

interface XApiRawTweet {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
  };
}

interface XApiRawUser {
  id: string;
  name: string;
  username: string;
}

interface XApiSearchResponse {
  data?: XApiRawTweet[];
  includes?: {
    users?: XApiRawUser[];
  };
  title?: string;
  detail?: string;
  errors?: Array<{ message?: string; detail?: string }>;
}

const feedCache = new Map<
  string,
  { expiresAt: number; payload: XFeedApiResponse }
>();

function normalizeBearerToken(raw: string): string {
  let cleaned = raw.trim().replace(/^Bearer\s+/i, "").trim();
  if (cleaned.includes("%3D") || cleaned.includes("%2F") || cleaned.includes("%2B")) {
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch {
      // Keep as-is if malformed percent encoding
    }
  }
  return cleaned;
}

function maskToken(token: string): string {
  if (token.length <= 8) return "••••••••";
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}

function buildHandleQueryBatches(accounts: InfluencerAccount[]): string[] {
  const suffix = ") -is:retweet";
  const maxLen = 470;
  const batches: string[] = [];
  let currentClauses: string[] = [];

  for (const acc of accounts) {
    const cleanHandle = acc.handle.replace(/^@/, "").trim();
    if (!cleanHandle) continue;
    const clause = `from:${cleanHandle}`;
    const candidate = `(${[...currentClauses, clause].join(" OR ")}${suffix}`;
    if (candidate.length > maxLen && currentClauses.length > 0) {
      batches.push(`(${currentClauses.join(" OR ")}${suffix}`);
      currentClauses = [clause];
    } else {
      currentClauses.push(clause);
    }
  }

  if (currentClauses.length > 0) {
    batches.push(`(${currentClauses.join(" OR ")}${suffix}`);
  }

  return batches;
}

async function queryXRecentSearch(
  bearerToken: string,
  query: string
): Promise<{ status: number; body: XApiSearchResponse | null }> {
  const params = new URLSearchParams({
    query,
    max_results: "25",
    "tweet.fields": "created_at,public_metrics,author_id",
    expansions: "author_id",
    "user.fields": "name,username",
  });

  const endpoints = [
    `https://api.x.com/2/tweets/search/recent?${params.toString()}`,
    `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const json = (await res.json().catch(() => null)) as XApiSearchResponse | null;
      return { status: res.status, body: json };
    } catch {
      // Try fallback twitter.com host if api.x.com fails
    }
  }

  return { status: 0, body: null };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tierFilter = searchParams.get("tier") || "all";
  const forceRefresh = searchParams.get("refresh") === "1";

  const cookieStore = await cookies();
  const savedToken = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!savedToken) {
    const emptyPayload: XFeedApiResponse = {
      configured: false,
      maskedToken: null,
      tweets: [],
      trackedCount: INFLUENCER_ACCOUNTS.length,
    };
    return NextResponse.json(emptyPayload, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const targetAccounts = INFLUENCER_ACCOUNTS.filter((acc) => {
    if (tierFilter === "all") return true;
    if (tierFilter === "DF") return acc.tier === "D" || acc.tier === "F";
    return acc.tier === tierFilter;
  });

  const tokenHash = crypto
    .createHash("sha256")
    .update(savedToken)
    .digest("hex")
    .slice(0, 12);
  const cacheKey = `${tokenHash}:${tierFilter}`;
  const now = Date.now();
  const cached = feedCache.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > now) {
    return NextResponse.json(cached.payload, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const batches = buildHandleQueryBatches(targetAccounts);
  const results = await Promise.all(
    batches.map((q) => queryXRecentSearch(savedToken, q))
  );

  const firstFailure = results.find((r) => r.status !== 200);
  const hasAnySuccess = results.some((r) => r.status === 200);

  if (!hasAnySuccess && firstFailure) {
    const st = firstFailure.status;
    const detailMsg =
      firstFailure.body?.detail ||
      firstFailure.body?.errors?.[0]?.detail ||
      firstFailure.body?.errors?.[0]?.message ||
      "";

    let errorCode: XFeedApiResponse["errorCode"] = "network_error";
    let apiNotice =
      "X API 서버와 통신하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

    if (st === 401) {
      errorCode = "invalid_token";
      apiNotice =
        "입력된 X API Bearer Token이 유효하지 않거나 만료되었습니다. X Developer Portal에서 발급된 Bearer Token을 다시 확인해 주세요.";
    } else if (st === 402 || st === 403) {
      errorCode = "credits_required";
      apiNotice = `X API v2 접근 권한 확인이 필요합니다 (HTTP ${st}). X Developer Portal에서 App이 Project에 연결되어 있고 Recent Search 권한(Basic 또는 Pay-per-use 크레딧)이 활성화되어 있는지 확인해 주세요.${
        detailMsg ? ` (${detailMsg})` : ""
      }`;
    } else if (st === 429) {
      errorCode = "rate_limited";
      apiNotice =
        "X API 요청 한도(Rate Limit)에 도달했습니다. 약 15분 후 자동으로 재개됩니다.";
    }

    return NextResponse.json(
      {
        configured: true,
        maskedToken: maskToken(savedToken),
        tweets: [],
        trackedCount: targetAccounts.length,
        errorCode,
        apiNotice,
      } satisfies XFeedApiResponse,
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const accountByLowerHandle = new Map<string, InfluencerAccount>();
  for (const acc of INFLUENCER_ACCOUNTS) {
    accountByLowerHandle.set(acc.handle.replace(/^@/, "").toLowerCase(), acc);
  }

  const rawMerged: Array<{
    tweet: XApiRawTweet;
    user: XApiRawUser | undefined;
    account: InfluencerAccount | undefined;
  }> = [];
  const seenIds = new Set<string>();

  for (const res of results) {
    if (res.status !== 200 || !res.body?.data) continue;
    const userMap = new Map<string, XApiRawUser>();
    for (const u of res.body.includes?.users ?? []) {
      userMap.set(u.id, u);
    }
    for (const tw of res.body.data) {
      if (seenIds.has(tw.id)) continue;
      seenIds.add(tw.id);
      const u = tw.author_id ? userMap.get(tw.author_id) : undefined;
      const acc = u?.username
        ? accountByLowerHandle.get(u.username.toLowerCase())
        : undefined;
      rawMerged.push({ tweet: tw, user: u, account: acc });
    }
  }

  rawMerged.sort((a, b) => {
    const ta = a.tweet.created_at ? Date.parse(a.tweet.created_at) : 0;
    const tb = b.tweet.created_at ? Date.parse(b.tweet.created_at) : 0;
    return tb - ta;
  });

  const topSlice = rawMerged.slice(0, 24);
  const enriched: XTimelineItem[] = await Promise.all(
    topSlice.map(async ({ tweet, user, account }) => {
      const cleanText = tweet.text
        .replace(/https?:\/\/t\.co\/\S+/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const handleStr = user?.username
        ? `@${user.username}`
        : account?.handle ?? "@unknown";
      const authorName = account?.displayName ?? user?.name ?? handleStr;
      const tier: InfluencerTier = account?.tier ?? "C";
      const isHype =
        (tier === "D" || (tier === "F" && account?.id !== "scaling01")) ||
        /\b(agi achieved|shocking|breaking:|insane|100x)\b/i.test(cleanText);

      const summarized = cleanText
        ? await summarizeTextServerSide(authorName, cleanText)
        : {
            titleKo: authorName,
            summaryKo: "첨부 미디어 또는 외부 링크 중심 게시물입니다.",
            engine: "원문 표시",
          };

      return {
        id: tweet.id,
        authorName,
        handle: handleStr,
        tier,
        affiliation: account?.affiliation ?? "AI 생태계 발신원",
        hitRate: account?.hitRate ?? 70,
        isHypeWarning: isHype,
        createdAtIso: tweet.created_at ?? new Date().toISOString(),
        textOriginal: tweet.text,
        summaryKo: summarized.summaryKo,
        summarizedBy: summarized.engine,
        url: `https://x.com/${handleStr.replace(/^@/, "")}/status/${tweet.id}`,
        metrics: {
          likeCount: tweet.public_metrics?.like_count ?? 0,
          retweetCount: tweet.public_metrics?.retweet_count ?? 0,
          replyCount: tweet.public_metrics?.reply_count ?? 0,
        },
      };
    })
  );

  const responsePayload: XFeedApiResponse = {
    configured: true,
    maskedToken: maskToken(savedToken),
    updatedAtIso: new Date().toISOString(),
    tweets: enriched,
    trackedCount: targetAccounts.length,
    apiNotice:
      enriched.length === 0
        ? "최근 7일 이내 선택된 등급 인물들의 신규 공개 게시물이 없습니다."
        : undefined,
  };

  feedCache.set(cacheKey, {
    expiresAt: now + 3 * 60 * 1000,
    payload: responsePayload,
  });

  return NextResponse.json(responsePayload, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  void request.url;
  try {
    const body = (await request.json()) as { bearerToken?: string };
    const normalized = normalizeBearerToken(body.bearerToken ?? "");

    if (normalized.length < 20 || /\s/.test(normalized)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "올바른 X API v2 Bearer Token 형식이 아닙니다. 공백 없는 토큰 문자열을 입력해 주세요.",
        },
        { status: 400 }
      );
    }

    const reqProto =
      request.headers.get("x-forwarded-proto") ??
      new URL(request.url).protocol.replace(":", "");
    const isSecure = reqProto === "https";
    const cookieStore = await cookies();

    cookieStore.set(TOKEN_COOKIE_NAME, normalized, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    cookieStore.set(HINT_COOKIE_NAME, maskToken(normalized), {
      httpOnly: false,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return NextResponse.json({
      ok: true,
      configured: true,
      maskedToken: maskToken(normalized),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "쿠키 저장 처리 중 요청 본문을 읽지 못했습니다." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  void request.url;
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(HINT_COOKIE_NAME);
  return NextResponse.json({ ok: true, configured: false });
}
