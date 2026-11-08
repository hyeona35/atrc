// Dedicated Web Worker for On-Device WebGPU / WASM LLM Summarization
// Uses @huggingface/transformers v3 loaded via jsDelivr ESM so Next.js main bundle stays tiny (0ms TBT).

let generatorPromise = null;

async function getGenerator(onProgress) {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      const { pipeline, env } = await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0/+esm"
      );
      env.allowLocalModels = false;

      let hasWebGpu = false;
      try {
        if (typeof navigator !== "undefined" && "gpu" in navigator) {
          const adapter = await navigator.gpu.requestAdapter();
          hasWebGpu = Boolean(adapter);
        }
      } catch {
        hasWebGpu = false;
      }

      return pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-0.5B-Instruct",
        {
          device: hasWebGpu ? "webgpu" : "wasm",
          dtype: hasWebGpu ? "q4f16" : "q4",
          progress_callback: (info) => {
            if (info && typeof info.progress === "number") {
              onProgress(Math.round(info.progress));
            }
          },
        }
      );
    })();
  }
  return generatorPromise;
}

self.addEventListener("message", async (event) => {
  const { type, id, title, text } = event.data || {};

  if (type === "warmup") {
    try {
      self.postMessage({ type: "status", state: "loading", progress: 1 });
      await getGenerator((pct) => {
        self.postMessage({ type: "status", state: "loading", progress: pct });
      });
      self.postMessage({ type: "status", state: "ready", progress: 100 });
    } catch (err) {
      generatorPromise = null;
      self.postMessage({
        type: "status",
        state: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (type === "summarize") {
    try {
      const generator = await getGenerator((pct) => {
        self.postMessage({ type: "status", state: "loading", progress: pct });
      });
      self.postMessage({ type: "status", state: "ready", progress: 100 });

      const messages = [
        {
          role: "system",
          content:
            "당신은 간결한 과학·AI 연구 요약가입니다. 과장된 수식어나 이모지 없이 핵심 사실만 한국어 2문장 이내로 요약하세요.",
        },
        {
          role: "user",
          content: `제목: ${title}\n원문: ${text}\n\n위 내용을 한국어 2문장으로 간결하게 요약하세요:`,
        },
      ];

      const output = await generator(messages, {
        max_new_tokens: 130,
        temperature: 0.2,
        do_sample: false,
      });

      const generated = output?.[0]?.generated_text;
      let summary = "";
      if (Array.isArray(generated)) {
        const lastMsg = generated[generated.length - 1];
        summary = typeof lastMsg?.content === "string" ? lastMsg.content.trim() : "";
      } else if (typeof generated === "string") {
        summary = generated.trim();
      }

      self.postMessage({
        type: "result",
        id,
        summary: summary.replace(/^요약:\s*/i, "").trim(),
      });
    } catch (err) {
      self.postMessage({
        type: "result_error",
        id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
});
