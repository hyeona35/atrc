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

export type XFeedSourceChannel =
  | "x-api"
  | "x-syndication"
  | "twitterapi-io"
  | "bluesky"
  | "rss";

export type XFeedMode = "x-api" | "twitterapi-io" | "open-hybrid";

export interface XTimelineItem {
  id: string;
  authorName: string;
  handle: string;
  tier: InfluencerTier;
  affiliation: string;
  hitRate: number;
  isHypeWarning: boolean;
  createdAtIso: string;
  titleOriginal?: string;
  textOriginal: string;
  summaryKo: string;
  summarizedBy: string;
  url: string;
  sourceChannel: XFeedSourceChannel;
  sourceLabel: string;
  metrics: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
  };
}

export interface XFeedApiResponse {
  configured: boolean;
  maskedToken: string | null;
  feedMode: XFeedMode;
  activeChannels: string[];
  channelCounts: Record<XFeedSourceChannel, number>;
  updatedAtIso?: string;
  tweets: XTimelineItem[];
  trackedCount: number;
  apiNotice?: string;
  errorCode?:
    | "invalid_token"
    | "credits_required"
    | "rate_limited"
    | "network_error";
}

interface RawPostCandidate {
  id: string;
  account?: InfluencerAccount;
  authorName: string;
  handle: string;
  createdAtMs: number;
  createdAtIso: string;
  titleOriginal?: string;
  textOriginal: string;
  url: string;
  sourceChannel: XFeedSourceChannel;
  sourceLabel: string;
  metrics: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
  };
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

interface TwitterApiIoTweet {
  id?: string;
  text?: string;
  url?: string;
  createdAt?: string;
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  author?: {
    userName?: string;
    name?: string;
  };
}

interface TwitterApiIoResponse {
  tweets?: TwitterApiIoTweet[];
}

interface BlueskyFeedItem {
  reason?: { $type?: string };
  post?: {
    uri?: string;
    cid?: string;
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
    record?: {
      text?: string;
      createdAt?: string;
    };
  };
}

interface BlueskyAuthorFeedResponse {
  feed?: BlueskyFeedItem[];
}

interface SyndicationTweetObj {
  id_str?: string;
  id?: string | number;
  full_text?: string;
  text?: string;
  created_at?: string;
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
  retweeted_status_result?: unknown;
  retweeted_status?: unknown;
}

interface SyndicationEntry {
  type?: string;
  content?: {
    tweet?: SyndicationTweetObj;
  };
}

const feedCache = new Map<
  string,
  { expiresAt: number; payload: XFeedApiResponse }
>();
const syndicationHandleCache = new Map<
  string,
  { expiresAt: number; posts: RawPostCandidate[] }
>();
const blueskyHandleCache = new Map<
  string,
  { expiresAt: number; posts: RawPostCandidate[] }
>();
const rssUrlCache = new Map<
  string,
  { expiresAt: number; posts: RawPostCandidate[] }
>();
const summaryCache = new Map<
  string,
  { titleKo: string; summaryKo: string; engine: string }
>();

let syndicationCooldownUntil = 0;

// Priority X-only handles to attempt via official X Syndication per cycle
const SYNDICATION_PRIORITY_IDS = [
  "dario",
  "sama",
  "hassabis",
  "karpathy",
  "jeffdean",
  "noambrown",
  "arcprize",
  "artificialanalysis",
  "lmarena",
  "akhaliq",
  "fchollet",
  "tridao",
];

function emptyChannelCounts(): Record<XFeedSourceChannel, number> {
  return {
    "x-api": 0,
    "x-syndication": 0,
    "twitterapi-io": 0,
    bluesky: 0,
    rss: 0,
  };
}

function normalizeBearerToken(raw: string): string {
  let cleaned = raw.trim().replace(/^Bearer\s+/i, "").trim();
  if (
    cleaned.includes("%3D") ||
    cleaned.includes("%2F") ||
    cleaned.includes("%2B")
  ) {
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

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&#8217;|&#x2019;/g, "'")
    .replace(/&#8220;|&#8221;|&#x201C;|&#x201D;/g, '"')
    .replace(/&#8211;|&#8212;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPostText(raw: string): string {
  return decodeHtmlEntities(raw)
    .replace(/https?:\/\/t\.co\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
      const json = (await res
        .json()
        .catch(() => null)) as XApiSearchResponse | null;
      return { status: res.status, body: json };
    } catch {
      // Try fallback twitter.com host if api.x.com fails
    }
  }

  return { status: 0, body: null };
}

/**
 * Channel 1 (Keyless): X Official Syndication Embed Endpoint
 * Best-effort direct fetch from syndication.twitter.com with per-handle 30m cache & 429 cooldown.
 */
async function fetchFromXSyndication(
  targetAccounts: InfluencerAccount[],
  forceRefresh: boolean
): Promise<RawPostCandidate[]> {
  const now = Date.now();
  const collected: RawPostCandidate[] = [];

  // Sort target accounts so priority X-only leaders come first
  const priorityRank = new Map(
    SYNDICATION_PRIORITY_IDS.map((id, idx) => [id, idx])
  );
  const sortedTargets = [...targetAccounts].sort((a, b) => {
    const ra = priorityRank.get(a.id) ?? 99;
    const rb = priorityRank.get(b.id) ?? 99;
    if (ra !== rb) return ra - rb;
    return b.weight - a.weight;
  });

  // Always include already-cached valid posts for target accounts
  const uncachedToFetch: InfluencerAccount[] = [];
  for (const acc of sortedTargets) {
    const handle = acc.handle.replace(/^@/, "").toLowerCase();
    const cached = syndicationHandleCache.get(handle);
    if (!forceRefresh && cached && cached.expiresAt > now) {
      collected.push(...cached.posts);
    } else if (uncachedToFetch.length < 6) {
      uncachedToFetch.push(acc);
    }
  }

  if (uncachedToFetch.length === 0 || now < syndicationCooldownUntil) {
    return collected;
  }

  const results = await Promise.allSettled(
    uncachedToFetch.map(async (acc) => {
      const cleanHandle = acc.handle.replace(/^@/, "").trim();
      const lowerHandle = cleanHandle.toLowerCase();
      const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(
        cleanHandle
      )}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4500),
      });

      if (res.status === 429) {
        const resetSec = Number.parseInt(
          res.headers.get("x-rate-limit-reset") ?? "",
          10
        );
        const resetMs = Number.isFinite(resetSec)
          ? Math.min(
              Math.max(resetSec * 1000, Date.now() + 2 * 60 * 1000),
              Date.now() + 15 * 60 * 1000
            )
          : Date.now() + 10 * 60 * 1000;
        syndicationCooldownUntil = resetMs;
        const stale = syndicationHandleCache.get(lowerHandle);
        return stale?.posts ?? [];
      }

      if (!res.ok) {
        return [];
      }

      const html = await res.text();
      const nextDataMatch = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i
      );
      if (!nextDataMatch?.[1]) return [];

      let parsed: {
        props?: {
          pageProps?: {
            timeline?: {
              entries?: SyndicationEntry[];
            };
          };
        };
      };
      try {
        parsed = JSON.parse(nextDataMatch[1]) as typeof parsed;
      } catch {
        return [];
      }

      const entries = parsed.props?.pageProps?.timeline?.entries ?? [];
      const posts: RawPostCandidate[] = [];

      for (const entry of entries) {
        if (entry.type && entry.type !== "tweet") continue;
        const tw = entry.content?.tweet;
        if (!tw) continue;
        if (tw.retweeted_status_result || tw.retweeted_status) continue;

        const idStr = String(tw.id_str ?? tw.id ?? "").trim();
        const rawText = (tw.full_text ?? tw.text ?? "").trim();
        if (!idStr || !rawText || /^RT\s+@/i.test(rawText)) continue;

        const parsedMs = tw.created_at ? Date.parse(tw.created_at) : NaN;
        const createdAtMs = Number.isFinite(parsedMs) ? parsedMs : now;

        posts.push({
          id: `xsyn-${idStr}`,
          account: acc,
          authorName: acc.displayName,
          handle: acc.handle,
          createdAtMs,
          createdAtIso: new Date(createdAtMs).toISOString(),
          textOriginal: rawText,
          url: `https://x.com/${cleanHandle}/status/${idStr}`,
          sourceChannel: "x-syndication",
          sourceLabel: "X 공개",
          metrics: {
            likeCount: Number(tw.favorite_count ?? 0) || 0,
            retweetCount: Number(tw.retweet_count ?? 0) || 0,
            replyCount: Number(tw.reply_count ?? 0) || 0,
          },
        });
      }

      // Syndication sometimes orders by popularity; sort newest first and keep top 3
      posts.sort((a, b) => b.createdAtMs - a.createdAtMs);
      const trimmed = posts.slice(0, 3);

      syndicationHandleCache.set(lowerHandle, {
        expiresAt: Date.now() + 30 * 60 * 1000,
        posts: trimmed,
      });

      return trimmed;
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value.length > 0) {
      collected.push(...r.value);
    }
  }

  return collected;
}

/**
 * Channel 2 (Keyless): Bluesky Public API (Zero Auth, JSON + Engagement Metrics)
 */
async function fetchFromBluesky(
  targetAccounts: InfluencerAccount[],
  forceRefresh: boolean
): Promise<RawPostCandidate[]> {
  const now = Date.now();
  const bskyTargets = targetAccounts.filter((a) => Boolean(a.blueskyHandle));
  if (bskyTargets.length === 0) return [];

  const results = await Promise.allSettled(
    bskyTargets.map(async (acc) => {
      const actor = acc.blueskyHandle!;
      const cached = blueskyHandleCache.get(actor);
      if (!forceRefresh && cached && cached.expiresAt > now) {
        return cached.posts;
      }

      const endpoint = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
        actor
      )}&limit=6&filter=posts_no_replies`;

      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return cached?.posts ?? [];

      const json = (await res
        .json()
        .catch(() => null)) as BlueskyAuthorFeedResponse | null;
      const items = json?.feed ?? [];
      const posts: RawPostCandidate[] = [];

      for (const entry of items) {
        if (entry.reason?.$type?.includes("reasonRepost")) continue;
        const post = entry.post;
        const text = post?.record?.text?.trim();
        const uri = post?.uri;
        if (!text || !uri) continue;

        const rkey = uri.split("/").pop();
        if (!rkey) continue;

        const parsedMs = post.record?.createdAt
          ? Date.parse(post.record.createdAt)
          : NaN;
        const createdAtMs = Number.isFinite(parsedMs) ? parsedMs : now;

        posts.push({
          id: `bsky-${acc.id}-${rkey}`,
          account: acc,
          authorName: acc.displayName,
          handle: `@${actor}`,
          createdAtMs,
          createdAtIso: new Date(createdAtMs).toISOString(),
          textOriginal: text,
          url: `https://bsky.app/profile/${actor}/post/${rkey}`,
          sourceChannel: "bluesky",
          sourceLabel: "Bluesky",
          metrics: {
            likeCount: Number(post.likeCount ?? 0) || 0,
            retweetCount: Number(post.repostCount ?? 0) || 0,
            replyCount: Number(post.replyCount ?? 0) || 0,
          },
        });
        if (posts.length >= 3) break;
      }

      blueskyHandleCache.set(actor, {
        expiresAt: Date.now() + 10 * 60 * 1000,
        posts,
      });
      return posts;
    })
  );

  const collected: RawPostCandidate[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") collected.push(...r.value);
  }
  return collected;
}

/**
 * Channel 3 (Keyless): 1st-Party Researcher RSS 2.0 & Atom Feeds
 */
function parseFeedXml(
  xml: string,
  acc: InfluencerAccount,
  limit = 2
): RawPostCandidate[] {
  const posts: RawPostCandidate[] = [];
  const isAtom = /<entry[\s>]/i.test(xml) && !/<item[\s>]/i.test(xml);
  const blockRx = isAtom
    ? /<entry[\s\S]*?<\/entry>/gi
    : /<item[\s\S]*?<\/item>/gi;

  let match: RegExpExecArray | null;
  while (posts.length < limit && (match = blockRx.exec(xml)) !== null) {
    const block = match[0];
    const titleRaw =
      block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";

    let link = "";
    if (isAtom) {
      link =
        block.match(
          /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i
        )?.[1] ??
        block.match(
          /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i
        )?.[1] ??
        block.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ??
        "";
    } else {
      link =
        block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ??
        block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i)?.[1] ??
        "";
    }

    const descRaw =
      block.match(/<description[^>]*>([\s\S]{0,2400})<\/description>/i)?.[1] ??
      block.match(/<summary[^>]*>([\s\S]{0,2400})<\/summary>/i)?.[1] ??
      block.match(
        /<content:encoded[^>]*>([\s\S]{0,2400})[\s\S]*?<\/content:encoded>/i
      )?.[1] ??
      block.match(/<content[^>]*>([\s\S]{0,2400})[\s\S]*?<\/content>/i)?.[1] ??
      "";

    const dateRaw =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ??
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1] ??
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] ??
      block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1] ??
      "";

    const title = decodeHtmlEntities(titleRaw);
    const url = decodeHtmlEntities(link).trim();
    const excerpt = decodeHtmlEntities(descRaw).slice(0, 420);

    if (!title || !url || !/^https?:\/\//i.test(url)) continue;

    const parsedMs = dateRaw ? Date.parse(decodeHtmlEntities(dateRaw)) : NaN;
    const createdAtMs = Number.isFinite(parsedMs) ? parsedMs : Date.now();
    const idHash = crypto
      .createHash("sha256")
      .update(url)
      .digest("hex")
      .slice(0, 12);

    const textOriginal =
      excerpt && excerpt.toLowerCase() !== title.toLowerCase()
        ? `${title} — ${excerpt}`
        : title;

    posts.push({
      id: `rss-${acc.id}-${idHash}`,
      account: acc,
      authorName: acc.displayName,
      handle: acc.handle,
      createdAtMs,
      createdAtIso: new Date(createdAtMs).toISOString(),
      titleOriginal: title,
      textOriginal,
      url,
      sourceChannel: "rss",
      sourceLabel: "1차 블로그",
      metrics: { likeCount: 0, retweetCount: 0, replyCount: 0 },
    });
  }

  return posts;
}

async function fetchFromResearcherRss(
  targetAccounts: InfluencerAccount[],
  forceRefresh: boolean
): Promise<RawPostCandidate[]> {
  const now = Date.now();
  const rssTargets = targetAccounts.filter((a) => Boolean(a.rssFeedUrl));
  if (rssTargets.length === 0) return [];

  const results = await Promise.allSettled(
    rssTargets.map(async (acc) => {
      const feedUrl = acc.rssFeedUrl!;
      const cached = rssUrlCache.get(feedUrl);
      if (!forceRefresh && cached && cached.expiresAt > now) {
        return cached.posts;
      }

      const res = await fetch(feedUrl, {
        headers: {
          Accept:
            "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
          "User-Agent": "ATRCObservatory/1.0 (+https://atrc.vercel.app)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5500),
      });
      if (!res.ok) return cached?.posts ?? [];

      const xml = (await res.text()).slice(0, 350_000);
      const posts = parseFeedXml(xml, acc, 2);
      rssUrlCache.set(feedUrl, {
        expiresAt: Date.now() + 15 * 60 * 1000,
        posts,
      });
      return posts;
    })
  );

  const collected: RawPostCandidate[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") collected.push(...r.value);
  }
  return collected;
}

/**
 * Optional Server-Side Low-Cost X Proxy (TWITTERAPI_IO_KEY)
 */
async function fetchFromTwitterApiIo(
  apiKey: string,
  targetAccounts: InfluencerAccount[],
  accountByLowerHandle: Map<string, InfluencerAccount>
): Promise<RawPostCandidate[]> {
  const batches = buildHandleQueryBatches(targetAccounts).slice(0, 3);
  const results = await Promise.allSettled(
    batches.map(async (query) => {
      const params = new URLSearchParams({
        query,
        queryType: "Latest",
      });
      const res = await fetch(
        `https://api.twitterapi.io/twitter/tweet/advanced_search?${params.toString()}`,
        {
          headers: {
            "X-API-Key": apiKey,
            Accept: "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(7000),
        }
      );
      if (!res.ok) return [];
      const json = (await res
        .json()
        .catch(() => null)) as TwitterApiIoResponse | null;
      return json?.tweets ?? [];
    })
  );

  const posts: RawPostCandidate[] = [];
  const seenIds = new Set<string>();

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const tw of r.value) {
      const id = String(tw.id ?? "").trim();
      const text = (tw.text ?? "").trim();
      if (!id || !text || seenIds.has(id) || /^RT\s+@/i.test(text)) continue;
      seenIds.add(id);

      const username = tw.author?.userName?.replace(/^@/, "") ?? "";
      const acc = username
        ? accountByLowerHandle.get(username.toLowerCase())
        : undefined;
      const parsedMs = tw.createdAt ? Date.parse(tw.createdAt) : NaN;
      const createdAtMs = Number.isFinite(parsedMs) ? parsedMs : Date.now();
      const handleStr = username
        ? `@${username}`
        : acc?.handle ?? "@unknown";

      posts.push({
        id: `twio-${id}`,
        account: acc,
        authorName: acc?.displayName ?? tw.author?.name ?? handleStr,
        handle: handleStr,
        createdAtMs,
        createdAtIso: new Date(createdAtMs).toISOString(),
        textOriginal: text,
        url:
          tw.url ||
          `https://x.com/${handleStr.replace(/^@/, "")}/status/${id}`,
        sourceChannel: "twitterapi-io",
        sourceLabel: "X 실시간",
        metrics: {
          likeCount: Number(tw.likeCount ?? 0) || 0,
          retweetCount: Number(tw.retweetCount ?? 0) || 0,
          replyCount: Number(tw.replyCount ?? 0) || 0,
        },
      });
    }
  }

  return posts;
}

async function summarizeCached(
  authorName: string,
  cleanText: string
): Promise<{ titleKo: string; summaryKo: string; engine: string }> {
  const key = crypto
    .createHash("sha256")
    .update(`${authorName}::${cleanText.slice(0, 400)}`)
    .digest("hex")
    .slice(0, 20);

  const hit = summaryCache.get(key);
  if (hit) return hit;

  const result = await summarizeTextServerSide(authorName, cleanText);
  if (summaryCache.size > 400) {
    const firstKey = summaryCache.keys().next().value;
    if (firstKey) summaryCache.delete(firstKey);
  }
  summaryCache.set(key, result);
  return result;
}

async function enrichCandidates(
  candidates: RawPostCandidate[],
  tierFilter: string
): Promise<XTimelineItem[]> {
  // Deduplicate by URL and normalized author+text prefix
  const seenUrls = new Set<string>();
  const seenTextKeys = new Set<string>();
  const deduped: RawPostCandidate[] = [];

  // Prefer X / Bluesky over RSS if identical text, and newest first
  const channelPriority: Record<XFeedSourceChannel, number> = {
    "x-api": 5,
    "twitterapi-io": 4,
    "x-syndication": 3,
    bluesky: 2,
    rss: 1,
  };

  const sorted = [...candidates].sort((a, b) => {
    const timeDiff = b.createdAtMs - a.createdAtMs;
    if (Math.abs(timeDiff) > 60_000) return timeDiff;
    return channelPriority[b.sourceChannel] - channelPriority[a.sourceChannel];
  });

  const authorCounts = new Map<string, number>();
  const maxPerAuthor = tierFilter === "all" ? 4 : 6;

  for (const item of sorted) {
    const normUrl = item.url.replace(/\/+$/, "").toLowerCase();
    const authorKey = (item.account?.id ?? item.handle).toLowerCase();
    const textPrefix = cleanPostText(item.textOriginal)
      .toLowerCase()
      .slice(0, 64);
    const textKey = `${authorKey}::${textPrefix}`;

    if (seenUrls.has(normUrl) || (textPrefix.length > 16 && seenTextKeys.has(textKey))) {
      continue;
    }

    const currentAuthorCount = authorCounts.get(authorKey) ?? 0;
    if (currentAuthorCount >= maxPerAuthor) continue;

    seenUrls.add(normUrl);
    if (textPrefix.length > 16) seenTextKeys.add(textKey);
    authorCounts.set(authorKey, currentAuthorCount + 1);
    deduped.push(item);

    if (deduped.length >= 28) break;
  }

  return Promise.all(
    deduped.map(async (item) => {
      const cleanText = cleanPostText(item.textOriginal);
      const account = item.account;
      const tier: InfluencerTier = account?.tier ?? "C";
      const isHype =
        (account ? account.weight < 0.6 : false) ||
        /\b(agi achieved|shocking|breaking:|insane|100x)\b/i.test(cleanText);

      const summarized = cleanText
        ? await summarizeCached(item.authorName, cleanText.slice(0, 480))
        : {
            titleKo: item.authorName,
            summaryKo: "첨부 미디어 또는 외부 링크 중심 게시물입니다.",
            engine: "원문 표시",
          };

      return {
        id: item.id,
        authorName: item.authorName,
        handle: item.handle,
        tier,
        affiliation: account?.affiliation ?? "AI 생태계 발신원",
        hitRate: account?.hitRate ?? 70,
        isHypeWarning: isHype,
        createdAtIso: item.createdAtIso,
        titleOriginal: item.titleOriginal,
        textOriginal: item.textOriginal,
        summaryKo: summarized.summaryKo,
        summarizedBy: summarized.engine,
        url: item.url,
        sourceChannel: item.sourceChannel,
        sourceLabel: item.sourceLabel,
        metrics: item.metrics,
      };
    })
  );
}

function summarizeActiveChannels(tweets: XTimelineItem[]): {
  activeChannels: string[];
  channelCounts: Record<XFeedSourceChannel, number>;
} {
  const counts = emptyChannelCounts();
  for (const tw of tweets) {
    counts[tw.sourceChannel] = (counts[tw.sourceChannel] ?? 0) + 1;
  }
  const activeChannels: string[] = [];
  if (counts["x-api"] > 0) activeChannels.push("개인 X API v2");
  if (counts["twitterapi-io"] > 0) activeChannels.push("X 실시간 피드");
  if (counts["x-syndication"] > 0) activeChannels.push("X 공개 타임라인");
  if (counts.bluesky > 0) activeChannels.push("Bluesky 공개 API");
  if (counts.rss > 0) activeChannels.push("1차 연구 블로그");
  return { activeChannels, channelCounts: counts };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tierFilter = searchParams.get("tier") || "all";
  const forceRefresh = searchParams.get("refresh") === "1";

  const cookieStore = await cookies();
  const savedToken = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const serverProxyKey = process.env.TWITTERAPI_IO_KEY?.trim() || "";

  const targetAccounts = INFLUENCER_ACCOUNTS.filter((acc) => {
    if (tierFilter === "all") return true;
    return acc.tier === tierFilter;
  });

  const accountByLowerHandle = new Map<string, InfluencerAccount>();
  for (const acc of INFLUENCER_ACCOUNTS) {
    accountByLowerHandle.set(acc.handle.replace(/^@/, "").toLowerCase(), acc);
  }

  const now = Date.now();
  const cacheNamespace = savedToken
    ? `xapi:${crypto
        .createHash("sha256")
        .update(savedToken)
        .digest("hex")
        .slice(0, 12)}`
    : serverProxyKey
      ? "twio"
      : "open";
  const cacheKey = `${cacheNamespace}:${tierFilter}`;
  const responseHeaders = savedToken
    ? { "Cache-Control": "private, no-store" }
    : {
        "Cache-Control":
          "public, s-maxage=180, stale-while-revalidate=600",
      };

  const cached = feedCache.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > now) {
    return NextResponse.json(cached.payload, { headers: responseHeaders });
  }

  // 1. Personal X API v2 Cookie Path (Highest Priority if user configured their own key)
  if (savedToken) {
    const batches = buildHandleQueryBatches(targetAccounts);
    const results = await Promise.all(
      batches.map((q) => queryXRecentSearch(savedToken, q))
    );

    const firstFailure = results.find((r) => r.status !== 200);
    const hasAnySuccess = results.some((r) => r.status === 200);

    if (hasAnySuccess) {
      const candidates: RawPostCandidate[] = [];
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
          const handleStr = u?.username
            ? `@${u.username}`
            : acc?.handle ?? "@unknown";
          const parsedMs = tw.created_at ? Date.parse(tw.created_at) : NaN;
          const createdAtMs = Number.isFinite(parsedMs) ? parsedMs : now;

          candidates.push({
            id: tw.id,
            account: acc,
            authorName: acc?.displayName ?? u?.name ?? handleStr,
            handle: handleStr,
            createdAtMs,
            createdAtIso: new Date(createdAtMs).toISOString(),
            textOriginal: tw.text,
            url: `https://x.com/${handleStr.replace(/^@/, "")}/status/${tw.id}`,
            sourceChannel: "x-api",
            sourceLabel: "X API",
            metrics: {
              likeCount: tw.public_metrics?.like_count ?? 0,
              retweetCount: tw.public_metrics?.retweet_count ?? 0,
              replyCount: tw.public_metrics?.reply_count ?? 0,
            },
          });
        }
      }

      const enriched = await enrichCandidates(candidates, tierFilter);
      const { activeChannels, channelCounts } =
        summarizeActiveChannels(enriched);

      const responsePayload: XFeedApiResponse = {
        configured: true,
        maskedToken: maskToken(savedToken),
        feedMode: "x-api",
        activeChannels,
        channelCounts,
        updatedAtIso: new Date().toISOString(),
        tweets: enriched,
        trackedCount: targetAccounts.length,
        apiNotice:
          enriched.length === 0
            ? "최근 7일 이내 선택된 등급 인물들의 신규 공개 X 게시물이 없습니다."
            : undefined,
      };

      feedCache.set(cacheKey, {
        expiresAt: now + 3 * 60 * 1000,
        payload: responsePayload,
      });

      return NextResponse.json(responsePayload, { headers: responseHeaders });
    }

    // Personal X API failed — report error clearly AND gracefully fall back to open-hybrid posts
    const st = firstFailure?.status ?? 0;
    const detailMsg =
      firstFailure?.body?.detail ||
      firstFailure?.body?.errors?.[0]?.detail ||
      firstFailure?.body?.errors?.[0]?.message ||
      "";

    let errorCode: XFeedApiResponse["errorCode"] = "network_error";
    let apiNotice =
      "개인 X API 연결에 일시적인 오류가 발생해 공개 멀티채널 피드로 자동 전환했습니다.";

    if (st === 401) {
      errorCode = "invalid_token";
      apiNotice =
        "입력된 개인 X API Bearer Token이 유효하지 않거나 만료되어 공개 멀티채널 피드로 표시 중입니다.";
    } else if (st === 402 || st === 403) {
      errorCode = "credits_required";
      apiNotice = `개인 X API v2 권한 확인 필요 (HTTP ${st})${
        detailMsg ? ` — ${detailMsg}` : ""
      }. 공개 멀티채널 피드를 대신 표시합니다.`;
    } else if (st === 429) {
      errorCode = "rate_limited";
      apiNotice =
        "개인 X API 요청 한도(Rate Limit)에 도달해 공개 멀티채널 피드로 자동 전환했습니다.";
    }

    const [synPosts, bskyPosts, rssPosts] = await Promise.all([
      fetchFromXSyndication(targetAccounts, false),
      fetchFromBluesky(targetAccounts, false),
      fetchFromResearcherRss(targetAccounts, false),
    ]);
    const fallbackTweets = await enrichCandidates(
      [...synPosts, ...bskyPosts, ...rssPosts],
      tierFilter
    );
    const { activeChannels, channelCounts } =
      summarizeActiveChannels(fallbackTweets);

    return NextResponse.json(
      {
        configured: true,
        maskedToken: maskToken(savedToken),
        feedMode: "open-hybrid",
        activeChannels,
        channelCounts,
        updatedAtIso: new Date().toISOString(),
        tweets: fallbackTweets,
        trackedCount: targetAccounts.length,
        errorCode,
        apiNotice,
      } satisfies XFeedApiResponse,
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  // 2. Optional Server-Side Low-Cost X Proxy (TWITTERAPI_IO_KEY) + Open Channels
  if (serverProxyKey) {
    const [twioPosts, bskyPosts, rssPosts] = await Promise.all([
      fetchFromTwitterApiIo(serverProxyKey, targetAccounts, accountByLowerHandle),
      fetchFromBluesky(targetAccounts, forceRefresh),
      fetchFromResearcherRss(targetAccounts, forceRefresh),
    ]);

    const merged = [...twioPosts, ...bskyPosts, ...rssPosts];
    const enriched = await enrichCandidates(merged, tierFilter);
    const { activeChannels, channelCounts } = summarizeActiveChannels(enriched);

    const responsePayload: XFeedApiResponse = {
      configured: false,
      maskedToken: null,
      feedMode: twioPosts.length > 0 ? "twitterapi-io" : "open-hybrid",
      activeChannels,
      channelCounts,
      updatedAtIso: new Date().toISOString(),
      tweets: enriched,
      trackedCount: targetAccounts.length,
    };

    feedCache.set(cacheKey, {
      expiresAt: now + 10 * 60 * 1000,
      payload: responsePayload,
    });

    return NextResponse.json(responsePayload, { headers: responseHeaders });
  }

  // 3. Zero-Key Open-Hybrid Auto-Ingestion (X Syndication + Bluesky Public API + 1st-Party RSS)
  const [synPosts, bskyPosts, rssPosts] = await Promise.all([
    fetchFromXSyndication(targetAccounts, forceRefresh),
    fetchFromBluesky(targetAccounts, forceRefresh),
    fetchFromResearcherRss(targetAccounts, forceRefresh),
  ]);

  const enriched = await enrichCandidates(
    [...synPosts, ...bskyPosts, ...rssPosts],
    tierFilter
  );
  const { activeChannels, channelCounts } = summarizeActiveChannels(enriched);

  const apiNotice =
    enriched.length === 0
      ? "선택한 등급에서 즉시 수집 가능한 공개 피드 항목이 아직 없습니다. 전체 등급을 보거나 아래 X.com 실시간 타임라인으로 바로 이동해 보세요."
      : undefined;

  const responsePayload: XFeedApiResponse = {
    configured: false,
    maskedToken: null,
    feedMode: "open-hybrid",
    activeChannels,
    channelCounts,
    updatedAtIso: new Date().toISOString(),
    tweets: enriched,
    trackedCount: targetAccounts.length,
    apiNotice,
  };

  feedCache.set(cacheKey, {
    expiresAt: now + 5 * 60 * 1000,
    payload: responsePayload,
  });

  return NextResponse.json(responsePayload, { headers: responseHeaders });
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
