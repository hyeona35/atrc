import React from "react";
import { IconSearch } from "./icons";

export interface EmptyStateProps {
  /** Optional custom icon or illustration to render inside the pastel ring container. */
  icon?: React.ReactNode;
  /** Primary headline summarizing the empty state clearly. */
  title: string;
  /** Explanatory description providing guidance or context on how to populate data. */
  description?: string;
  /** Primary recovery action slot (e.g. create button, reset filter button). */
  action?: React.ReactNode;
  /** Optional secondary action slot (e.g. view documentation, browse templates). */
  secondaryAction?: React.ReactNode;
  /** Display size variant affecting spacing, typography, and icon ring dimensions. */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes for custom layout or positioning. */
  className?: string;
}

/**
 * Universal EmptyState component for pstui.
 * Renders an accessible, consistent empty state with pastel ring icon,
 * clear headline, guidance text, and one-click recovery action slots.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className = "",
}: EmptyStateProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const iconContainerSize = isSm
    ? "h-10 w-10 rounded-xl ring-4 ring-primary/5"
    : isLg
    ? "h-16 w-16 rounded-3xl ring-8 ring-primary/5"
    : "h-12 w-12 rounded-2xl ring-6 ring-primary/5";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`material-regular rounded-3xl border border-base-content/10 shadow-xs text-center flex flex-col items-center justify-center ${
        isSm ? "p-5 gap-2.5" : isLg ? "p-10 gap-5" : "p-8 gap-4"
      } ${className}`}
    >
      <div
        className={`mx-auto flex items-center justify-center bg-primary/12 text-accent-primary shrink-0 transition-transform duration-300 ease-out ${iconContainerSize}`}
        aria-hidden="true"
      >
        {icon ?? <IconSearch className={isSm ? "w-5 h-5" : "w-6 h-6"} />}
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3
          className={`font-bold text-base-content tracking-tight ${
            isSm ? "text-sm" : isLg ? "text-lg" : "text-base"
          }`}
        >
          {title}
        </h3>
        {description && (
          <p
            className={`font-medium line-clamp-3 break-keep leading-relaxed ${
              isSm ? "text-xs" : "text-xs sm:text-sm"
            }`}
            style={{ color: "var(--label-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
