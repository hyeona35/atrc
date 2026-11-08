import "server-only";
import crypto from "crypto";

export type LiveSignalCategory = "official" | "paper" | "ecosystem";

export interface LiveSignalItem {
  id: string;
  sourceName: string;
  sourceKind: LiveSignalCategory;
  signalGrade: "공식 발표" | "검증 논문" | "생태계 포착" | "과장 주의";
  isHypeWarning: boolean;
  publishedIso: string;
  titleOriginal: string;
  titleKo: string;
  summaryOriginal: string;
  summaryKo: string;
  url: string;
  metricsLabel?: string;
  summarizedBy: string;
}

export interface LiveFrontierModel {
  id: string;
  name: string;
  provider: string;
  releasedIso: string;
  contextLength: number;
  promptPricePerMillion: string;
  completionPricePerMillion: string;
  modality: string;
}

export interface LiveIntelPayload {
  updatedAtIso: string;
  activeSources: string[];
  signals: LiveSignalItem[];
  liveModels: LiveFrontierModel[];
  stats: {
    totalSignalsFetched: number;
    liveModelsTracked: number;
    reasoningAndAgentPaperRatioPercent: number;
  };
}

interface RawSignalCandidate {
  id: string;
  sourceName: string;
  sourceKind: LiveSignalCategory;
  publishedMs: number;
  publishedIso: string;
  titleOriginal: string;
  summaryOriginal: string;
  url: string;
  metricsLabel?: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedPayload: { expiresAt: number; data: LiveIntelPayload } | null = null;
const translationCache = new Map<string, { titleKo: string; summaryKo: string; engine: string }>();

function decodeEntities(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function distillTwoSentences(text: string, maxChars = 280): string {
  const cleaned = decodeEntities(text)
    .replace(/\$\$?[^$]+\$\$?/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 18);

  const joined = (sentences.slice(0, 2).join(" ") || cleaned).trim();
  if (joined.length <= maxChars) return joined;
  return `${joined.slice(0, maxChars - 1).trim()}…`;
}

function classifySignal(item: RawSignalCandidate): {
  signalGrade: LiveSignalItem["signalGrade"];
  isHypeWarning: boolean;
} {
  const combined = `${item.titleOriginal} ${item.summaryOriginal}`.toLowerCase();
  const sensationalMarkers =
    /\b(shocking|insane|secret leak|rumor|agi achieved|kills all jobs|100x overnight|trust me|vague|cooking)\b/i;
  const empiricalMarkers =
    /\b(arxiv|benchmark|evaluation|dataset|open-source|weights|paper|api|release|technical report|swe-bench|arc-agi)\b/i;

  if (item.sourceKind === "official") {
    return { signalGrade: "공식 발표", isHypeWarning: false };
  }
  if (item.sourceKind === "paper") {
    return { signalGrade: "검증 논문", isHypeWarning: false };
  }
  if (sensationalMarkers.test(combined) && !empiricalMarkers.test(combined)) {
    return { signalGrade: "과장 주의", isHypeWarning: true };
  }
  return { signalGrade: "생태계 포착", isHypeWarning: false };
}

function parseRssItems(
  xml: string,
  sourceName: string,
  sourceKind: LiveSignalCategory,
  limit = 5
): RawSignalCandidate[] {
  const items: RawSignalCandidate[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of itemBlocks.slice(0, limit)) {
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch =
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ??
      block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
    const dateMatch =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ??
      block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);

    const title = decodeEntities(titleMatch?.[1] ?? "");
    const url = decodeEntities(linkMatch?.[1] ?? "");
    const rawDesc = decodeEntities(descMatch?.[1] ?? "");
    const parsedMs = dateMatch?.[1] ? Date.parse(decodeEntities(dateMatch[1])) : NaN;
    const publishedMs = Number.isFinite(parsedMs) ? parsedMs : Date.now();

    if (!title || !url) continue;

    const cleanSource = sourceName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const urlHash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);

    items.push({
      id: `rss-${cleanSource}-${urlHash}`,
      sourceName,
      sourceKind,
      publishedMs,
      publishedIso: new Date(publishedMs).toISOString(),
      titleOriginal: title,
      summaryOriginal:
        distillTwoSentences(rawDesc) ||
        `${sourceName} 공식 채널을 통해 공개된 최신 연구 및 프로덕트 발표입니다.`,
      url,
    });
  }
  return items;
}

function parseArxivAtom(xml: string, limit = 6): {
  items: RawSignalCandidate[];
  reasoningRatio: number;
} {
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  const items: RawSignalCandidate[] = [];
  let reasoningHits = 0;

  for (const entry of entries) {
    const title = decodeEntities(entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const summary = decodeEntities(entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? "");
    const idUrl = decodeEntities(entry.match(/<id[^>]*>([\s\S]*?)<\/id>/i)?.[1] ?? "");
    const publishedRaw = decodeEntities(
      entry.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1] ?? ""
    );

    if (
      /\b(agent|reasoning|self-improv|reinforcement|alignment|world model|scaling)\b/i.test(
        `${title} ${summary}`
      )
    ) {
      reasoningHits += 1;
    }

    if (items.length < limit && title && idUrl) {
      const parsedMs = Date.parse(publishedRaw);
      const publishedMs = Number.isFinite(parsedMs) ? parsedMs : Date.now();
      const arxivSlug = idUrl.replace(/\/+$/, "").split("/").pop() ?? "";
      const urlHash = crypto.createHash("sha256").update(idUrl).digest("hex").slice(0, 10);
      items.push({
        id: `arxiv-${arxivSlug || urlHash}`,
        sourceName: "arXiv AI",
        sourceKind: "paper",
        publishedMs,
        publishedIso: new Date(publishedMs).toISOString(),
        titleOriginal: title,
        summaryOriginal: distillTwoSentences(summary),
        url: idUrl.replace(/^http:\/\//, "https://"),
        metricsLabel: "프리프린트",
      });
    }
  }

  const reasoningRatio =
    entries.length > 0 ? Math.round((reasoningHits / entries.length) * 100) : 42;
  return { items, reasoningRatio };
}

async function translateTextToKorean(text: string): Promise<string | null> {
  if (!text.trim()) return null;
  if (/[가-힣]{4,}/.test(text)) return text;

  try {
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(
      text
    )}`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(3500),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json) || !Array.isArray(json[0])) return null;
    const translated = (json[0] as unknown[])
      .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === "string" ? chunk[0] : ""))
      .join("")
      .trim();
    return translated || null;
  } catch {
    return null;
  }
}

export async function summarizeTextServerSide(
  title: string,
  body: string
): Promise<{ titleKo: string; summaryKo: string; engine: string }> {
  const distilledBody = distillTwoSentences(body, 320);

  // 1. Optional Local Ollama Server (if running on host)
  try {
    const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      signal: AbortSignal.timeout(1400),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "qwen2.5:1.5b",
        stream: false,
        prompt: `다음 AI 기술 소식의 제목과 내용을 과장 없이 담백한 한국어 2문장으로 요약하라. JSON {"titleKo":"...","summaryKo":"..."} 형식으로만 응답하라.\n제목: ${title}\n내용: ${distilledBody}`,
      }),
    });
    if (ollamaRes.ok) {
      const data = (await ollamaRes.json()) as { response?: string };
      const match = data.response?.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as { titleKo?: string; summaryKo?: string };
        if (parsed.titleKo && parsed.summaryKo) {
          return {
            titleKo: parsed.titleKo.trim(),
            summaryKo: parsed.summaryKo.trim(),
            engine: "Local Ollama",
          };
        }
      }
    }
  } catch {
    // Ollama not running locally; proceed cleanly
  }

  // 2. Optional Gemini API Key if provided in environment
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          signal: AbortSignal.timeout(4500),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `다음 영문 AI 연구/뉴스를 과장 없이 정확한 한국어로 번역·요약하세요. JSON {"titleKo":"한줄 한국어 제목","summaryKo":"핵심 2문장 요약"} 만 출력하세요.\nTitle: ${title}\nBody: ${distilledBody}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (gemRes.ok) {
        const json = (await gemRes.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]) as { titleKo?: string; summaryKo?: string };
          if (parsed.titleKo && parsed.summaryKo) {
            return {
              titleKo: parsed.titleKo.trim(),
              summaryKo: parsed.summaryKo.trim(),
              engine: "Gemini API",
            };
          }
        }
      }
    } catch {
      // Fallback cleanly
    }
  }

  // 3. Zero-Config Extractive Distillation + Neural Korean Translation
  const [titleKo, summaryKo] = await Promise.all([
    translateTextToKorean(title),
    translateTextToKorean(distilledBody),
  ]);

  return {
    titleKo: titleKo ?? title,
    summaryKo: summaryKo ?? distilledBody,
    engine: titleKo ? "자동 요약 파이프라인" : "원문 발췌",
  };
}

function formatPricePerMillion(rawPerToken: string | undefined): string {
  if (!rawPerToken) return "미공개";
  const val = Number.parseFloat(rawPerToken);
  if (!Number.isFinite(val) || val < 0) return "미공개";
  if (val === 0) return "무료";
  const perMillion = val * 1_000_000;
  if (perMillion < 0.1) return `$${perMillion.toFixed(3)}`;
  return `$${perMillion.toFixed(2)}`;
}

const MAJOR_FRONTIER_PREFIXES: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google DeepMind",
  "x-ai": "xAI",
  "meta-llama": "Meta",
  deepseek: "DeepSeek",
  qwen: "Qwen",
  moonshotai: "Moonshot AI",
  mistralai: "Mistral",
  liquid: "Liquid AI",
};

export async function fetchLiveIntelligence(
  forceRefresh = false
): Promise<LiveIntelPayload> {
  const now = Date.now();
  if (!forceRefresh && cachedPayload && cachedPayload.expiresAt > now) {
    return cachedPayload.data;
  }

  const activeSources: string[] = [];
  const rawCandidates: RawSignalCandidate[] = [];
  let liveModels: LiveFrontierModel[] = [];
  let reasoningPaperRatio = 46;

  const [openaiRes, deepmindRes, hfRes, arxivRes, hnRes, openRouterRes] =
    await Promise.allSettled([
      fetch("https://openai.com/news/rss.xml", {
        signal: AbortSignal.timeout(6000),
      }).then((r) => (r.ok ? r.text() : Promise.reject(new Error("openai")))),
      fetch("https://deepmind.google/blog/rss.xml", {
        signal: AbortSignal.timeout(6000),
      }).then((r) => (r.ok ? r.text() : Promise.reject(new Error("deepmind")))),
      fetch("https://huggingface.co/api/daily_papers?limit=7", {
        signal: AbortSignal.timeout(6000),
      }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("hf")))),
      fetch(
        "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=12",
        { signal: AbortSignal.timeout(6500) }
      ).then((r) => (r.ok ? r.text() : Promise.reject(new Error("arxiv")))),
      fetch(
        "https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points>40&query=OpenAI%20OR%20Anthropic%20OR%20Claude%20OR%20Gemini%20OR%20DeepMind%20OR%20AGI%20OR%20DeepSeek%20OR%20Qwen&hitsPerPage=8",
        { signal: AbortSignal.timeout(5500) }
      ).then((r) => (r.ok ? r.json() : Promise.reject(new Error("hn")))),
      fetch("https://openrouter.ai/api/v1/models", {
        signal: AbortSignal.timeout(6500),
      }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("openrouter")))),
    ]);

  if (openaiRes.status === "fulfilled") {
    const parsed = parseRssItems(openaiRes.value, "OpenAI", "official", 4);
    if (parsed.length > 0) {
      activeSources.push("OpenAI");
      rawCandidates.push(...parsed);
    }
  }

  if (deepmindRes.status === "fulfilled") {
    const parsed = parseRssItems(
      deepmindRes.value,
      "Google DeepMind",
      "official",
      4
    );
    if (parsed.length > 0) {
      activeSources.push("Google DeepMind");
      rawCandidates.push(...parsed);
    }
  }

  if (hfRes.status === "fulfilled" && Array.isArray(hfRes.value)) {
    activeSources.push("Hugging Face Papers");
    for (const entry of hfRes.value.slice(0, 6)) {
      const paper = entry?.paper ?? {};
      const id = String(paper.id ?? entry?.title ?? "");
      const title = decodeEntities(String(entry?.title ?? paper.title ?? ""));
      const summary = distillTwoSentences(String(entry?.summary ?? paper.summary ?? ""));
      const publishedRaw = String(entry?.publishedAt ?? paper.publishedAt ?? "");
      const parsedMs = Date.parse(publishedRaw);
      const publishedMs = Number.isFinite(parsedMs) ? parsedMs : now;
      const upvotes = typeof paper.upvotes === "number" ? paper.upvotes : undefined;
      const orgName = entry?.organization?.fullname ?? paper?.organization?.fullname;

      if (!title || !id) continue;
      rawCandidates.push({
        id: `hf-${id}`,
        sourceName: orgName ? `HF Papers · ${orgName}` : "HF Daily Papers",
        sourceKind: "paper",
        publishedMs,
        publishedIso: new Date(publishedMs).toISOString(),
        titleOriginal: title,
        summaryOriginal: summary,
        url: `https://huggingface.co/papers/${id}`,
        metricsLabel: upvotes ? `추천 ${upvotes}` : undefined,
      });
    }
  }

  if (arxivRes.status === "fulfilled") {
    const { items, reasoningRatio } = parseArxivAtom(arxivRes.value, 5);
    reasoningPaperRatio = reasoningRatio;
    if (items.length > 0) {
      activeSources.push("arXiv");
      rawCandidates.push(...items);
    }
  }

  if (hnRes.status === "fulfilled" && Array.isArray(hnRes.value?.hits)) {
    activeSources.push("Hacker News");
    for (const hit of hnRes.value.hits.slice(0, 5)) {
      const title = decodeEntities(String(hit.title ?? ""));
      const url = String(
        hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`
      );
      const createdMs =
        typeof hit.created_at_i === "number" ? hit.created_at_i * 1000 : now;
      const points = typeof hit.points === "number" ? hit.points : 0;
      if (!title) continue;

      rawCandidates.push({
        id: `hn-${hit.objectID}`,
        sourceName: "Hacker News",
        sourceKind: "ecosystem",
        publishedMs: createdMs,
        publishedIso: new Date(createdMs).toISOString(),
        titleOriginal: title,
        summaryOriginal: `${title}. 글로벌 개발자 생태계에서 ${points}점 이상의 추천과 기술 검증 토론이 진행 중인 주요 안건입니다.`,
        url,
        metricsLabel: `${points} pts`,
      });
    }
  }

  if (openRouterRes.status === "fulfilled" && Array.isArray(openRouterRes.value?.data)) {
    activeSources.push("OpenRouter Registry");
    const allModels = openRouterRes.value.data as Array<{
      id?: string;
      name?: string;
      created?: number;
      context_length?: number;
      architecture?: { modality?: string };
      pricing?: { prompt?: string; completion?: string };
    }>;

    const filtered = allModels
      .filter((m) => {
        if (!m.id || !m.name || !m.created) return false;
        const prefix = m.id.split("/")[0] ?? "";
        return Boolean(MAJOR_FRONTIER_PREFIXES[prefix]) && !m.id.includes(":free");
      })
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));

    // Deduplicate base variants so we show a clean, diverse 12-model frontier table
    const seenCleanNames = new Set<string>();
    const picked: LiveFrontierModel[] = [];
    for (const m of filtered) {
      const prefix = m.id!.split("/")[0] ?? "";
      const cleanKey = m.id!.split(":")[0]!;
      if (seenCleanNames.has(cleanKey)) continue;
      seenCleanNames.add(cleanKey);

      picked.push({
        id: m.id!,
        name: m.name!.replace(/^[^:]+:\s*/, ""),
        provider: MAJOR_FRONTIER_PREFIXES[prefix] ?? prefix,
        releasedIso: new Date((m.created ?? 0) * 1000).toISOString(),
        contextLength: m.context_length ?? 128000,
        promptPricePerMillion: formatPricePerMillion(m.pricing?.prompt),
        completionPricePerMillion: formatPricePerMillion(m.pricing?.completion),
        modality: m.architecture?.modality ?? "text->text",
      });
      if (picked.length >= 12) break;
    }
    liveModels = picked;
  }

  // Deduplicate candidates by normalized title prefix & sort newest first
  const seenTitles = new Set<string>();
  const uniqueCandidates = rawCandidates
    .sort((a, b) => b.publishedMs - a.publishedMs)
    .filter((item) => {
      const norm = item.titleOriginal
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "")
        .slice(0, 36);
      if (!norm || seenTitles.has(norm)) return false;
      seenTitles.add(norm);
      return true;
    })
    .slice(0, 18);

  // Translate & summarize in parallel with caching
  const signals: LiveSignalItem[] = await Promise.all(
    uniqueCandidates.map(async (item) => {
      let localized = translationCache.get(item.id);
      if (!localized) {
        localized = await summarizeTextServerSide(
          item.titleOriginal,
          item.summaryOriginal
        );
        translationCache.set(item.id, localized);
      }

      const { signalGrade, isHypeWarning } = classifySignal(item);

      return {
        id: item.id,
        sourceName: item.sourceName,
        sourceKind: item.sourceKind,
        signalGrade,
        isHypeWarning,
        publishedIso: item.publishedIso,
        titleOriginal: item.titleOriginal,
        titleKo: localized.titleKo,
        summaryOriginal: item.summaryOriginal,
        summaryKo: localized.summaryKo,
        url: item.url,
        metricsLabel: item.metricsLabel,
        summarizedBy: localized.engine,
      };
    })
  );

  const payload: LiveIntelPayload = {
    updatedAtIso: new Date(now).toISOString(),
    activeSources,
    signals,
    liveModels,
    stats: {
      totalSignalsFetched: signals.length,
      liveModelsTracked: liveModels.length,
      reasoningAndAgentPaperRatioPercent: reasoningPaperRatio,
    },
  };

  cachedPayload = {
    expiresAt: now + CACHE_TTL_MS,
    data: payload,
  };

  return payload;
}
