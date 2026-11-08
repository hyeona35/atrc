import React from "react";

// Re-export interactive client components with use client boundary
export {
  Alert,
  type AlertProps,
  Progress,
  type ProgressProps,
} from "./FeedbackClient";

export { ErrorBoundary, type ErrorBoundaryProps } from "./ErrorBoundary";
export { EmptyState, type EmptyStateProps } from "./EmptyState";

export interface IndicatorProps {
  /** Text or numerical count to display inside the corner badge (defaults to 'NEW'). */
  badgeText?: string;
  /** Horizontal anchor alignment of the indicator badge. */
  horizontal?: "start" | "center" | "end";
  /** Vertical anchor alignment of the indicator badge. */
  vertical?: "top" | "middle" | "bottom";
  /** Semantic color variant matching the status of the indicator. */
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  /** Target element to which the indicator badge is anchored. */
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

export function Indicator({
  badgeText = "NEW",
  horizontal = "end",
  vertical = "top",
  color = "primary",
  children,
  className = "",
}: IndicatorProps) {
  const hClass =
    horizontal === "start"
      ? "indicator-start"
      : horizontal === "center"
      ? "indicator-center"
      : "indicator-end";
  const vClass =
    vertical === "middle"
      ? "indicator-middle"
      : vertical === "bottom"
      ? "indicator-bottom"
      : "indicator-top";
  const badgeColor =
    color === "secondary"
      ? "badge-secondary"
      : color === "success"
      ? "badge-success"
      : color === "warning"
      ? "badge-warning"
      : color === "error"
      ? "badge-error"
      : "badge-primary";

  return (
    <div className={`indicator ${className}`}>
      {/* DaisyUI rule: indicator-item MUST come before main content */}
      <span
        className={`indicator-item ${hClass} ${vClass} badge badge-xs ${badgeColor} font-bold px-1.5 py-2 shadow-2xs`}
      >
        {badgeText}
      </span>
      <div>{children}</div>
    </div>
  );
}

export interface RadialProgressProps {
  /** Numeric progress value between 0 and 100. */
  value: number;
  /** Diameter size in rem (defaults to 5rem = 80px). */
  sizeRem?: number;
  /** Ring stroke thickness in pixels (defaults to 7px). */
  thicknessPx?: number;
  /** Optional accessible label for screen readers. */
  label?: string;
  /** Semantic color variant for the progress ring. */
  color?: "primary" | "secondary" | "success" | "warning" | "error";
  /** Additional CSS class names. */
  className?: string;
}

export function RadialProgress({
  value,
  sizeRem = 5,
  thicknessPx = 7,
  label,
  color = "primary",
  className = "",
}: RadialProgressProps) {
  const bounded = Math.min(100, Math.max(0, Math.round(value)));
  const strokeColor =
    color === "secondary"
      ? "var(--surface-secondary-solid)"
      : color === "success"
      ? "var(--surface-success-solid)"
      : color === "warning"
      ? "var(--surface-warning-solid)"
      : color === "error"
      ? "var(--surface-error-solid)"
      : "var(--surface-primary-solid)";

  // Subpixel SVG vector circle geometry for anti-aliasing per Requirement 8
  const viewBoxSize = 100;
  const strokeWidth = (thicknessPx / (sizeRem * 16)) * viewBoxSize;
  const radius = (viewBoxSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (bounded / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={bounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `진행률 ${bounded}%`}
        style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem` }}
        className="relative flex items-center justify-center select-none"
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full -rotate-90 transform"
          shapeRendering="geometricPrecision"
          style={{ overflow: "visible" }}
        >
          {/* Anti-aliased Track */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            stroke="var(--separator)"
            strokeWidth={strokeWidth}
            fill="none"
            opacity="0.35"
          />
          {/* Anti-aliased Progress Ring */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <span className="absolute font-mono text-sm font-bold text-base-content tracking-tight">
          {bounded}%
        </span>
      </div>
      {label && (
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--label-secondary)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export interface TooltipProps {
  /** Tooltip guidance text displayed on hover or focus. */
  tip: string;
  /** Direction from which the tooltip emerges relative to the trigger element. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Semantic color variant of the tooltip bubble. */
  color?: "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error";
  /** Force tooltip open state (useful for keyboard or programmatic control). */
  open?: boolean;
  /** Interactive element that triggers the tooltip on hover or focus. */
  children: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

export function Tooltip({
  tip,
  placement = "top",
  color = "default",
  open = false,
  children,
  className = "",
}: TooltipProps) {
  const placeClass =
    placement === "bottom"
      ? "tooltip-bottom"
      : placement === "left"
      ? "tooltip-left"
      : placement === "right"
      ? "tooltip-right"
      : "tooltip-top";

  const colorClass =
    color === "primary"
      ? "tooltip-primary"
      : color === "secondary"
      ? "tooltip-secondary"
      : color === "info"
      ? "tooltip-info"
      : color === "success"
      ? "tooltip-success"
      : color === "warning"
      ? "tooltip-warning"
      : color === "error"
      ? "tooltip-error"
      : "";

  return (
    <div
      data-tip={tip}
      className={`tooltip ${placeClass} ${colorClass} ${
        open ? "tooltip-open" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
