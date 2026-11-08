import React from "react";

export function StreamingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="파이프라인 상태 불러오는 중"
      className="pt-8 border-t border-base-content/10 space-y-4 animate-pulse"
    >
      <div className="h-3.5 w-48 rounded bg-base-content/10" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-base-content/10" />
            <div className="h-4 w-16 rounded bg-base-content/15" />
          </div>
        ))}
      </div>
    </div>
  );
}
