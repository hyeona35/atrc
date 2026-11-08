"use client";

import React, { useState } from "react";
import {
  activateWebGpuWorker,
  useOnDeviceAi,
} from "@/lib/ai/onDeviceLlm";
import {
  triggerPwaInstallPrompt,
  usePwaInstall,
} from "@/lib/pwaInstall";
import { Button } from "@/components/ui";
import {
  IconArrowPath,
  IconCheckCircle,
  IconDownload,
  IconSparkles,
} from "@/components/ui/icons";

export interface OnDeviceAiModalBodyProps {
  activeSources: string[];
  updatedAtIso?: string;
  isSyncing: boolean;
  onSyncNow: () => Promise<void>;
  onBatchSummarizeVisible: () => Promise<void>;
}

export function OnDeviceAiModalBody({
  activeSources,
  updatedAtIso,
  isSyncing,
  onSyncNow,
  onBatchSummarizeVisible,
}: OnDeviceAiModalBodyProps) {
  const aiStatus = useOnDeviceAi();
  const pwaState = usePwaInstall();
  const [pwaGuideMessage, setPwaGuideMessage] = useState<string | null>(null);

  const handleInstallClick = async () => {
    const outcome = await triggerPwaInstallPrompt();
    if (outcome === "accepted") {
      setPwaGuideMessage("Event Horizon 앱 설치가 완료되었습니다.");
    } else if (outcome === "manual_guide_needed") {
      setPwaGuideMessage(
        pwaState.isIosSafari
          ? "iOS/iPadOS Safari 하단 '공유' 버튼을 누른 뒤 '홈 화면에 추가'를 선택하면 독립형 앱으로 설치됩니다."
          : "브라우저 주소창 우측의 '앱 설치' 아이콘(또는 브라우저 메뉴 → 앱 설치 / 홈 화면에 추가)을 눌러 데스크톱·모바일 앱으로 설치할 수 있습니다."
      );
    }
  };

  return (
    <div className="space-y-6 text-sm text-base-content">
      {/* 1. PWA Standalone App Installation */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-base-content">
            데스크톱 · 모바일 앱 설치 (PWA)
          </h4>
          {pwaState.isStandalone && (
            <span className="text-xs font-semibold text-success inline-flex items-center gap-1">
              <IconCheckCircle className="w-3.5 h-3.5" />
              <span>독립형 앱 실행 중</span>
            </span>
          )}
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--label-secondary)" }}
        >
          브라우저 탭 없이 작업 표시줄·독(Dock) 또는 모바일 홈 화면에 독립 애플리케이션으로 설치하여 즉시 실행할 수 있습니다.
        </p>

        {!pwaState.isStandalone && (
          <Button
            variant={pwaState.canPromptNative ? "primary" : "soft"}
            size="sm"
            className="w-full"
            leadingIcon={<IconDownload className="w-4 h-4" />}
            onClick={handleInstallClick}
          >
            {pwaState.canPromptNative
              ? "Event Horizon 앱 바로 설치"
              : "기기별 앱 설치 방법 확인"}
          </Button>
        )}

        {pwaGuideMessage && (
          <p
            className="text-xs leading-relaxed p-3 rounded-2xl bg-base-200/70 border border-base-content/10"
            style={{ color: "var(--label-secondary)" }}
          >
            {pwaGuideMessage}
          </p>
        )}
      </div>

      {/* 2. Live Evergreen Pipeline */}
      <div className="pt-5 border-t border-base-content/10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-base-content">
            무중단 실시간 데이터 수집 파이프라인
          </h4>
          {updatedAtIso && (
            <span
              className="text-xs font-mono tabular-nums"
              style={{ color: "var(--label-secondary)" }}
            >
              최근 갱신{" "}
              {new Date(updatedAtIso).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--label-secondary)" }}
        >
          별도의 코드 배포 없이 5분 주기로 글로벌 공식 채널, 학술 아카이브, 모델 레지스트리를 자동 동기화합니다.
        </p>

        <div className="p-4 rounded-2xl material-regular space-y-2">
          <p className="text-xs font-semibold text-base-content">
            연결된 실시간 소스 ({activeSources.length}개)
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            {activeSources.length > 0
              ? activeSources.join(", ")
              : "OpenAI 공식, Google DeepMind, Hugging Face Papers, arXiv AI, Hacker News, OpenRouter Registry"}
          </p>
        </div>

        <Button
          variant="soft"
          size="sm"
          className="w-full"
          leadingIcon={<IconArrowPath className="w-4 h-4" />}
          isLoading={isSyncing}
          loadingLabel="실시간 피드 동기화 중…"
          onClick={() => onSyncNow()}
        >
          지금 최신 피드 동기화
        </Button>
      </div>

      {/* 3. On-Device LLM Summarizer */}
      <div className="pt-5 border-t border-base-content/10 space-y-3">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-base-content">
            온디바이스 LLM 자동 요약 엔진
          </h4>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            클라우드 서버 비용이나 개인정보 전송 없이 브라우저 내장 AI, 로컬 Ollama, 또는 WebGPU 경량 언어모델로 원문 초록을 한국어 2문장으로 정제합니다.
          </p>
        </div>

        <div className="rounded-2xl material-regular divide-y divide-base-content/10 text-xs">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <span className="font-semibold text-base-content">
              현재 활성 엔진
            </span>
            <span className="font-semibold text-accent-primary inline-flex items-center gap-1.5">
              <IconCheckCircle className="w-3.5 h-3.5" />
              <span>{aiStatus.engineLabel}</span>
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <span style={{ color: "var(--label-secondary)" }}>
              Chrome 내장 AI (Gemini Nano)
            </span>
            <span className="font-mono">
              {aiStatus.chromeBuiltinAvailable ? "사용 가능" : "미감지"}
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <span style={{ color: "var(--label-secondary)" }}>
              로컬 데스크톱 Ollama (11434)
            </span>
            <span className="font-mono">
              {aiStatus.ollamaModelName ?? "미연결"}
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <span style={{ color: "var(--label-secondary)" }}>
              브라우저 WebGPU 가속 지원
            </span>
            <span className="font-mono">
              {aiStatus.webGpuSupported ? "WebGPU 지원됨" : "WASM 폴백 모드"}
            </span>
          </div>
        </div>

        {aiStatus.workerState === "loading" && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--label-secondary)" }}>
                Qwen2.5-0.5B-Instruct 온디바이스 가중치 준비 중…
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {aiStatus.workerProgress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-base-content/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(4, aiStatus.workerProgress)}%` }}
              />
            </div>
          </div>
        )}

        {aiStatus.workerError && (
          <p className="text-xs text-error">
            온디바이스 워커 알림: {aiStatus.workerError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {aiStatus.workerState !== "ready" && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leadingIcon={<IconSparkles className="w-4 h-4" />}
              isLoading={aiStatus.workerState === "loading"}
              loadingLabel="모델 준비 중…"
              onClick={() => activateWebGpuWorker()}
            >
              브라우저 LLM 활성화 (Qwen2.5)
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            leadingIcon={<IconSparkles className="w-4 h-4" />}
            loadingLabel="요약 정제 중…"
            onClick={() => onBatchSummarizeVisible()}
          >
            상위 시그널 온디바이스 요약 실행
          </Button>
        </div>
      </div>
    </div>
  );
}
