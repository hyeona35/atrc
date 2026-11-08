"use client";

import React, { Suspense, use } from "react";
import { useRouter } from "next/navigation";
import { IconXMark, IconDocument } from "@/components/ui/icons";
import { triggerHaptic } from "@/lib/haptics";
import { INCIDENT_CASE_FILES } from "@/lib/data/eventHorizonData";

function InterceptedPreviewModalContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const caseFile = INCIDENT_CASE_FILES.find((c) => c.id === id);

  const handleClose = React.useCallback(() => {
    triggerHaptic("light");
    router.back();
  }, [router]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 transition-opacity duration-300"
        style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl liquid-glass-elevated rounded-3xl p-6 sm:p-7 shadow-2xl border border-base-content/15 z-10 transition-all duration-300 max-h-[88dvh] overflow-y-auto space-y-5">
        {caseFile ? (
          <>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-base-content/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <IconDocument className="w-4 h-4 text-accent-primary" />
                  <span className="font-mono font-semibold text-base-content/75">
                    {caseFile.caseCode}
                  </span>
                  <span style={{ color: "var(--label-secondary)" }}>
                    {caseFile.statusLabel}
                  </span>
                </div>
                <h3
                  id="modal-preview-title"
                  className="text-lg font-extrabold tracking-tight text-base-content leading-snug"
                >
                  {caseFile.title}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--label-secondary)" }}
                >
                  개설일 {caseFile.openedDate} · 발원 {caseFile.originatorHandles.join(", ")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="교차검증 기록 모달 닫기"
                className="btn btn-ghost btn-circle btn-sm rounded-xl pst-press text-base-content shrink-0"
              >
                <IconXMark className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-base-content">
              <div className="space-y-1">
                <p className="text-xs font-bold text-base-content">
                  최초 주장 요약
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {caseFile.claimSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-base-content/10 space-y-1">
                <p className="text-xs font-bold text-base-content">
                  교차 검증 결과
                </p>
                <p className="text-xs leading-relaxed text-base-content">
                  {caseFile.findingSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-base-content/10 space-y-2">
                <p className="text-xs font-bold text-base-content">
                  검증 타임라인
                </p>
                <ol className="space-y-2 border-s border-base-content/15 ps-3.5 text-xs">
                  {caseFile.timelineLogs.map((log, idx) => (
                    <li key={idx} className="space-y-0.5">
                      <span className="font-mono font-semibold text-base-content block">
                        {log.date}
                      </span>
                      <span style={{ color: "var(--label-secondary)" }}>
                        {log.event}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-11 px-4 rounded-2xl text-xs font-semibold bg-primary text-primary-content pst-press"
              >
                기록 닫기
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-base-content/10">
              <div>
                <h3
                  id="modal-preview-title"
                  className="text-lg font-bold tracking-tight text-base-content"
                >
                  항목 상세 프리뷰 ({id})
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--label-secondary)" }}
                >
                  라우트 인터셉션 모달 (/preview/{id})
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="프리뷰 닫기"
                className="btn btn-ghost btn-circle btn-sm rounded-xl pst-press text-base-content"
              >
                <IconXMark className="w-4 h-4" />
              </button>
            </div>

            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--label-secondary)" }}
            >
              요청한 기록 항목을 찾을 수 없거나 일반 프리뷰 경로입니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function InterceptedPreviewModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <InterceptedPreviewModalContent params={params} />
    </Suspense>
  );
}
