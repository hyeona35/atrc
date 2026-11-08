import React from "react";
import {
  IconCheck,
  IconChevronRight,
  IconExclamationTriangle,
} from "./icons";

// Re-export interactive client components with use client boundary
export {
  TabBar,
  type TabBarProps,
  type TabBarItem,
  BottomBar,
  type BottomBarProps,
  type BottomBarItem,
  Sidebar,
  type SidebarProps,
  type SidebarNavItem,
  type SidebarSubItem,
  Tabs,
  type TabsProps,
  type TabItem,
  MegaMenu,
  type MegaMenuProps,
  type MegaMenuSection,
  type MegaMenuLink,
  Megamenu,
  type MegamenuProps,
  type MegamenuSection,
  type MegamenuLink,
  Stack,
  type StackProps,
} from "./NavigationClient";

export interface BreadcrumbItem {
  /** Unique breadcrumb item identifier. */
  id: string;
  /** Visible breadcrumb label text. */
  label: string;
  /** Optional navigation target link href. */
  href?: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional click handler for programmatic navigation. */
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  /** Ordered list of hierarchical breadcrumb items. */
  items: BreadcrumbItem[];
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Semantic breadcrumbs navigation bar with accessible chevron separators and touch hit padding.
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="경로 탐색 (Breadcrumbs)"
      className={`breadcrumbs text-sm max-w-full overflow-x-auto py-1 [&>ul>li+li::before]:hidden ${className}`}
    >
      <ul className="flex items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.id} className="inline-flex items-center gap-1">
              {idx > 0 && (
                <IconChevronRight
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "var(--label-tertiary)" }}
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="inline-flex items-center gap-1.5 font-semibold text-base-content px-1.5 py-1"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  style={{ color: "var(--label-secondary)" }}
                  className="pst-press inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-medium hover:text-base-content hover:bg-base-content/8 transition-all duration-300 ease-out"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface StepItem {
  /** Unique step identifier. */
  id: string;
  /** Visible step label text. */
  title: string;
  /** Optional step description. */
  description?: string;
  /** Semantic status of the step. */
  status: "completed" | "current" | "upcoming" | "error";
}

export interface StepsProps {
  /** Ordered list of workflow steps. */
  items: StepItem[];
  /** Layout orientation ('horizontal' or 'vertical'). */
  direction?: "horizontal" | "vertical";
  /** Optional step click handler for interactive navigation. */
  onStepClick?: (id: string) => void;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Progress steps indicator supporting horizontal and vertical orientations with status glyphs.
 */
export function Steps({
  items,
  direction = "horizontal",
  onStepClick,
  className = "",
}: StepsProps) {
  return (
    <ul
      aria-label="진행 단계 표시기"
      className={`steps w-full ${
        direction === "vertical" ? "steps-vertical" : "steps-horizontal"
      } ${className}`}
    >
      {items.map((step, index) => {
        const colorClass =
          step.status === "completed" || step.status === "current"
            ? "step-primary"
            : step.status === "error"
            ? "step-error"
            : "";

        return (
          <li
            key={step.id}
            role={onStepClick ? "button" : undefined}
            tabIndex={onStepClick ? 0 : undefined}
            onClick={() => onStepClick?.(step.id)}
            onKeyDown={(e) => {
              if (onStepClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onStepClick(step.id);
              }
            }}
            className={`step ${colorClass} ${
              onStepClick ? "cursor-pointer" : ""
            }`}
          >
            <span className="step-icon font-bold text-xs">
              {step.status === "completed" ? (
                <IconCheck className="w-3.5 h-3.5" />
              ) : step.status === "error" ? (
                <IconExclamationTriangle className="w-3.5 h-3.5" />
              ) : (
                index + 1
              )}
            </span>
            <div className="text-center sm:text-start px-1">
              <p
                className={`text-xs sm:text-sm ${
                  step.status === "current" || step.status === "completed"
                    ? "font-semibold text-base-content"
                    : "font-medium"
                }`}
                style={
                  step.status === "upcoming"
                    ? { color: "var(--label-secondary)" }
                    : undefined
                }
              >
                {step.title}
              </p>
              {step.description && (
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export interface DividerProps {
  label?: string;
  direction?: "horizontal" | "vertical";
  placement?: "start" | "center" | "end";
  color?: "default" | "primary" | "secondary" | "neutral";
  className?: string;
}

/**
 * Content divider with optional semantic text and placement options.
 */
export function Divider({
  label,
  direction = "horizontal",
  placement = "center",
  color = "default",
  className = "",
}: DividerProps) {
  const dirClass =
    direction === "vertical" ? "divider-vertical" : "divider-horizontal";
  const placeClass =
    placement === "start"
      ? "divider-start"
      : placement === "end"
      ? "divider-end"
      : "";
  const colorClass =
    color === "primary"
      ? "divider-primary"
      : color === "secondary"
      ? "divider-secondary"
      : color === "neutral"
      ? "divider-neutral"
      : "";

  return (
    <div
      role="separator"
      className={`divider ${dirClass} ${placeClass} ${colorClass} text-xs font-semibold ${className}`}
      style={{ color: "var(--label-secondary)" }}
    >
      {label}
    </div>
  );
}
