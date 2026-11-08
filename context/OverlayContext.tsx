"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IconBellShield,
  IconCheckCircle,
  IconErrorCircle,
  IconExclamationTriangle,
  IconInfoCircle,
  IconXMark,
} from "@/components/ui/icons";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  undoLabel?: string;
  onUndo?: () => void;
  durationMs?: number;
}

export interface ModalOptions {
  id?: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isDirty?: boolean;
  onSaveDraft?: () => void;
  onDiscard?: () => void;
  size?: "sm" | "md" | "lg";
}

export interface AlertDialogOptions {
  title: string;
  description: string;
  actionVerb: string; // Concrete verb required by pstui (e.g. '삭제', '변환', '지우기') - never '확인' or '예'
  cancelLabel?: string; // Always defaults to '취소'
  isDestructive?: boolean;
  onAction: () => void | Promise<void>;
}

export interface PrePermissionModalOptions {
  title: string;
  description: string;
  featurePurpose: string;
  buttonLabel?: "계속" | "다음"; // Strictly '계속' or '다음' per pstui Pre-Alert rule
  onContinue: () => void | Promise<void>;
}

interface OverlayContextValue {
  activeModal: ModalOptions | null;
  isModalDirty: boolean;
  showDirtyGuardSheet: boolean;
  urgentAlert: AlertDialogOptions | null;
  prePermissionModal: PrePermissionModalOptions | null;
  toasts: ToastItem[];
  openModal: (options: ModalOptions) => void;
  closeModal: (force?: boolean) => void;
  setModalDirty: (dirty: boolean) => void;
  openAlertDialog: (options: AlertDialogOptions) => void;
  closeAlertDialog: () => void;
  openPrePermissionModal: (options: PrePermissionModalOptions) => void;
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return ctx;
}

export function useModal() {
  const {
    activeModal,
    isModalDirty,
    showDirtyGuardSheet,
    urgentAlert,
    prePermissionModal,
    openModal,
    closeModal,
    setModalDirty,
    openAlertDialog,
    closeAlertDialog,
    openPrePermissionModal,
  } = useOverlay();

  return {
    activeModal,
    isModalDirty,
    showDirtyGuardSheet,
    urgentAlert,
    prePermissionModal,
    openModal,
    closeModal,
    setModalDirty,
    openAlertDialog,
    closeAlertDialog,
    openPrePermissionModal,
  };
}

export function useToast() {
  const { toasts, showToast, dismissToast } = useOverlay();
  return { toasts, showToast, dismissToast };
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalOptions | null>(null);
  const [isModalDirty, setIsModalDirty] = useState<boolean>(false);
  const [showDirtyGuardSheet, setShowDirtyGuardSheet] = useState<boolean>(false);
  const [urgentAlert, setUrgentAlert] = useState<AlertDialogOptions | null>(null);
  const [prePermissionModal, setPrePermissionModal] =
    useState<PrePermissionModalOptions | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isAlertSubmitting, setIsAlertSubmitting] = useState<boolean>(false);

  const modalBoxRef = useRef<HTMLDivElement | null>(null);
  const dirtySheetRef = useRef<HTMLDivElement | null>(null);
  const urgentAlertRef = useRef<HTMLDivElement | null>(null);
  const prePermissionRef = useRef<HTMLDivElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = toast.durationMs ?? 4500;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  const openModal = useCallback((options: ModalOptions) => {
    // Prevent nested modals: replace activeModal cleanly
    setPrePermissionModal(null);
    setShowDirtyGuardSheet(false);
    setIsModalDirty(Boolean(options.isDirty));
    setActiveModal(options);
  }, []);

  const closeModal = useCallback(
    (force = false) => {
      if (!force && isModalDirty) {
        setShowDirtyGuardSheet(true);
        return;
      }
      setShowDirtyGuardSheet(false);
      setIsModalDirty(false);
      setActiveModal(null);
    },
    [isModalDirty]
  );

  const setModalDirty = useCallback((dirty: boolean) => {
    setIsModalDirty(dirty);
  }, []);

  const openAlertDialog = useCallback((options: AlertDialogOptions) => {
    const sanitizedVerb =
      options.actionVerb === "확인" ||
      options.actionVerb.toLowerCase() === "ok" ||
      options.actionVerb === "예" ||
      options.actionVerb.toLowerCase() === "yes"
        ? "실행"
        : options.actionVerb;
    setUrgentAlert({
      ...options,
      actionVerb: sanitizedVerb,
      cancelLabel: "취소",
    });
  }, []);

  const closeAlertDialog = useCallback(() => {
    setIsAlertSubmitting(false);
    setUrgentAlert(null);
  }, []);

  const openPrePermissionModal = useCallback((options: PrePermissionModalOptions) => {
    setActiveModal(null);
    setShowDirtyGuardSheet(false);
    setPrePermissionModal({
      ...options,
      buttonLabel: options.buttonLabel === "다음" ? "다음" : "계속",
    });
  }, []);

  // Keyboard Focus Trap, Initial Focus & Escape Handling for Topmost Active Overlay
  useEffect(() => {
    const isAnyModalOpen = Boolean(activeModal || urgentAlert || prePermissionModal);
    if (!isAnyModalOpen) {
      if (previousFocusedElementRef.current) {
        previousFocusedElementRef.current.focus();
        previousFocusedElementRef.current = null;
      }
      return;
    }

    // Lock body scroll while modal or dialog is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (
      !previousFocusedElementRef.current &&
      document.activeElement instanceof HTMLElement
    ) {
      previousFocusedElementRef.current = document.activeElement;
    }

    const getTopmostContainer = (): HTMLElement | null => {
      if (urgentAlert) return urgentAlertRef.current;
      if (showDirtyGuardSheet) return dirtySheetRef.current;
      if (prePermissionModal) return prePermissionRef.current;
      if (activeModal) return modalBoxRef.current;
      return null;
    };

    const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
      const nodes = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter((el) => !el.closest("[inert]"));
    };

    // Move focus into the topmost dialog/sheet when it opens
    const focusTimer = window.setTimeout(() => {
      const container = getTopmostContainer();
      if (!container) return;
      if (!container.contains(document.activeElement)) {
        const focusable = getFocusableElements(container);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          container.focus();
        }
      }
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (urgentAlert) {
          closeAlertDialog();
          return;
        }
        if (showDirtyGuardSheet) {
          setShowDirtyGuardSheet(false);
          return;
        }
        if (activeModal) {
          closeModal(false);
          return;
        }
      }

      if (event.key === "Tab") {
        const container = getTopmostContainer();
        if (!container) return;
        const focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;

        if (!activeEl || !container.contains(activeEl)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
          return;
        }

        if (event.shiftKey && activeEl === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && activeEl === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [
    activeModal,
    urgentAlert,
    prePermissionModal,
    showDirtyGuardSheet,
    closeModal,
    closeAlertDialog,
  ]);

  const handleDiscardDirty = () => {
    activeModal?.onDiscard?.();
    closeModal(true);
    showToast({
      title: "편집 내용이 삭제되었습니다",
      variant: "info",
    });
  };

  const handleSaveDraftDirty = () => {
    activeModal?.onSaveDraft?.();
    closeModal(true);
    showToast({
      title: "초안이 임시 저장되었습니다",
      description: "언제든지 이어서 작성할 수 있습니다.",
      variant: "success",
    });
  };

  const handleContinueEditing = () => {
    setShowDirtyGuardSheet(false);
  };

  const handleAlertAction = async () => {
    if (!urgentAlert) return;
    try {
      setIsAlertSubmitting(true);
      await urgentAlert.onAction();
      closeAlertDialog();
    } finally {
      setIsAlertSubmitting(false);
    }
  };

  return (
    <OverlayContext.Provider
      value={{
        activeModal,
        isModalDirty,
        showDirtyGuardSheet,
        urgentAlert,
        prePermissionModal,
        toasts,
        openModal,
        closeModal,
        setModalDirty,
        openAlertDialog,
        closeAlertDialog,
        openPrePermissionModal,
        showToast,
        dismissToast,
      }}
    >
      {children}

      {/* 1. Primary Semantic Modal (<dialog>) with Dirty State Guard */}
      {activeModal && (
        <dialog
          open
          aria-modal="true"
          aria-labelledby="pst-modal-title"
          className="modal modal-open z-40 transition-all duration-300 ease-out"
          style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
        >
          <div
            ref={modalBoxRef}
            className={`modal-box liquid-glass-elevated rounded-2xl transition-all duration-300 ease-out relative overflow-hidden ${
              activeModal.size === "sm"
                ? "max-w-md"
                : activeModal.size === "lg"
                ? "max-w-2xl"
                : "max-w-lg"
            }`}
          >
            <div
              inert={showDirtyGuardSheet || undefined}
              className="flex items-start justify-between gap-3 pb-3 border-b"
              style={{ borderColor: "var(--separator)" }}
            >
              <div>
                <h3
                  id="pst-modal-title"
                  className="text-lg font-bold tracking-tight text-base-content"
                >
                  {activeModal.title}
                </h3>
                {activeModal.description && (
                  <p
                    className="text-sm font-medium mt-0.5"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {activeModal.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => closeModal(false)}
                aria-label="모달 닫기"
                className="btn btn-ghost btn-circle btn-sm pst-press text-base-content"
              >
                <IconXMark className="w-5 h-5" />
              </button>
            </div>

            <div inert={showDirtyGuardSheet || undefined} className="py-4">
              {activeModal.content}
            </div>

            {/* Dirty State Action Sheet Guard (Triggered on Backdrop / ESC / Close when isModalDirty === true) */}
            {showDirtyGuardSheet && (
              <div
                ref={dirtySheetRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="dirty-sheet-title"
                className="inset-0 absolute z-50 flex flex-col justify-end p-4 transition-all duration-300 ease-out"
                style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
              >
                <div className="liquid-glass-elevated rounded-2xl p-4 space-y-2.5">
                  <div
                    className="text-center pb-2.5 border-b"
                    style={{ borderColor: "var(--separator)" }}
                  >
                    <p
                      id="dirty-sheet-title"
                      className="text-sm font-bold text-base-content"
                    >
                      저장하지 않은 변경 사항이 있습니다
                    </p>
                    <p
                      className="text-xs font-medium mt-0.5"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      지금 닫으면 입력 중인 데이터를 잃게 됩니다.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDiscardDirty}
                      className="btn btn-error w-full rounded-xl pst-press font-semibold"
                    >
                      편집 내용 삭제
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraftDirty}
                      className="btn btn-primary w-full rounded-xl pst-press font-semibold"
                    >
                      임시 저장
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueEditing}
                      className="btn btn-ghost w-full rounded-xl border border-base-content/20 pst-press font-semibold text-base-content"
                    >
                      계속 편집
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="modal-backdrop"
            onClick={() => closeModal(false)}
            aria-hidden="true"
          />
        </dialog>
      )}

      {/* 2. Single Allowed Urgent AlertDialog Exception */}
      {urgentAlert && (
        <dialog
          open
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="urgent-alert-title"
          aria-describedby="urgent-alert-desc"
          className="modal modal-open z-50 transition-all duration-300 ease-out"
          style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
        >
          <div
            ref={urgentAlertRef}
            className="modal-box max-w-sm liquid-glass-elevated rounded-2xl p-6 text-center"
          >
            <div
              className={`mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full ${
                urgentAlert.isDestructive
                  ? "bg-error/15 text-status-error"
                  : "bg-primary/14 text-accent-primary"
              }`}
            >
              {urgentAlert.isDestructive ? (
                <IconExclamationTriangle className="w-6 h-6" />
              ) : (
                <IconInfoCircle className="w-6 h-6" />
              )}
            </div>
            <h3
              id="urgent-alert-title"
              className="text-lg font-bold text-base-content"
            >
              {urgentAlert.title}
            </h3>
            <p
              id="urgent-alert-desc"
              className="text-sm font-medium mt-2 leading-relaxed"
              style={{ color: "var(--label-secondary)" }}
            >
              {urgentAlert.description}
            </p>

            {/* pstui Principle: Cancel ('취소') on Left (or bottom of stack), Concrete Verb Action on Right (or top of stack) */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={closeAlertDialog}
                className="btn btn-ghost flex-1 rounded-xl border border-base-content/20 pst-press font-semibold text-base-content"
              >
                {urgentAlert.cancelLabel ?? "취소"}
              </button>
              <button
                type="button"
                disabled={isAlertSubmitting}
                onClick={handleAlertAction}
                className={`btn flex-1 rounded-xl pst-press font-semibold ${
                  urgentAlert.isDestructive ? "btn-error" : "btn-primary"
                }`}
              >
                {isAlertSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                      />
                    </svg>
                    {`${urgentAlert.actionVerb} 중…`}
                  </span>
                ) : (
                  urgentAlert.actionVerb
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={closeAlertDialog}
            aria-hidden="true"
          />
        </dialog>
      )}

      {/* 3. Pre-Permission Screen (Single '계속' or '다음' button, no close/cancel, no dark patterns) */}
      {prePermissionModal && (
        <dialog
          open
          aria-modal="true"
          aria-labelledby="pre-permission-title"
          className="modal modal-open z-50 transition-all duration-300 ease-out"
          style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
        >
          <div
            ref={prePermissionRef}
            className="modal-box max-w-md liquid-glass-elevated rounded-2xl p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/14 text-accent-primary border border-primary/25">
              <IconBellShield className="w-7 h-7" />
            </div>
            <h3
              id="pre-permission-title"
              className="text-xl font-bold text-base-content"
            >
              {prePermissionModal.title}
            </h3>
            <p
              className="text-sm font-medium mt-2 leading-relaxed"
              style={{ color: "var(--label-secondary)" }}
            >
              {prePermissionModal.description}
            </p>
            <div className="mt-4 rounded-xl material-regular p-3.5 text-start text-xs leading-relaxed">
              <span className="font-bold text-base-content">활용 목적: </span>
              <span
                className="font-medium"
                style={{ color: "var(--label-secondary)" }}
              >
                {prePermissionModal.featurePurpose}
              </span>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={async () => {
                  const action = prePermissionModal.onContinue;
                  setPrePermissionModal(null);
                  await action();
                }}
                className="btn btn-primary w-full rounded-xl pst-press font-semibold"
              >
                {prePermissionModal.buttonLabel ?? "계속"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* 4. Floating Bottom Toast Container (Liquid Glass Notification Bubbles with Undo Support) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="toast toast-center toast-bottom z-50 w-full max-w-md px-4 pointer-events-none"
        style={{
          bottom:
            "calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0px) + 16px)",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto liquid-glass-elevated rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition-all duration-300 ease-out"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Non-color vector status icon for accessibility */}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  t.variant === "success"
                    ? "bg-success/15 text-status-success"
                    : t.variant === "warning"
                    ? "bg-warning/15 text-status-warning"
                    : t.variant === "error"
                    ? "bg-error/15 text-status-error"
                    : "bg-info/15 text-status-info"
                }`}
                aria-hidden="true"
              >
                {t.variant === "success" ? (
                  <IconCheckCircle className="w-5 h-5" />
                ) : t.variant === "warning" ? (
                  <IconExclamationTriangle className="w-5 h-5" />
                ) : t.variant === "error" ? (
                  <IconErrorCircle className="w-5 h-5" />
                ) : (
                  <IconInfoCircle className="w-5 h-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-base-content truncate">
                  {t.title}
                </p>
                {t.description && (
                  <p
                    className="text-xs font-medium line-clamp-2 break-keep"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {t.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {t.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    t.onUndo?.();
                    dismissToast(t.id);
                  }}
                  className="btn btn-xs btn-primary rounded-lg pst-press px-3 font-semibold"
                >
                  {t.undoLabel ?? "실행 취소"}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="알림 닫기"
                className="btn btn-ghost btn-circle btn-xs pst-press text-base-content"
              >
                <IconXMark className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </OverlayContext.Provider>
  );
}
