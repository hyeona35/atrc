"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconExclamationTriangle,
  IconInfoCircle,
} from "./icons";

export interface AccordionItem {
  /** Unique identifier for accordion panel. */
  id: string;
  /** Panel header title text. */
  title: string;
  /** Optional secondary subtitle or tag. */
  subtitle?: string;
  /** Disclosure content rendered when expanded. */
  content: React.ReactNode;
}

export interface AccordionProps {
  /** List of expandable panels. */
  items: AccordionItem[];
  /** Identifier of the panel open by default. */
  defaultOpenId?: string;
  /** Indicator icon glyph style (arrow or plus/minus). */
  iconStyle?: "arrow" | "plus";
  /** Form name attribute to group radio inputs. */
  groupName?: string;
  /** Additional CSS class names. */
  className?: string;
}

export function Accordion({
  items,
  defaultOpenId,
  iconStyle = "arrow",
  groupName,
  className = "",
}: AccordionProps) {
  const autoName = useId();
  const radioName = groupName ?? `accordion-${autoName}`;
  const [openId, setOpenId] = useState<string>(
    defaultOpenId ?? items[0]?.id ?? ""
  );

  const modifier = iconStyle === "plus" ? "collapse-plus" : "collapse-arrow";

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div
            key={item.id}
            className={`collapse ${modifier} material-regular rounded-2xl shadow-xs transition-all duration-300 ease-out`}
          >
            <input
              type="radio"
              name={radioName}
              checked={isOpen}
              onChange={() => setOpenId(item.id)}
              aria-label={item.title}
            />
            <div className="collapse-title font-semibold text-sm sm:text-base text-base-content flex items-center justify-between gap-2 pe-10">
              <span>{item.title}</span>
              {item.subtitle && (
                <span
                  className="text-xs font-medium shrink-0"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {item.subtitle}
                </span>
              )}
            </div>
            <div
              className="collapse-content text-sm leading-relaxed"
              style={{ color: "var(--label-secondary)" }}
            >
              <div
                className="pt-2 border-t"
                style={{ borderColor: "var(--separator)" }}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface CollapseProps {
  /** Header title text. */
  title: string;
  /** Optional secondary subtitle. */
  subtitle?: string;
  /** Collapsible body content. */
  children: React.ReactNode;
  /** Initial expansion state. */
  defaultOpen?: boolean;
  /** Indicator icon glyph style (arrow or plus/minus). */
  iconStyle?: "arrow" | "plus";
  /** Additional CSS class names. */
  className?: string;
}

export function Collapse({
  title,
  subtitle,
  children,
  defaultOpen = false,
  iconStyle = "arrow",
  className = "",
}: CollapseProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const modifier = iconStyle === "plus" ? "collapse-plus" : "collapse-arrow";

  return (
    <div
      className={`collapse ${modifier} material-regular rounded-2xl shadow-xs transition-all duration-300 ease-out ${className}`}
    >
      <input
        type="checkbox"
        checked={isOpen}
        onChange={(e) => setIsOpen(e.target.checked)}
        aria-label={title}
      />
      <div className="collapse-title font-semibold text-sm sm:text-base text-base-content flex items-center justify-between gap-2 pe-10">
        <span>{title}</span>
        {subtitle && (
          <span
            className="text-xs font-medium shrink-0"
            style={{ color: "var(--label-secondary)" }}
          >
            {subtitle}
          </span>
        )}
      </div>
      <div
        className="collapse-content text-sm leading-relaxed"
        style={{ color: "var(--label-secondary)" }}
      >
        <div
          className="pt-2 border-t"
          style={{ borderColor: "var(--separator)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export interface CarouselSlide {
  /** Unique slide identifier. */
  id: string;
  /** Primary slide title. */
  title: string;
  /** Secondary subtitle or description. */
  subtitle: string;
  /** Optional category badge or tag. */
  tag?: string;
  /** Custom slide graphic or interactive content. */
  content?: React.ReactNode;
}

export interface CarouselProps {
  /** List of carousel slides. */
  slides: CarouselSlide[];
  /** Additional CSS class names. */
  className?: string;
}

export function Carousel({ slides, className = "" }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (slides.length === 0) {
    return (
      <div className="material-regular rounded-2xl p-6 text-center text-sm">
        <span style={{ color: "var(--label-secondary)" }}>
          표시할 슬라이드가 없습니다.
        </span>
      </div>
    );
  }

  const boundedActiveIndex = Math.min(activeIndex, slides.length - 1);

  const scrollToSlide = (index: number) => {
    const bounded = ((index % slides.length) + slides.length) % slides.length;
    setActiveIndex(bounded);
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollTo({
        left: width * bounded,
        behavior: "smooth",
      });
    }
  };

  const handleContainerScroll = () => {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0) return;
    const nextIdx = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.max(0, Math.min(slides.length - 1, nextIdx));
    if (clamped !== boundedActiveIndex) {
      setActiveIndex(clamped);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative group">
        <div
          ref={containerRef}
          onScroll={handleContainerScroll}
          role="region"
          aria-label="콘텐츠 캐러셀"
          className="carousel carousel-center w-full rounded-2xl shadow-xs overflow-x-auto scroll-smooth"
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="carousel-item w-full material-regular p-6 flex flex-col justify-between min-h-[180px]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {slide.tag && (
                    <span className="badge badge-sm badge-soft badge-primary font-semibold">
                      {slide.tag}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-base-content/10 text-base-content">
                    {idx + 1} / {slides.length}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-base-content">
                  {slide.title}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {slide.subtitle}
                </p>
              </div>
              {slide.content && <div className="pt-4">{slide.content}</div>}
            </div>
          ))}
        </div>

        {/* Prev / Next Controls with 44x44px hit targets and centered SVG chevrons */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSlide(idx)}
                aria-label={`${idx + 1}번 슬라이드로 이동`}
                aria-current={idx === boundedActiveIndex ? "true" : undefined}
                className="p-2 pst-press flex items-center justify-center"
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 ease-out ${
                    idx === boundedActiveIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-base-content/35 hover:bg-base-content/55"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSlide(boundedActiveIndex - 1)}
              aria-label="이전 슬라이드"
              className="btn btn-sm btn-circle btn-ghost border border-base-content/20 pst-press text-base-content"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(boundedActiveIndex + 1)}
              aria-label="다음 슬라이드"
              className="btn btn-sm btn-circle btn-ghost border border-base-content/20 pst-press text-base-content"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DropdownMenuItem {
  /** Unique identifier for the menu item. */
  id: string;
  /** Visible label text for the menu item. */
  label: string;
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Whether this action is destructive (triggers confirmation sheet/popover). */
  isDestructive?: boolean;
  /** Concrete action verb for confirmation dialogs (e.g. '삭제', '초기화'). */
  confirmVerb?: string;
  /** Explanatory description for destructive confirmation dialogs. */
  confirmDescription?: string;
  /** Callback executed when the menu item is selected. */
  onClick: () => void;
}

export type DropdownItem = DropdownMenuItem;

export interface DropdownProps {
  /** Visible trigger button label. */
  triggerLabel: string;
  /** List of menu items (pstui Principle: minimum 3 items required). */
  items: DropdownMenuItem[];
  /** Direction from which the menu opens (top, bottom, start, end). */
  placement?: "start" | "end" | "top" | "bottom";
  /** Horizontal alignment anchor relative to trigger ('start' = left-aligned, 'end' = right-aligned). */
  align?: "start" | "end";
  /** Additional CSS class names. */
  className?: string;
}

export function Dropdown({
  triggerLabel,
  items,
  placement = "end",
  align,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pendingDestructive, setPendingDestructive] =
    useState<DropdownMenuItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        dropdownRef.current &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setPendingDestructive(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (pendingDestructive) {
          setPendingDestructive(null);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, pendingDestructive]);

  const effectiveAlign = align ?? (placement === "start" ? "start" : "end");
  const placementClass =
    placement === "top"
      ? effectiveAlign === "end"
        ? "dropdown-top dropdown-end"
        : "dropdown-top dropdown-start"
      : placement === "bottom"
      ? effectiveAlign === "end"
        ? "dropdown-bottom dropdown-end"
        : "dropdown-bottom dropdown-start"
      : placement === "start" || effectiveAlign === "start"
      ? "dropdown-start"
      : "dropdown-end";

  // Ensure minimum 3 items rule is respected
  const menuItems: DropdownMenuItem[] =
    items.length >= 3
      ? items
      : [
          ...items,
          {
            id: "pst-fallback-info",
            label: "항목 세부 정보 보기…",
            icon: <IconInfoCircle className="w-4 h-4" />,
            onClick: () => {},
          },
        ];

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.isDestructive) {
      // pstui Principle (DESIGN.md 7.1 & AGENTS.md 2.2.A): Do NOT delete immediately!
      // Open confirmation popover (PC) / action sheet (Mobile) first.
      setPendingDestructive(item);
      return;
    }
    setIsOpen(false);
    setPendingDestructive(null);
    item.onClick();
  };

  const confirmDestructiveAction = () => {
    if (!pendingDestructive) return;
    const action = pendingDestructive.onClick;
    setPendingDestructive(null);
    setIsOpen(false);
    action();
  };

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${placementClass} ${isOpen ? "dropdown-open" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setPendingDestructive(null);
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="btn btn-sm rounded-xl pst-press border border-base-content/20 bg-base-100 text-base-content font-semibold flex items-center gap-2"
      >
        <span>{triggerLabel}</span>
        <IconChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`dropdown-content z-40 ${
            placement === "top" ? "mb-2" : "mt-2"
          } w-64 liquid-glass-elevated rounded-2xl p-2 transition-all duration-300 ease-out ${
            effectiveAlign === "end" ? "end-0 start-auto" : "start-0 end-auto"
          }`}
        >
          {!pendingDestructive ? (
            <ul className="menu p-0 gap-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleItemClick(item)}
                    className={`pst-press rounded-xl px-3 py-2.5 text-sm flex items-center justify-between ${
                      item.isDestructive
                        ? "text-status-error hover:bg-error/12 font-semibold"
                        : "text-base-content font-medium hover:bg-base-content/8"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon && <span className="shrink-0">{item.icon}</span>}
                      <span>{item.label}</span>
                    </span>
                    {item.isDestructive && (
                      <IconExclamationTriangle className="w-4 h-4 shrink-0 text-status-error" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              {/* Desktop/Pad (>= md): Anchored Confirmation Popover */}
              <div
                role="alertdialog"
                aria-label="삭제 확인 팝오버"
                className="hidden md:block p-2 space-y-3 text-center"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-base-content">
                    {pendingDestructive.label} 확인
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {pendingDestructive.confirmDescription ??
                      "이 작업은 되돌릴 수 없습니다. 계속 진행하시겠습니까?"}
                  </p>
                </div>
                <div className="flex flex-row gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPendingDestructive(null)}
                    className="btn btn-xs btn-ghost flex-1 rounded-xl pst-press font-semibold text-base-content"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={confirmDestructiveAction}
                    className="btn btn-xs btn-error flex-1 rounded-xl pst-press font-semibold"
                  >
                    {pendingDestructive.confirmVerb ?? "삭제"}
                  </button>
                </div>
              </div>

              {/* Mobile (< md): Bottom Action Sheet per AGENTS.md 2.2.A & DESIGN.md 7.1 */}
              <div
                role="alertdialog"
                aria-modal="true"
                aria-label="삭제 확인 동작 시트"
                className="md:hidden fixed inset-0 z-50 flex flex-col justify-end p-4"
                style={{
                  backgroundColor: "var(--liquid-glass-dimming)",
                  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                }}
              >
                <div className="liquid-glass-elevated rounded-2xl p-4 space-y-3 text-center">
                  <div
                    className="space-y-1 pb-2 border-b"
                    style={{ borderColor: "var(--separator)" }}
                  >
                    <p className="text-sm font-bold text-base-content">
                      {pendingDestructive.label} 확인
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      {pendingDestructive.confirmDescription ??
                        "이 작업은 되돌릴 수 없습니다. 계속 진행하시겠습니까?"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={confirmDestructiveAction}
                      className="btn btn-error w-full rounded-xl pst-press font-semibold"
                    >
                      {pendingDestructive.confirmVerb ?? "삭제"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDestructive(null)}
                      className="btn btn-ghost w-full rounded-xl pst-press font-semibold text-base-content"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export type PullDownMenuProps = DropdownProps;
export const PullDownMenu = Dropdown;
