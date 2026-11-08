"use client";

import { useSyncExternalStore } from "react";

export type OnDeviceEngineKind =
  | "chrome-builtin"
  | "local-ollama"
  | "webgpu-worker"
  | "server-api";

export interface OnDeviceAiStatus {
  activeEngine: OnDeviceEngineKind;
  engineLabel: string;
  webGpuSupported: boolean;
  chromeBuiltinAvailable: boolean;
  ollamaModelName: string | null;
  workerState: "idle" | "loading" | "ready" | "error";
  workerProgress: number;
  workerError?: string;
}

interface ChromeLanguageModelSession {
  prompt: (input: string) => Promise<string>;
  destroy?: () => void;
}

interface ChromeLanguageModelFactory {
  availability?: () => Promise<string>;
  create: (opts?: { systemPrompt?: string }) => Promise<ChromeLanguageModelSession>;
}

interface ChromeSummarizerInstance {
  summarize: (input: string) => Promise<string>;
  destroy?: () => void;
}

interface ChromeSummarizerFactory {
  availability?: () => Promise<string>;
  create: (opts?: {
    type?: string;
    format?: string;
    length?: string;
  }) => Promise<ChromeSummarizerInstance>;
}

function getChromeLanguageModelFactory(): ChromeLanguageModelFactory | null {
  if (typeof window === "undefined") return null;
  const g = window as unknown as {
    LanguageModel?: ChromeLanguageModelFactory;
    ai?: { languageModel?: ChromeLanguageModelFactory };
  };
  return g.LanguageModel ?? g.ai?.languageModel ?? null;
}

function getChromeSummarizerFactory(): ChromeSummarizerFactory | null {
  if (typeof window === "undefined") return null;
  const g = window as unknown as {
    Summarizer?: ChromeSummarizerFactory;
    ai?: { summarizer?: ChromeSummarizerFactory };
  };
  return g.Summarizer ?? g.ai?.summarizer ?? null;
}

const SERVER_SNAPSHOT: OnDeviceAiStatus = {
  activeEngine: "server-api",
  engineLabel: "서버 자동 요약 API",
  webGpuSupported: false,
  chromeBuiltinAvailable: false,
  ollamaModelName: null,
  workerState: "idle",
  workerProgress: 0,
};

let statusState: OnDeviceAiStatus = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();
let workerInstance: Worker | null = null;
let probeStarted = false;
const pendingWorkerRequests = new Map<
  string,
  { resolve: (summary: string) => void; reject: (err: Error) => void }
>();

function emitStatusChange() {
  for (const listener of listeners) {
    listener();
  }
}

function computeDerivedEngine(next: Partial<OnDeviceAiStatus>): OnDeviceAiStatus {
  const merged: OnDeviceAiStatus = { ...statusState, ...next };
  if (merged.workerState === "ready") {
    merged.activeEngine = "webgpu-worker";
    merged.engineLabel = merged.webGpuSupported
      ? "브라우저 WebGPU LLM (Qwen2.5-0.5B)"
      : "브라우저 WASM LLM (Qwen2.5-0.5B)";
  } else if (merged.chromeBuiltinAvailable) {
    merged.activeEngine = "chrome-builtin";
    merged.engineLabel = "Chrome 내장 온디바이스 AI";
  } else if (merged.ollamaModelName) {
    merged.activeEngine = "local-ollama";
    merged.engineLabel = `로컬 Ollama (${merged.ollamaModelName})`;
  } else {
    merged.activeEngine = "server-api";
    merged.engineLabel = "실시간 자동 요약 API";
  }
  return merged;
}

function updateStatus(patch: Partial<OnDeviceAiStatus>) {
  statusState = computeDerivedEngine(patch);
  emitStatusChange();
}

export function subscribeOnDeviceStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getOnDeviceStatusSnapshot(): OnDeviceAiStatus {
  return statusState;
}

export function getOnDeviceStatusServerSnapshot(): OnDeviceAiStatus {
  return SERVER_SNAPSHOT;
}

export function useOnDeviceAi(): OnDeviceAiStatus {
  return useSyncExternalStore(
    subscribeOnDeviceStatus,
    getOnDeviceStatusSnapshot,
    getOnDeviceStatusServerSnapshot
  );
}

export async function probeInitialOnDeviceStatus(): Promise<OnDeviceAiStatus> {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (probeStarted) return statusState;
  probeStarted = true;

  let webGpuSupported = false;
  try {
    const nav = navigator as unknown as {
      gpu?: { requestAdapter: () => Promise<unknown> };
    };
    if (nav.gpu) {
      const adapter = await nav.gpu.requestAdapter();
      webGpuSupported = Boolean(adapter);
    }
  } catch {
    webGpuSupported = false;
  }

  let chromeBuiltinAvailable = false;
  try {
    const lm = getChromeLanguageModelFactory();
    if (lm?.availability) {
      const avail = await lm.availability();
      if (avail === "available" || avail === "readily") {
        chromeBuiltinAvailable = true;
      }
    }
    if (!chromeBuiltinAvailable) {
      const sum = getChromeSummarizerFactory();
      if (sum?.availability) {
        const avail = await sum.availability();
        if (avail === "available" || avail === "readily") {
          chromeBuiltinAvailable = true;
        }
      }
    }
  } catch {
    chromeBuiltinAvailable = false;
  }

  let ollamaModelName: string | null = null;
  try {
    const res = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = (await res.json()) as { models?: Array<{ name?: string }> };
      const first = data.models?.[0]?.name;
      if (first) ollamaModelName = first;
    }
  } catch {
    ollamaModelName = null;
  }

  updateStatus({
    webGpuSupported,
    chromeBuiltinAvailable,
    ollamaModelName,
  });

  return statusState;
}

function ensureWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }
  if (!workerInstance) {
    workerInstance = new Worker("/workers/on-device-llm.worker.js", {
      type: "module",
    });
    workerInstance.addEventListener("message", (event: MessageEvent) => {
      const msg = event.data as {
        type?: string;
        state?: "loading" | "ready" | "error";
        progress?: number;
        message?: string;
        id?: string;
        summary?: string;
      };
      if (msg.type === "status") {
        updateStatus({
          workerState: msg.state ?? "idle",
          workerProgress:
            typeof msg.progress === "number"
              ? msg.progress
              : statusState.workerProgress,
          workerError: msg.state === "error" ? msg.message : undefined,
        });
      } else if (msg.type === "result" && msg.id) {
        const pending = pendingWorkerRequests.get(msg.id);
        if (pending) {
          pendingWorkerRequests.delete(msg.id);
          pending.resolve(msg.summary ?? "");
        }
      } else if (msg.type === "result_error" && msg.id) {
        const pending = pendingWorkerRequests.get(msg.id);
        if (pending) {
          pendingWorkerRequests.delete(msg.id);
          pending.reject(new Error(msg.message ?? "온디바이스 추론 오류"));
        }
      }
    });
  }
  return workerInstance;
}

export function activateWebGpuWorker(): void {
  const worker = ensureWorker();
  if (!worker) return;
  if (statusState.workerState === "loading" || statusState.workerState === "ready") {
    return;
  }
  updateStatus({ workerState: "loading", workerProgress: 2, workerError: undefined });
  worker.postMessage({ type: "warmup" });
}

function summarizeViaWorker(
  id: string,
  title: string,
  text: string
): Promise<string | null> {
  const worker = ensureWorker();
  if (!worker) return Promise.resolve(null);

  return new Promise((resolve) => {
    const reqId = `${id}-${Date.now()}`;
    const timeout = window.setTimeout(() => {
      if (pendingWorkerRequests.has(reqId)) {
        pendingWorkerRequests.delete(reqId);
        resolve(null);
      }
    }, 35000);

    pendingWorkerRequests.set(reqId, {
      resolve: (summary) => {
        window.clearTimeout(timeout);
        resolve(summary && summary.length > 8 ? summary : null);
      },
      reject: () => {
        window.clearTimeout(timeout);
        resolve(null);
      },
    });

    worker.postMessage({ type: "summarize", id: reqId, title, text });
  });
}

export async function summarizeViaChromeBuiltin(
  title: string,
  text: string
): Promise<string | null> {
  try {
    const lm = getChromeLanguageModelFactory();
    if (lm) {
      const session = await lm.create({
        systemPrompt:
          "과장이나 이모지 없이 과학·AI 소식의 핵심 사실만 담백한 한국어 2문장으로 요약하세요.",
      });
      const out = await session.prompt(
        `제목: ${title}\n내용: ${text}\n한국어 2문장 요약:`
      );
      session.destroy?.();
      if (out && out.trim().length > 10) return out.trim();
    }

    const sum = getChromeSummarizerFactory();
    if (sum) {
      const summarizer = await sum.create({
        type: "tl;dr",
        format: "plain-text",
        length: "short",
      });
      const out = await summarizer.summarize(`${title}. ${text}`);
      summarizer.destroy?.();
      if (out && out.trim().length > 10) return out.trim();
    }
  } catch {
    return null;
  }
  return null;
}

export async function summarizeViaLocalOllama(
  modelName: string,
  title: string,
  text: string
): Promise<string | null> {
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        stream: false,
        prompt: `과장이나 이모지 없이 다음 AI 기술 소식을 자연스러운 한국어 2문장으로 요약하라.\n제목: ${title}\n원문: ${text}\n요약:`,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { response?: string };
    const cleaned = json.response?.trim();
    return cleaned && cleaned.length > 10 ? cleaned : null;
  } catch {
    return null;
  }
}

export async function summarizeWithBestEngine(
  id: string,
  title: string,
  text: string,
  preferBrowserWorker = false
): Promise<{ summaryKo: string; engine: string } | null> {
  // 1. Browser WebGPU / WASM Worker if already ready or explicitly requested
  if (statusState.workerState === "ready" || preferBrowserWorker) {
    const workerOut = await summarizeViaWorker(id, title, text);
    if (workerOut) {
      const engine = statusState.webGpuSupported
        ? "온디바이스 WebGPU (Qwen2.5-0.5B)"
        : "온디바이스 WASM (Qwen2.5-0.5B)";
      writeCachedLocalSummary(id, workerOut, engine);
      return { summaryKo: workerOut, engine };
    }
  }

  // 2. Chrome Built-in AI (Gemini Nano)
  if (statusState.chromeBuiltinAvailable) {
    const chromeOut = await summarizeViaChromeBuiltin(title, text);
    if (chromeOut) {
      const engine = "Chrome 내장 온디바이스 AI";
      writeCachedLocalSummary(id, chromeOut, engine);
      return { summaryKo: chromeOut, engine };
    }
  }

  // 3. Local Desktop Ollama
  if (statusState.ollamaModelName) {
    const ollamaOut = await summarizeViaLocalOllama(
      statusState.ollamaModelName,
      title,
      text
    );
    if (ollamaOut) {
      const engine = `로컬 Ollama (${statusState.ollamaModelName})`;
      writeCachedLocalSummary(id, ollamaOut, engine);
      return { summaryKo: ollamaOut, engine };
    }
  }

  // 4. Server-side On-Demand Summarize API fallback
  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        summaryKo?: string;
        engine?: string;
      };
      if (data.summaryKo) {
        const engine = data.engine ?? "실시간 자동 요약 API";
        writeCachedLocalSummary(id, data.summaryKo, engine);
        return { summaryKo: data.summaryKo, engine };
      }
    }
  } catch {
    // Ignore transient network failure
  }

  return null;
}

const LOCAL_CACHE_KEY = "eh_ondevice_summaries_v3";

export function readCachedLocalSummaries(): Record<
  string,
  { summaryKo: string; engine: string }
> {
  if (typeof window === "undefined") return {};
  try {
    // Purge legacy corrupted caches where item IDs collided
    if (window.localStorage.getItem("eh_ondevice_summaries_v2")) {
      window.localStorage.removeItem("eh_ondevice_summaries_v2");
    }
    if (window.localStorage.getItem("eh_local_summaries_v1")) {
      window.localStorage.removeItem("eh_local_summaries_v1");
    }
    const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, { summaryKo: string; engine: string }>;
  } catch {
    return {};
  }
}

export function writeCachedLocalSummary(
  id: string,
  summaryKo: string,
  engine: string
): void {
  if (typeof window === "undefined") return;
  try {
    const current = readCachedLocalSummaries();
    const entries = Object.entries(current).slice(-60);
    const next = Object.fromEntries(entries);
    next[id] = { summaryKo, engine };
    window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
