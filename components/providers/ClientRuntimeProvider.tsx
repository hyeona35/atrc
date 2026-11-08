"use client";

import React, { useEffect } from "react";
import { initPwaInstallListener } from "@/lib/pwaInstall";

/**
 * ClientRuntimeProvider
 * Handles:
 * 1. Automatic stale Next.js chunk 404 error recovery
 * 2. Early beforeinstallprompt listener & Service Worker registration for PWA installation
 */
export function ClientRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPwaInstallListener();

    // 1. Stale Chunk 404 Mitigation for Long Sessions
    const isChunkError = (err: unknown): boolean => {
      if (!err) return false;
      const str = String(err);
      return (
        str.includes("ChunkLoadError") ||
        str.includes("Loading chunk") ||
        str.includes("Failed to fetch dynamically imported module") ||
        str.includes("_next/static/chunks")
      );
    };

    const handleChunkError = (err: unknown) => {
      if (!isChunkError(err)) return;
      const now = Date.now();
      let lastRetry: string | null = null;
      try {
        lastRetry = sessionStorage.getItem("eh_chunk_retry");
      } catch {
        // Storage disabled in restricted mode
      }

      if (!lastRetry || now - Number(lastRetry) > 15000) {
        try {
          sessionStorage.setItem("eh_chunk_retry", now.toString());
        } catch {
          // Ignore storage quota error
        }
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
        window.location.reload();
      }
    };

    const onError = (event: ErrorEvent) => {
      handleChunkError(event.error ?? event.message);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleChunkError(event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    // 2. PWA Service Worker Registration (HTTPS & localhost)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (
                  installing.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // Updated worker ready on next navigation
                }
              };
            }
          };
        })
        .catch(() => {
          // Ignore SW registration error in restricted sandboxes
        });
    }

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
