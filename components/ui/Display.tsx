import React from "react";
import {
  IconCheck,
  IconErrorCircle,
  IconExclamationTriangle,
  IconExternalLink,
  IconInfoCircle,
  IconTrendDown,
  IconTrendUp,
} from "./icons";

// Re-export interactive client components with use client boundary
export {
  Calendar,
  type CalendarProps,
  Countdown,
  type CountdownProps,
  Diff,
  type DiffProps,
} from "./DisplayClient";

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  trend?: "up" | "down" | "neutral"; // Non-color cultural context cue (▲/▼) per DESIGN.md 2.4
  className?: string;
}

/**
 * High-contrast accessible badge featuring non-color trend cues (▲/▼) and soft pastel tints.
 */
export function Badge({
  children,
  variant = "default",
  size = "sm",
  trend,
  className = "",
}: BadgeProps) {
  const colorClass =
    variant === "primary"
      ? "badge-primary badge-soft"
      : variant === "secondary"
      ? "badge-secondary badge-soft"
      : variant === "success"
      ? "badge-success badge-soft"
      : variant === "warning"
      ? "badge-warning badge-soft"
      : variant === "error"
      ? "badge-error badge-soft"
      : variant === "info"
      ? "badge-info badge-soft"
      : variant === "outline"
      ? "badge-outline border-base-content/30 text-base-content"
      : "bg-base-content/12 text-base-content border border-base-content/20";

  const sizeClass =
    size === "xs"
      ? "badge-xs"
      : size === "md"
      ? "badge-md"
      : size === "lg"
      ? "badge-lg"
      : "badge-sm";

  const statusSymbol =
    trend === "up" ? (
      <span aria-hidden="true" className="inline-flex items-center gap-0.5 font-bold">
        <IconTrendUp className="w-3 h-3 shrink-0" />
        <span>+</span>
      </span>
    ) : trend === "down" ? (
      <span aria-hidden="true" className="inline-flex items-center gap-0.5 font-bold">
        <IconTrendDown className="w-3 h-3 shrink-0" />
        <span>−</span>
      </span>
    ) : variant === "success" ? (
      <IconCheck className="w-3 h-3 shrink-0" />
    ) : variant === "warning" ? (
      <IconExclamationTriangle className="w-3 h-3 shrink-0" />
    ) : variant === "error" ? (
      <IconErrorCircle className="w-3 h-3 shrink-0" />
    ) : variant === "info" ? (
      <IconInfoCircle className="w-3 h-3 shrink-0" />
    ) : null;

  return (
    <span
      className={`badge ${colorClass} ${sizeClass} rounded-full font-semibold gap-1 px-2.5 py-2 inline-flex items-center ${className}`}
    >
      {statusSymbol}
      <span>{children}</span>
    </span>
  );
}

export interface ChatMessageItem {
  id: string;
  sender: string;
  time: string;
  message: string;
  placement: "start" | "end";
  status?: string;
  avatarInitials?: string;
}

export type ChatMessage = ChatMessageItem;

export interface ChatBubbleProps {
  messages: ChatMessageItem[];
  className?: string;
}

export function ChatBubble({ messages, className = "" }: ChatBubbleProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {messages.map((msg) => {
        const isEnd = msg.placement === "end";
        return (
          <div
            key={msg.id}
            className={`chat ${isEnd ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="w-9 h-9 rounded-full bg-base-300 border border-base-content/15 flex items-center justify-center text-xs font-bold text-base-content">
                {msg.avatarInitials ?? msg.sender.slice(0, 2)}
              </div>
            </div>
            <div className="chat-header text-xs font-semibold text-base-content flex items-center gap-1.5 mb-1">
              <span>{msg.sender}</span>
              <time
                className="text-xs font-medium"
                style={{ color: "var(--label-secondary)" }}
              >
                {msg.time}
              </time>
            </div>
            <div
              className={`chat-bubble rounded-2xl text-sm shadow-xs ${
                isEnd
                  ? "chat-bubble-primary font-semibold"
                  : "bg-base-100 border border-base-content/15 text-base-content font-medium"
              }`}
            >
              {msg.message}
            </div>
            {msg.status && (
              <div
                className="chat-footer text-xs font-medium mt-1"
                style={{ color: "var(--label-secondary)" }}
              >
                {msg.status}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface KbdProps {
  keys: string[];
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export type KBDProps = KbdProps;

export function Kbd({ keys, size = "sm", label, className = "" }: KbdProps) {
  const sizeClass =
    size === "xs"
      ? "kbd-xs"
      : size === "md"
      ? "kbd-md"
      : size === "lg"
      ? "kbd-lg"
      : "kbd-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && (
        <span
          className="text-xs font-medium me-1"
          style={{ color: "var(--label-secondary)" }}
        >
          {label}
        </span>
      )}
      {keys.map((k, idx) => (
        <React.Fragment key={`${k}-${idx}`}>
          <kbd
            className={`kbd ${sizeClass} rounded-lg bg-base-100 border border-base-content/25 text-base-content font-bold shadow-2xs`}
          >
            {k}
          </kbd>
          {idx < keys.length - 1 && (
            <span
              className="text-xs font-bold"
              style={{ color: "var(--label-secondary)" }}
              aria-hidden="true"
            >
              +
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

// Backward-compatible alias
export const KBD = Kbd;

export interface ListRowItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export interface ListProps {
  /** Optional header title for the grouped list. */
  header?: string;
  /** Optional footer caption or explanatory note. */
  footer?: string;
  /** List of rows to display. */
  items: ListRowItem[];
  /** Whether to style as an Inset Grouped list with rounded outer border. */
  insetGrouped?: boolean;
  /** Fallback message when items array is empty. */
  emptyMessage?: string;
  /** Custom EmptyState or fallback node when items array is empty. */
  emptyState?: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Inset grouped standard content list supporting leading icons, trailing controls,
 * empty state slots, and non-destructive undo action flows.
 */
export function List({
  header,
  footer,
  items,
  insetGrouped = true,
  emptyMessage = "표시할 항목이 없습니다.",
  emptyState,
  className = "",
}: ListProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {header && (
        <h4
          className="text-xs font-bold px-3"
          style={{ color: "var(--label-secondary)" }}
        >
          {header}
        </h4>
      )}

      {/* Strictly Standard Material (--material-regular), NEVER Liquid Glass per AGENTS.md Section 1 */}
      <ul
        className={`list material-regular divide-y divide-base-content/15 ${
          insetGrouped ? "rounded-2xl shadow-xs overflow-hidden" : ""
        }`}
      >
        {items.length === 0 ? (
          <li className="list-row p-6 text-center justify-center">
            {emptyState ?? (
              <span
                className="text-sm font-medium"
                style={{ color: "var(--label-secondary)" }}
              >
                {emptyMessage}
              </span>
            )}
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="list-row items-center px-4 py-3 hover:bg-base-content/5 transition-colors duration-200"
            >
              {item.leading && (
                <div className="shrink-0 flex items-center justify-center">
                  {item.leading}
                </div>
              )}
              <div className="list-col-grow min-w-0">
                <p className="text-sm font-semibold text-base-content truncate">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.meta && (
                <span className="badge badge-xs bg-base-content/10 text-base-content border-none font-semibold shrink-0">
                  {item.meta}
                </span>
              )}
              {item.trailing && (
                <div className="shrink-0 flex items-center gap-2">
                  {item.trailing}
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      {footer && (
        <p
          className="text-xs font-medium px-3"
          style={{ color: "var(--label-secondary)" }}
        >
          {footer}
        </p>
      )}
    </div>
  );
}

export type MaskShape =
  | "squircle"
  | "heart"
  | "hexagon"
  | "circle"
  | "star-2"
  | "diamond";

export interface MaskProps {
  shape?: MaskShape;
  children?: React.ReactNode;
  label?: string;
  sizeClassName?: string;
  className?: string;
}

export function Mask({
  shape = "squircle",
  children,
  label,
  sizeClassName = "w-14 h-14",
  className = "",
}: MaskProps) {
  const shapeClass =
    shape === "heart"
      ? "mask-heart"
      : shape === "hexagon"
      ? "mask-hexagon"
      : shape === "circle"
      ? "mask-circle"
      : shape === "star-2"
      ? "mask-star-2"
      : shape === "diamond"
      ? "mask-diamond"
      : "mask-squircle";

  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      title={label}
      className={`mask ${shapeClass} ${sizeClassName} flex items-center justify-center font-bold text-primary-content select-none shadow-xs ${className}`}
      style={{
        background: "var(--surface-brand-solid)",
        textShadow: "var(--text-shadow-on-brand)",
      }}
    >
      {children ?? shape.slice(0, 2).toUpperCase()}
    </div>
  );
}

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "primary" | "secondary" | "neutral";
  hoverOnlyUnderline?: boolean;
  external?: boolean;
}

export function Link({
  variant = "primary",
  hoverOnlyUnderline = false,
  external = false,
  children,
  className = "",
  ...rest
}: LinkProps) {
  const colorClass =
    variant === "primary"
      ? "text-accent-primary"
      : variant === "secondary"
      ? "text-accent-secondary"
      : variant === "neutral"
      ? "text-base-content"
      : "text-base-content";

  return (
    <a
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`link ${colorClass} ${
        hoverOnlyUnderline ? "link-hover" : "underline underline-offset-4"
      } font-semibold inline-flex items-center gap-1 transition-opacity hover:opacity-80 pst-press ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {external && <IconExternalLink className="w-3.5 h-3.5 shrink-0" />}
    </a>
  );
}
