"use client";

import React from "react";

import { triggerHaptic } from "@/lib/haptics";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual presentation variant matching design tokens. */
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "soft"
    | "ghost"
    | "outline"
    | "destructive";
  /** Touch hit and dimension size variant. */
  size?: "xs" | "sm" | "md" | "lg";
  /** External loading state controlling pending spinner. */
  isLoading?: boolean;
  /** Label text displayed alongside spinner during pending state (e.g. '저장 중…', '결제 중…'). */
  loadingLabel?: string;
  /** Automatically appends ellipsis '…' when clicking triggers modal/dialog view. */
  opensModal?: boolean;
  /** Protects against duplicate submissions during pending execution. */
  preventDoubleClick?: boolean;
  /** Leading icon node. */
  leadingIcon?: React.ReactNode;
  /** Trailing icon node. */
  trailingIcon?: React.ReactNode;
}

/**
 * Human-centric primary/secondary action button for pstui.
 * Includes double-click protection, inline pending state, modal ellipsis '…' formatting,
 * and minimum 44px touch hit area per HIG guidelines.
 */
export function Button({
  variant = "default",
  size = "md",
  isLoading = false,
  loadingLabel = "저장 중…",
  opensModal = false,
  preventDoubleClick = true,
  leadingIcon,
  trailingIcon,
  children,
  className = "",
  disabled,
  type = "button",
  onClick,
  onKeyDown,
  ...rest
}: ButtonProps) {
  const [internalPending, setInternalPending] = React.useState<boolean>(false);
  const clickLockRef = React.useRef<boolean>(false);

  const isDestructive = variant === "destructive";
  // pstui Principle: Never bind type="submit" or Enter default execution to destructive buttons
  const resolvedType = isDestructive ? "button" : type;
  const effectiveLoading = isLoading || internalPending;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (preventDoubleClick) {
      if (clickLockRef.current) {
        e.preventDefault();
        return;
      }
      clickLockRef.current = true;
      setTimeout(() => {
        clickLockRef.current = false;
      }, 500);
    }

    triggerHaptic("light");

    if (onClick) {
      const result = onClick(e) as unknown;
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setInternalPending(true);
        try {
          await (result as Promise<unknown>);
        } finally {
          setInternalPending(false);
          clickLockRef.current = false;
        }
      }
    }
  };

  const variantClass =
    variant === "primary"
      ? "btn-primary text-primary-content shadow-xs"
      : variant === "secondary"
      ? "btn-secondary text-secondary-content shadow-xs"
      : variant === "soft"
      ? "bg-primary/14 hover:bg-primary/22 text-accent-primary border border-primary/25"
      : variant === "ghost"
      ? "btn-ghost text-base-content hover:bg-base-content/10"
      : variant === "outline"
      ? "btn-outline border-base-content/25 text-base-content hover:bg-base-content/8"
      : isDestructive
      ? "btn-error text-error-content shadow-xs"
      : "bg-base-100 border border-base-content/20 text-base-content hover:bg-base-200";

  const sizeClass =
    size === "xs"
      ? "btn-xs"
      : size === "sm"
      ? "btn-sm"
      : size === "lg"
      ? "btn-lg"
      : "btn-md";

  const formattedLabel =
    opensModal && typeof children === "string" && !children.endsWith("…")
      ? `${children}…`
      : children;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDestructive && e.key === "Enter") {
      e.preventDefault();
      return;
    }
    onKeyDown?.(e);
  };

  return (
    <button
      type={resolvedType}
      disabled={disabled || effectiveLoading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`btn ${variantClass} ${sizeClass} rounded-2xl pst-press font-semibold inline-flex items-center justify-center gap-2 ${className}`}
      {...rest}
    >
      {effectiveLoading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
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
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {leadingIcon && (
            <span className="shrink-0 inline-flex items-center">
              {leadingIcon}
            </span>
          )}
          <span>{formattedLabel}</span>
          {trailingIcon && (
            <span className="shrink-0 inline-flex items-center">
              {trailingIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export interface ToggleButtonProps {
  /** Visible label text. */
  label: string;
  /** Whether the toggle button is in pressed/active state. */
  active: boolean;
  /** Callback fired when pressed state toggles. */
  onToggle: (active: boolean) => void;
  /** Optional icon node. */
  icon?: React.ReactNode;
}

/**
 * Toolbar and standalone toggle button with explicit state badge and accessible aria-pressed.
 */
export function ToggleButton({
  label,
  active,
  onToggle,
  icon,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onToggle(!active)}
      className={`btn btn-sm rounded-2xl pst-press font-semibold flex items-center gap-1.5 transition-all duration-300 ease-out ${
        active
          ? "bg-primary text-primary-content border-primary shadow-xs"
          : "bg-base-100 text-base-content border-base-content/25 hover:bg-base-200"
      }`}
    >
      {icon && <span className="shrink-0 inline-flex items-center">{icon}</span>}
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
          active
            ? "bg-primary-content/20 text-primary-content"
            : "bg-base-content/10 text-base-content"
        }`}
      >
        {active ? "켜짐" : "꺼짐"}
      </span>
    </button>
  );
}
