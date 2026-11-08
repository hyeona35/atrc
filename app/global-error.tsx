"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log fatal global error
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-dvh flex items-center justify-center p-6 bg-slate-900 text-white font-sans">
        <div className="max-w-md w-full rounded-3xl p-8 text-center space-y-6 bg-slate-800/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              시스템 복구 모드
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              치명적인 렌더링 오류가 발생했습니다. 아래 버튼을 눌러 애플리케이션을 초기화하십시오.
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500 font-mono">
                오류 코드: {error.digest}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-3 px-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition-all shadow-lg cursor-pointer"
            >
              애플리케이션 다시 시작
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="w-full py-2 px-3 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
