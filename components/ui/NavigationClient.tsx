"use client";

import React, { useEffect, useState } from "react";
import {
  IconChevronDown,
  IconLogoATRC,
} from "./icons";

export interface TabBarItem {
  /** Unique item identifier. */
  id: string;
  /** Visible tab label text. */
  label: string;
  /** Inactive/default icon element. */
  icon?: React.ReactNode;
  /** Optional active/selected state icon element. */
  activeIcon?: React.ReactNode;
  /** Optional notification badge or numerical count. */
  badge?: string | number;
}

export type BottomBarItem = TabBarItem;

export interface TabBarProps {
  /** List of mobile tab bar items (maximum 3-5 items per HIG). */
  items: TabBarItem[];
  /** Currently active tab identifier. */
  activeId: string;
  /** Selection callback fired on tab tap. */
  onSelect: (id: string) => void;
  /** When true, renders inline for showcase preview instead of fixed viewport bottom. */
  inlinePreview?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

export type BottomBarProps = TabBarProps;

export function TabBar({
  items,
  activeId,
  onSelect,
  inlinePreview = false,
  className = "",
}: TabBarProps) {
  // pstui Principle: Limit mobile tab bar items to 3~5 items maximum
  const visibleItems = items.slice(0, 5);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (inlinePreview) return;
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;
          // Substantial threshold with hysteresis to eliminate fluttering on subtle micro-scrolls
          if (delta > 25 && currentY > 100) {
            setIsMinimized(true);
          } else if (delta < -20 || currentY <= 30) {
            setIsMinimized(false);
          }
          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [inlinePreview]);

  return (
    <nav
      aria-label="주요 하단 탐색 막대"
      onClick={() => {
        if (isMinimized) setIsMinimized(false);
      }}
      style={
        inlinePreview
          ? { height: "var(--tabbar-height)" }
          : {
              height: "var(--tabbar-height)",
              bottom: "calc(12px + var(--safe-bottom, 0px))",
              width:
                "min(32rem, calc(100% - 1.5rem - var(--safe-left, 0px) - var(--safe-right, 0px)))",
              left: "var(--safe-left, 0px)",
              right: "var(--safe-right, 0px)",
              marginInline: "auto",
              transformOrigin: "bottom center",
            }
      }
      className={`liquid-glass rounded-3xl flex flex-row items-center justify-around gap-1 px-1.5 py-1.5 transition-all duration-300 ease-out touch-manipulation ${
        inlinePreview
          ? "relative w-full z-10"
          : "fixed max-w-lg mx-auto md:hidden z-30 box-border"
      } ${
        isMinimized && !inlinePreview
          ? "scale-90 translate-y-2 opacity-90"
          : "scale-100 translate-y-0 opacity-100"
      } ${className}`}
    >
      {visibleItems.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            style={!isActive ? { color: "var(--label-secondary)" } : undefined}
            className={`min-h-11 min-w-0 flex-1 h-full px-1 py-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200 ease-out cursor-pointer active:scale-95 ${
              isActive
                ? "text-accent-primary bg-primary/14 border border-primary/20 font-semibold shadow-2xs"
                : "hover:text-base-content hover:bg-base-content/5 border border-transparent font-semibold"
            }`}
          >
            {(item.icon || item.activeIcon) && (
              <span className="shrink-0 leading-none">
                {isActive ? (item.activeIcon ?? item.icon) : item.icon}
              </span>
            )}
            <span className="dock-label text-[11px] leading-none font-semibold whitespace-nowrap truncate max-w-full text-center px-0.5">
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span
                className={`badge badge-xs absolute top-1 end-1.5 font-bold ${
                  isActive ? "badge-primary" : "badge-neutral"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// Backward-compatible alias
export const BottomBar = TabBar;

export interface SidebarSubItem {
  /** Sub-item identifier. */
  id: string;
  /** Sub-item visible label text. */
  label: string;
  /** Optional secondary badge. */
  badge?: string | number;
}

export interface SidebarNavItem {
  /** Navigation item identifier. */
  id: string;
  /** Navigation item visible label text. */
  label: string;
  /** Primary icon element. */
  icon?: React.ReactNode;
  /** Optional active/selected state icon element. */
  activeIcon?: React.ReactNode;
  /** Optional notification badge or numerical count. */
  badge?: string | number;
  /** Sub-navigation hierarchy (strictly maximum 2 levels per DESIGN.md 4.1). */
  children?: SidebarSubItem[];
}

export interface SidebarProps {
  /** List of top-level sidebar navigation items. */
  items: SidebarNavItem[];
  /** Currently active navigation identifier. */
  activeId: string;
  /** Selection callback fired when an item is clicked. */
  onSelect: (id: string) => void;
  /** Whether the sidebar is collapsed to icon-only mode (76px width). */
  isCollapsed: boolean;
  /** Optional collapse toggle callback. */
  onToggleCollapse?: () => void;
  /** When true, renders inline for showcase preview without fixed viewport positioning. */
  inlinePreview?: boolean;
  /** Optional custom brand title shown at top of expanded sidebar. */
  brandLabel?: string;
  /** Additional CSS class names. */
  className?: string;
}

export function Sidebar({
  items,
  activeId,
  onSelect,
  isCollapsed,
  inlinePreview = false,
  brandLabel = "Workspace",
  className = "",
}: SidebarProps) {
  return (
    <aside
      aria-label="사이드바 탐색"
      style={{
        width: isCollapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
        ...(inlinePreview
          ? {}
          : {
              top: "calc(14px + var(--safe-top, 0px))",
              bottom: "calc(14px + var(--safe-bottom, 0px))",
              insetInlineStart: "calc(14px + var(--safe-left, 0px))",
            }),
      }}
      className={`liquid-glass pst-sidebar-shadow transition-all duration-300 ease-out flex flex-col select-none ${
        inlinePreview
          ? "relative rounded-3xl h-[420px] m-1"
          : "hidden md:flex fixed z-30 rounded-3xl"
      } ${className}`}
    >
      {/* Top Leading Workspace Header (App Bar retains primary collapse button per Requirement 1) */}
      <div
        className={`flex items-center px-3 pt-3.5 pb-2.5 border-b ${
          isCollapsed ? "justify-center" : "justify-start"
        }`}
        style={{ borderColor: "var(--separator)" }}
      >
        {!isCollapsed ? (
          <button
            type="button"
            onClick={() => {
              onSelect("overview");
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.documentElement.scrollTo?.({ top: 0, behavior: "smooth" });
                document.body.scrollTo?.({ top: 0, behavior: "smooth" });
              }
            }}
            title={`${brandLabel} 홈으로 이동`}
            aria-label={`${brandLabel} 홈으로 이동`}
            className="flex items-center gap-2.5 min-w-0 ps-1 cursor-pointer pst-press rounded-xl hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-primary"
          >
            <IconLogoATRC className="w-7 h-7 shrink-0 rounded-xl shadow-xs" />
            <span className="text-sm font-extrabold tracking-tight text-base-content truncate">
              {brandLabel}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onSelect("overview");
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                document.documentElement.scrollTo?.({ top: 0, behavior: "smooth" });
                document.body.scrollTo?.({ top: 0, behavior: "smooth" });
              }
            }}
            title={`${brandLabel} 홈으로 이동`}
            aria-label={`${brandLabel} 홈으로 이동`}
            className="w-10 h-10 rounded-2xl flex items-center justify-center pst-press hover:bg-base-content/10 transition-colors focus-visible:outline-2 focus-visible:outline-primary mx-auto"
          >
            <IconLogoATRC className="w-7 h-7 shrink-0 rounded-xl shadow-xs" />
          </button>
        )}
      </div>

      {/* Navigation Menu (Up to 2 Hierarchy Levels) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 px-2">
        <ul className="menu w-full p-0 gap-1">
          {items.map((item) => {
            const isActive =
              item.id === activeId ||
              Boolean(item.children?.some((sub) => sub.id === activeId));
            const renderedIcon = isActive
              ? (item.activeIcon ?? item.icon)
              : item.icon;

            if (item.children && item.children.length > 0 && !isCollapsed) {
              return (
                <li key={item.id}>
                  <details open={isActive}>
                    <summary
                      onClick={() => onSelect(item.id)}
                      className={`pst-press rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ease-out ${
                        isActive
                          ? "bg-primary/14 text-accent-primary border border-primary/25 font-semibold"
                          : "text-base-content hover:bg-base-content/8 font-medium"
                      }`}
                    >
                      {renderedIcon && <span className="shrink-0">{renderedIcon}</span>}
                      <span className="truncate">{item.label}</span>
                    </summary>
                    <ul className="ps-4 mt-1.5 space-y-1 before:bg-base-content/20">
                      {item.children.map((sub) => {
                        const isSubActive = sub.id === activeId;
                        return (
                          <li key={sub.id}>
                            <button
                              type="button"
                              onClick={() => onSelect(sub.id)}
                              aria-current={isSubActive ? "page" : undefined}
                              className={`pst-press rounded-xl px-2.5 py-1.5 text-xs flex items-center justify-between ${
                                isSubActive
                                  ? "bg-primary/14 text-accent-primary font-semibold"
                                  : "text-base-content hover:bg-base-content/8 font-medium"
                              }`}
                            >
                              <span className="truncate">{sub.label}</span>
                              {sub.badge !== undefined && (
                                <span className="badge badge-xs font-semibold badge-soft badge-primary">
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={`pst-press rounded-xl px-3 py-2.5 text-sm flex items-center justify-between transition-all duration-300 ease-out ${
                    isActive
                      ? "bg-primary text-primary-content font-semibold shadow-xs"
                      : "text-base-content hover:bg-base-content/8 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    {renderedIcon && <span className="shrink-0">{renderedIcon}</span>}
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                  </span>
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`badge badge-xs font-semibold ${
                        isActive
                          ? "badge-neutral"
                          : "badge-soft badge-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export interface TabItem {
  /** Unique tab identifier. */
  id: string;
  /** Visible tab label text. */
  label: string;
  /** Optional numerical badge count. */
  badge?: string | number;
  /** Optional tab panel content rendered when active. */
  content?: React.ReactNode;
  /** Whether the tab is disabled. */
  disabled?: boolean;
}

export interface TabsProps {
  /** List of segmented tab items (max 5 items on mobile, max 7 items on PC). */
  items: TabItem[];
  /** Currently active tab identifier. */
  activeId: string;
  /** Callback fired when a tab is selected. */
  onChange: (id: string) => void;
  /** Visual presentation variant (segmented, box, border, lift). */
  variant?: "segmented" | "box" | "border" | "lift";
  /** Size variant. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Additional CSS class names. */
  className?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  variant = "segmented",
  size = "md",
  className = "",
}: TabsProps) {
  // pstui Principle: Segmented controls have equal width (flex: 1 / grid-auto-columns: 1fr) and max 5~7 items
  const cappedItems = variant === "segmented" ? items.slice(0, 7) : items;
  const activeTab = cappedItems.find((t) => t.id === activeId);

  const sizeClass =
    size === "xs"
      ? "tabs-xs"
      : size === "sm"
      ? "tabs-sm"
      : size === "lg"
      ? "tabs-lg"
      : "tabs-md";

  const styleClass =
    variant === "border"
      ? "tabs-border"
      : variant === "lift"
      ? "tabs-lift"
      : "tabs-box";

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div
        role="tablist"
        aria-label="탭 전환 제어기"
        style={{ backgroundColor: "var(--fill-tertiary)" }}
        className={`tabs ${styleClass} ${sizeClass} ${
          variant === "segmented"
            ? "grid grid-flow-col auto-cols-fr p-1 rounded-2xl border border-base-content/15 gap-1"
            : "rounded-2xl p-1 gap-1 border border-base-content/15"
        }`}
      >
        {cappedItems.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              disabled={tab.disabled}
              aria-selected={isActive}
              onClick={() => !tab.disabled && onChange(tab.id)}
              style={!isActive ? { color: "var(--label-secondary)" } : undefined}
              className={`tab pst-press flex-1 rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-1.5 ${
                isActive
                  ? "tab-active bg-base-100 text-base-content font-semibold shadow-sm border border-base-content/12"
                  : "hover:text-base-content font-semibold"
              } ${tab.disabled ? "tab-disabled opacity-40" : ""}`}
            >
              <span className="truncate">{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`badge badge-xs font-bold ${
                    isActive
                      ? "badge-primary"
                      : "bg-base-content/12 text-base-content border-none"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab?.content && (
        <div
          role="tabpanel"
          className="material-regular rounded-2xl p-4 shadow-xs transition-all duration-300 ease-out text-base-content"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}

export interface MegaMenuLink {
  /** Unique link identifier. */
  id: string;
  /** Primary link title text. */
  title: string;
  /** Descriptive caption or summary of the linked destination. */
  description: string;
  /** Optional badge text. */
  badge?: string;
  /** Click callback for programmatic navigation. */
  onClick?: () => void;
}

export type MegamenuLink = MegaMenuLink;

export interface MegaMenuSection {
  /** Unique section identifier. */
  id: string;
  /** Visible tab/menu button label. */
  label: string;
  /** Column layout containing categorized links. */
  columns: {
    heading: string;
    links: MegaMenuLink[];
  }[];
  /** Optional featured highlight card slot. */
  featuredCard?: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    onCtaClick?: () => void;
  };
}

export type MegamenuSection = MegaMenuSection;

export interface MegaMenuProps {
  /** List of top-level megamenu sections. */
  sections: MegaMenuSection[];
  /** Additional CSS class names. */
  className?: string;
}

export type MegamenuProps = MegaMenuProps;

export function MegaMenu({ sections, className = "" }: MegaMenuProps) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    sections[0]?.id ?? null
  );

  const activeSection = sections.find((s) => s.id === openSectionId);

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      <div
        role="menubar"
        aria-label="메가메뉴 탐색"
        className="megamenu megamenu-wide w-full liquid-glass rounded-2xl p-1.5 flex flex-wrap items-center gap-1.5"
      >
        <span className="megamenu-active" aria-hidden="true" />
        {sections.slice(0, 10).map((section) => {
          const isOpen = section.id === openSectionId;
          return (
            <button
              key={section.id}
              type="button"
              role="menuitem"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenSectionId((prev) =>
                  prev === section.id ? null : section.id
                )
              }
              className={`btn btn-sm rounded-xl pst-press border-none transition-all duration-300 ease-out ${
                isOpen
                  ? "bg-primary text-primary-content font-semibold shadow-xs"
                  : "btn-ghost text-base-content font-semibold"
              }`}
            >
              <span>{section.label}</span>
              <IconChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      {activeSection && (
        <div className="liquid-glass-elevated rounded-2xl p-4 transition-all duration-300 ease-out">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSection.columns.map((col) => (
                <div key={col.heading} className="space-y-2">
                  <p
                    className="text-xs font-bold px-2"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {col.heading}
                  </p>
                  <ul className="menu p-0 gap-1">
                    {col.links.map((link) => (
                      <li key={link.id}>
                        <button
                          type="button"
                          onClick={link.onClick}
                          className="pst-press rounded-xl p-2.5 flex flex-col items-start gap-1 hover:bg-base-content/8 transition-all duration-300 ease-out"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-base-content">
                              {link.title}
                            </span>
                            {link.badge && (
                              <span className="badge badge-xs badge-soft badge-primary font-semibold">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          <span
                            className="text-xs text-start"
                            style={{ color: "var(--label-secondary)" }}
                          >
                            {link.description}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {activeSection.featuredCard && (
              <div className="material-regular rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <span className="badge badge-xs badge-primary font-semibold">
                    추천 구성
                  </span>
                  <h4 className="text-sm font-bold text-base-content mt-1">
                    {activeSection.featuredCard.title}
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {activeSection.featuredCard.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={activeSection.featuredCard.onCtaClick}
                  className="btn btn-sm btn-primary rounded-xl pst-press w-full font-semibold"
                >
                  {activeSection.featuredCard.ctaLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias
export const Megamenu = MegaMenu;

export interface StackProps {
  /** Array of card nodes to stack on top of each other. */
  items: React.ReactNode[];
  /** Direction from which underlying stacked cards peek out. */
  placement?: "top" | "bottom" | "start" | "end";
  /** Additional CSS class names. */
  className?: string;
}

export function Stack({
  items,
  placement = "bottom",
  className = "",
}: StackProps) {
  const [rotationOffset, setRotationOffset] = useState<number>(0);

  if (items.length === 0) {
    return (
      <div className="material-regular rounded-2xl p-4 text-xs text-center">
        <span style={{ color: "var(--label-secondary)" }}>
          표시할 스택 항목이 없습니다.
        </span>
      </div>
    );
  }

  const normalizedOffset = rotationOffset % items.length;
  const order = items.map((_, i) => (i + normalizedOffset) % items.length);

  const rotateStack = () => {
    if (items.length <= 1) return;
    setRotationOffset((prev) => (prev + 1) % items.length);
  };

  const placementClass =
    placement === "top"
      ? "stack-top"
      : placement === "start"
      ? "stack-start"
      : placement === "end"
      ? "stack-end"
      : "stack-bottom";

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        onClick={rotateStack}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            rotateStack();
          }
        }}
        aria-label="스택 카드 순환하기 (클릭 또는 Enter)"
        className={`stack ${placementClass} cursor-pointer pst-press ${className}`}
      >
        {order.map((idx) => (
          <div key={idx} className="transition-all duration-300 ease-out">
            {items[idx]}
          </div>
        ))}
      </div>
      <span
        className="text-xs font-medium"
        style={{ color: "var(--label-secondary)" }}
      >
        카드를 클릭하여 다음 레이어 보기 ({order[0] + 1}/{items.length})
      </span>
    </div>
  );
}
