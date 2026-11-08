"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { IconErrorCircle } from "./icons";

export interface ErrorBoundaryProps {
  /** The child elements/subtrees to be protected by this error boundary. */
  children: ReactNode;
  /** Custom fallback element or render function receiving the caught error and a reset handler. */
  fallback?:
    | ReactNode
    | ((props: { error: Error; reset: () => void }) => ReactNode);
  /** Optional callback invoked when an error is caught, useful for logging or telemetry reporting. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Additional CSS class names to apply to the fallback container. */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Universal component/slot-level Error Boundary for pstui.
 * Isolates runtime widget errors to prevent cascading full-page crashes,
 * providing graceful degradation with an inline retry action.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary caught error]:", error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, className = "" } = this.props;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback({ error, reset: this.reset });
      }
      if (fallback) {
        return fallback;
      }

      // Default pstui-styled error card
      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`material-regular rounded-3xl p-6 border border-error/25 shadow-xs space-y-3.5 ${className}`}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-error/15 text-status-error"
              aria-hidden="true"
            >
              <IconErrorCircle className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-base-content tracking-tight">
                컴포넌트 렌더링 중 오류가 발생했습니다
              </h4>
              <p
                className="text-xs font-medium mt-0.5 line-clamp-2 break-keep"
                style={{ color: "var(--label-secondary)" }}
              >
                {error.message ||
                  "일시적인 렌더링 문제일 수 있습니다. 다시 시도해 주세요."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-base-content/10">
            <button
              type="button"
              onClick={this.reset}
              className="btn btn-sm btn-ghost rounded-xl pst-press font-semibold text-xs text-base-content"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
