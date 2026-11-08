"use client";

import React from "react";
import {
  IconCheckCircle,
  IconErrorCircle,
  IconExclamationTriangle,
  IconInfoCircle,
  IconPause,
  IconPlay,
  IconXMark,
} from "./icons";

export interface AlertProps {
  /** Bold concise alert headline. */
  title: string;
  /** Descriptive body explaining the cause and remediation. */
  description?: string;
  /** Semantic status variant matching the severity. */
  variant?: "info" | "success" | "warning" | "error";
  /** Visual presentation style. */
  styleVariant?: "soft" | "outline" | "default";
  /** Concrete verb action button label (e.g. '다시 시도', '저장소 비우기'). */
  actionLabel?: string;
  /** Callback for primary concrete verb action. */
  onAction?: () => void;
  /** Callback for secondary cancel action. */
  onCancel?: () => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Alert({
  title,
  description,
  variant = "info",
  styleVariant = "soft",
  actionLabel,
  onAction,
  onCancel,
  className = "",
}: AlertProps) {
  const colorClass =
    variant === "success"
      ? "alert-success"
      : variant === "warning"
      ? "alert-warning"
      : variant === "error"
      ? "alert-error"
      : "alert-info";

  const styleClass =
    styleVariant === "outline"
      ? "alert-outline"
      : styleVariant === "soft"
      ? "alert-soft"
      : "";

  const iconColorClass =
    variant === "success"
      ? "text-status-success bg-success/15"
      : variant === "warning"
      ? "text-status-warning bg-warning/15"
      : variant === "error"
      ? "text-status-error bg-error/15"
      : "text-status-info bg-info/15";

  const statusIcon =
    variant === "success" ? (
      <IconCheckCircle className="w-5 h-5" />
    ) : variant === "warning" ? (
      <IconExclamationTriangle className="w-5 h-5" />
    ) : variant === "error" ? (
      <IconErrorCircle className="w-5 h-5" />
    ) : (
      <IconInfoCircle className="w-5 h-5" />
    );

  return (
    <div
      role="alert"
      className={`alert ${colorClass} ${styleClass} sm:alert-horizontal rounded-2xl border border-base-content/15 shadow-xs p-4 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconColorClass}`}
      >
        {statusIcon}
      </span>
      <div className="space-y-0.5 text-start">
        <h4 className="text-sm font-bold text-base-content">{title}</h4>
        {description && (
          <p
            className="text-xs font-medium leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
      {(onCancel || (actionLabel && onAction)) && (
        <div className="flex items-center gap-2 shrink-0">
          {/* pstui Principle: Cancel ('취소') on Left, Concrete Verb on Right */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-xs btn-ghost rounded-xl border border-base-content/20 pst-press font-semibold text-base-content"
            >
              취소
            </button>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`btn btn-xs rounded-xl pst-press font-semibold ${
                variant === "warning"
                  ? "btn-warning text-neutral-900 font-bold"
                  : variant === "success"
                  ? "btn-success text-white"
                  : variant === "error"
                  ? "btn-error text-white"
                  : "btn-info text-white"
              }`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export interface ProgressProps {
  /** Current progress value. */
  value: number;
  /** Maximum progress value (defaults to 100). */
  max?: number;
  /** Specific ongoing task description required by DESIGN.md 7.6. */
  taskDescription: string;
  /** Semantic color variant. */
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  /** Whether the async task is currently paused. */
  isPaused?: boolean;
  /** Callback to toggle between paused and resuming state. */
  onTogglePause?: () => void;
  /** Callback to abort or cancel the progress operation. */
  onCancel?: () => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Progress({
  value,
  max = 100,
  taskDescription,
  color = "primary",
  isPaused = false,
  onTogglePause,
  onCancel,
  className = "",
}: ProgressProps) {
  const boundedValue = Math.min(max, Math.max(0, value));
  const percent = Math.round((boundedValue / (max || 100)) * 100);

  const colorClass =
    color === "secondary"
      ? "progress-secondary"
      : color === "success"
      ? "progress-success"
      : color === "warning"
      ? "progress-warning"
      : color === "error"
      ? "progress-error"
      : "progress-primary";

  return (
    <div
      className={`material-regular rounded-2xl p-4 shadow-xs space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-base-content truncate">
            {taskDescription}
          </p>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            {isPaused
              ? "작업이 일시 정지됨 — 데이터 손실 없이 재개할 수 있습니다"
              : `${percent}% 완료 (${boundedValue}/${max})`}
          </p>
        </div>
        <span className="badge badge-sm badge-soft badge-primary font-mono font-bold">
          {percent}%
        </span>
      </div>

      <progress
        className={`progress ${colorClass} w-full h-2.5`}
        value={boundedValue}
        max={max}
        aria-label={taskDescription}
      />

      {(onTogglePause || onCancel) && (
        <div className="flex items-center justify-end gap-2 pt-1">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-xs btn-ghost rounded-xl border border-base-content/20 pst-press font-semibold text-base-content inline-flex items-center gap-1"
            >
              <IconXMark className="w-3 h-3" />
              <span>취소</span>
            </button>
          )}
          {onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              className="btn btn-xs rounded-xl bg-primary/14 hover:bg-primary/22 text-accent-primary border border-primary/25 pst-press font-semibold inline-flex items-center gap-1"
            >
              {isPaused ? (
                <IconPlay className="w-3 h-3" />
              ) : (
                <IconPause className="w-3 h-3" />
              )}
              <span>{isPaused ? "계속 진행" : "일시 정지"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
