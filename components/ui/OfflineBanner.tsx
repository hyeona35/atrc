"use client";

import React, { useEffect, useState } from "react";
import { offlineQueue, type QueuedAction } from "@/lib/offlineQueue";
import { IconExclamationTriangle, IconArrowPath, IconCheckCircle } from "./icons";
import { triggerHaptic } from "@/lib/haptics";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queuedItems, setQueuedItems] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((queue, online) => {
      setIsOnline(online);
      setQueuedItems(queue);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    triggerHaptic("medium");
    const result = await offlineQueue.flush();
    setIsSyncing(false);
    if (result.success > 0) {
      setSyncSuccess(true);
      triggerHaptic("selection");
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  if (isOnline && queuedItems.length === 0 && !syncSuccess) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 end-4 z-40 max-w-sm w-[calc(100%-2rem)] transition-all duration-300 ease-out"
    >
      {!isOnline ? (
        <div className="liquid-glass-elevated rounded-2xl p-3 border border-warning/30 shadow-lg flex items-center justify-between gap-3 text-xs bg-warning/10 text-neutral-900 dark:text-neutral-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-lg bg-warning/20 text-warning shrink-0">
              <IconExclamationTriangle className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="font-bold truncate">오프라인 모드 작동 중</p>
              <p className="text-[11px] opacity-80 truncate">
                {queuedItems.length > 0
                  ? `${queuedItems.length}개 작업이 대기열에 저장됨`
                  : "네트워크 재연결 시 자동 동기화됩니다"}
              </p>
            </div>
          </div>
          <span className="badge badge-xs badge-warning font-bold shrink-0">
            오프라인
          </span>
        </div>
      ) : syncSuccess ? (
        <div className="liquid-glass-elevated rounded-2xl p-3 border border-success/30 shadow-lg flex items-center gap-2 text-xs bg-success/10 text-neutral-900 dark:text-neutral-100">
          <IconCheckCircle className="w-4 h-4 text-success shrink-0" />
          <span className="font-semibold">대기열 작업이 정상 동기화되었습니다</span>
        </div>
      ) : queuedItems.length > 0 ? (
        <div className="liquid-glass-elevated rounded-2xl p-3 border border-info/30 shadow-lg flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-base-content truncate">동기화 대기 중인 작업</p>
            <p className="text-[11px] text-base-content/70 truncate">
              {queuedItems.length}개의 오프라인 작업 동기화 대기
            </p>
          </div>
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleManualSync}
            className="btn btn-xs btn-primary rounded-xl pst-press font-semibold shrink-0"
          >
            <IconArrowPath className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "동기화 중…" : "지금 동기화"}</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}
