import React from "react";
import { Link } from "next-view-transitions";
import { IconDocument, IconChevronLeft } from "@/components/ui/icons";
import { INCIDENT_CASE_FILES } from "@/lib/data/eventHorizonData";

export function generateStaticParams() {
  return INCIDENT_CASE_FILES.map((c) => ({ id: c.id }));
}

export default async function StandalonePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseFile = INCIDENT_CASE_FILES.find((c) => c.id === id);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl material-regular p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3 pb-4 border-b border-base-content/10">
          <Link
            href="/"
            className="btn btn-sm btn-ghost btn-circle rounded-xl pst-press text-base-content shrink-0"
            aria-label="관측 요약 화면으로 돌아가기"
          >
            <IconChevronLeft className="w-5 h-5" />
          </Link>
          <div className="space-y-1">
            {caseFile ? (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <IconDocument className="w-4 h-4 text-accent-primary" />
                  <span className="font-mono font-semibold text-base-content/75">
                    {caseFile.caseCode}
                  </span>
                  <span style={{ color: "var(--label-secondary)" }}>
                    {caseFile.statusLabel}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-base-content">
                  {caseFile.title}
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--label-secondary)" }}
                >
                  개설일 {caseFile.openedDate} · 발원 {caseFile.originatorHandles.join(", ")}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold tracking-tight text-base-content">
                  상세 기록 뷰 ({id})
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--label-secondary)" }}
                >
                  독립 전체 페이지 경로
                </p>
              </>
            )}
          </div>
        </div>

        {caseFile ? (
          <div className="space-y-4 text-xs leading-relaxed text-base-content">
            <div className="space-y-1">
              <strong className="font-bold block">최초 주장 요약</strong>
              <p style={{ color: "var(--label-secondary)" }}>
                {caseFile.claimSummary}
              </p>
            </div>
            <div className="pt-3 border-t border-base-content/10 space-y-1">
              <strong className="font-bold block">교차 검증 결과</strong>
              <p>{caseFile.findingSummary}</p>
            </div>
            <div className="pt-3 border-t border-base-content/10 space-y-2">
              <strong className="font-bold block">검증 타임라인</strong>
              <ol className="space-y-2 border-s border-base-content/15 ps-3.5">
                {caseFile.timelineLogs.map((log, idx) => (
                  <li key={idx}>
                    <span className="font-mono font-semibold text-base-content me-2">
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
        ) : (
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            직접 URL 접근을 통해 렌더링된 상세 화면입니다.
          </p>
        )}

        <div className="flex justify-end">
          <Link
            href="/"
            className="min-h-11 px-4 rounded-2xl text-xs font-semibold inline-flex items-center bg-primary text-primary-content pst-press"
          >
            관측소로 복귀
          </Link>
        </div>
      </div>
    </div>
  );
}
