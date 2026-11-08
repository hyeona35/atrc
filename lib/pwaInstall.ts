"use client";

import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface PwaInstallState {
  isStandalone: boolean;
  canPromptNative: boolean;
  isIosSafari: boolean;
}

const SERVER_SNAPSHOT: PwaInstallState = {
  isStandalone: false,
  canPromptNative: false,
  isIosSafari: false,
};

let deferredPromptEvent: BeforeInstallPromptEvent | null = null;
let state: PwaInstallState = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();
let initialized = false;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function refreshEnvironmentFlags() {
  if (typeof window === "undefined") return;
  const standaloneMq = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = Boolean(
    (window.navigator as unknown as { standalone?: boolean }).standalone
  );
  const ua = window.navigator.userAgent || "";
  const isIos =
    /iphone|ipad|ipod/i.test(ua) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  state = {
    isStandalone: Boolean(standaloneMq || iosStandalone),
    canPromptNative: Boolean(deferredPromptEvent),
    isIosSafari: isIos && isSafari,
  };
  emit();
}

export function initPwaInstallListener(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  refreshEnvironmentFlags();

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPromptEvent = e as BeforeInstallPromptEvent;
    refreshEnvironmentFlags();
  });

  window.addEventListener("appinstalled", () => {
    deferredPromptEvent = null;
    state = { ...state, isStandalone: true, canPromptNative: false };
    emit();
  });

  const mq = window.matchMedia?.("(display-mode: standalone)");
  mq?.addEventListener?.("change", refreshEnvironmentFlags);
}

export function subscribePwaInstall(listener: () => void): () => void {
  initPwaInstallListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPwaInstallSnapshot(): PwaInstallState {
  return state;
}

export function getPwaInstallServerSnapshot(): PwaInstallState {
  return SERVER_SNAPSHOT;
}

export function usePwaInstall(): PwaInstallState {
  return useSyncExternalStore(
    subscribePwaInstall,
    getPwaInstallSnapshot,
    getPwaInstallServerSnapshot
  );
}

export async function triggerPwaInstallPrompt(): Promise<
  "accepted" | "dismissed" | "manual_guide_needed"
> {
  if (!deferredPromptEvent) {
    return "manual_guide_needed";
  }
  const promptEvent = deferredPromptEvent;
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  if (choice.outcome === "accepted") {
    deferredPromptEvent = null;
    refreshEnvironmentFlags();
    return "accepted";
  }
  return "dismissed";
}
