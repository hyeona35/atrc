"use client";

import React, { useEffect, useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPause,
  IconPlay,
} from "./icons";

export interface CalendarProps {
  /** Currently selected Date object. */
  selectedDate: Date;
  /** Callback fired when a date cell is clicked. */
  onSelectDate: (date: Date) => void;
  /** Days of current month to visually highlight (e.g. [5, 12, 19, 24]). */
  highlightedDays?: number[];
  /** Additional CSS class names. */
  className?: string;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function Calendar({
  selectedDate,
  onSelectDate,
  highlightedDays = [5, 12, 19, 24],
  className = "",
}: CalendarProps) {
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      role="application"
      aria-label="달력 및 날짜 선택기"
      className={`cally react-day-picker material-regular rounded-2xl shadow-xs p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-base-content">
            {viewYear}년 {viewMonth + 1}월
          </p>
          <p
            className="text-xs font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            선택됨: {selectedDate.getFullYear()}.
            {String(selectedDate.getMonth() + 1).padStart(2, "0")}.
            {String(selectedDate.getDate()).padStart(2, "0")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="이전 달"
            className="btn btn-ghost btn-xs btn-square rounded-xl border border-base-content/20 pst-press text-base-content"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
              onSelectDate(now);
            }}
            className="btn btn-ghost btn-xs rounded-xl border border-base-content/20 pst-press font-semibold text-base-content px-2.5"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="다음 달"
            className="btn btn-ghost btn-xs btn-square rounded-xl border border-base-content/20 pst-press text-base-content"
          >
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="grid grid-cols-7 text-center text-xs font-bold py-1.5 border-b"
        style={{ borderColor: "var(--separator)" }}
      >
        {WEEKDAYS_KO.map((day) => (
          <span key={day} style={{ color: "var(--label-secondary)" }}>
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {blankDays.map((b) => (
          <span key={`blank-${b}`} className="min-h-[44px]" />
        ))}
        {monthDays.map((day) => {
          const isSelected =
            selectedDate.getFullYear() === viewYear &&
            selectedDate.getMonth() === viewMonth &&
            selectedDate.getDate() === day;
          const hasEvent = highlightedDays.includes(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(new Date(viewYear, viewMonth, day))}
              aria-pressed={isSelected}
              className={`min-h-[44px] rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all duration-200 pst-press ${
                isSelected
                  ? "bg-primary text-primary-content font-bold shadow-xs"
                  : "hover:bg-base-content/10 text-base-content"
              }`}
            >
              <span>{day}</span>
              {hasEvent && (
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? "bg-primary-content" : "bg-primary"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface CountdownProps {
  /** Initial remaining hours (0-999). */
  hours?: number;
  /** Initial remaining minutes (0-59). */
  minutes?: number;
  /** Initial remaining seconds (0-59). */
  seconds?: number;
  /** Whether the countdown timer is auto-running upon mount. */
  autoStart?: boolean;
  /** Header caption or label describing the countdown target. */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

export function Countdown({
  hours = 2,
  minutes = 45,
  seconds = 38,
  autoStart = true,
  label = "다음 릴리스 배포까지 남은 시간",
  className = "",
}: CountdownProps) {
  const initialTotalSeconds = Math.max(
    0,
    Math.min(999, Math.max(0, hours)) * 3600 +
      Math.min(59, Math.max(0, minutes)) * 60 +
      Math.min(59, Math.max(0, seconds))
  );
  const [totalSeconds, setTotalSeconds] = useState<number>(initialTotalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const stepSecond = (delta: number) => {
    setTotalSeconds((prev) =>
      Math.min(999 * 3600 + 3599, Math.max(0, prev + delta))
    );
  };

  const hr = Math.min(999, Math.floor(totalSeconds / 3600));
  const min = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;

  return (
    <div
      className={`material-regular rounded-2xl p-4 shadow-xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-bold text-base-content">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            aria-pressed={!isRunning}
            className="btn btn-ghost btn-xs rounded-lg border border-base-content/20 pst-press font-semibold text-base-content inline-flex items-center gap-1"
          >
            {isRunning ? (
              <IconPause className="w-3 h-3" />
            ) : (
              <IconPlay className="w-3 h-3" />
            )}
            <span>{isRunning ? "일시 정지" : "재개"}</span>
          </button>
          <button
            type="button"
            onClick={() => stepSecond(-1)}
            className="btn btn-ghost btn-xs rounded-lg border border-base-content/20 pst-press font-semibold text-base-content"
          >
            −1초
          </button>
          <button
            type="button"
            onClick={() => stepSecond(1)}
            className="btn btn-ghost btn-xs rounded-lg border border-base-content/20 pst-press font-semibold text-base-content"
          >
            +1초
          </button>
        </div>
      </div>

      <div className="grid grid-flow-col gap-3 text-center auto-cols-max">
        <div className="flex flex-col p-2.5 bg-base-100 border border-base-content/15 rounded-xl min-w-[68px]">
          <span
            className="countdown font-mono text-2xl font-bold text-base-content justify-center"
            aria-live="polite"
            aria-label={`${hr}시간`}
          >
            <span style={{ "--value": hr } as React.CSSProperties}>{hr}</span>
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--label-secondary)" }}
          >
            시간
          </span>
        </div>
        <div className="flex flex-col p-2.5 bg-base-100 border border-base-content/15 rounded-xl min-w-[68px]">
          <span
            className="countdown font-mono text-2xl font-bold text-base-content justify-center"
            aria-live="polite"
            aria-label={`${min}분`}
          >
            <span style={{ "--value": min } as React.CSSProperties}>{min}</span>
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--label-secondary)" }}
          >
            분
          </span>
        </div>
        <div className="flex flex-col p-2.5 bg-primary/14 border border-primary/25 rounded-xl min-w-[68px]">
          <span
            className="countdown font-mono text-2xl font-bold text-accent-primary justify-center"
            aria-live="polite"
            aria-label={`${sec}초`}
          >
            <span style={{ "--value": sec } as React.CSSProperties}>{sec}</span>
          </span>
          <span className="text-xs font-bold text-accent-primary">초</span>
        </div>
      </div>
    </div>
  );
}

export interface DiffProps {
  /** Accessible label for first/left content. */
  firstLabel?: string;
  /** Accessible label for second/right content. */
  secondLabel?: string;
  /** Left/primary content node to compare. */
  firstContent?: React.ReactNode;
  /** Right/secondary content node to compare. */
  secondContent?: React.ReactNode;
  /** Initial divider split position percentage (0 to 100, defaults to 50). */
  initialPosition?: number;
  /** Callback fired when slider split position changes. */
  onChange?: (position: number) => void;
  /** Additional CSS class names. */
  className?: string;
}

export function Diff({
  firstLabel = "Liquid Glass (탐색/기능 오버레이)",
  secondLabel = "Standard Material (본문 콘텐츠 표면)",
  firstContent,
  secondContent,
  initialPosition = 50,
  onChange,
  className = "",
}: DiffProps) {
  const [position, setPosition] = useState<number>(initialPosition);
  const [prevInitial, setPrevInitial] = useState<number>(initialPosition);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef<boolean>(false);

  // Synchronize state if initialPosition prop changes during render per React guidelines
  if (initialPosition !== prevInitial) {
    setPrevInitial(initialPosition);
    setPosition(initialPosition);
  }

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;
    const rawPos = ((clientX - rect.left) / rect.width) * 100;
    const newPos = Math.max(0, Math.min(100, Math.round(rawPos * 10) / 10));
    setPosition(newPos);
    onChange?.(newPos);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    containerRef.current?.focus();
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  const handleLostPointerCapture = () => {
    isDraggingRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(0, position - 5);
      setPosition(next);
      onChange?.(next);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(100, position + 5);
      setPosition(next);
      onChange?.(next);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      const next = Math.max(0, position - 20);
      setPosition(next);
      onChange?.(next);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      const next = Math.min(100, position + 20);
      setPosition(next);
      onChange?.(next);
    } else if (e.key === "Home") {
      e.preventDefault();
      setPosition(0);
      onChange?.(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(100);
      onChange?.(100);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handleLostPointerCapture}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="좌우 비교 뷰 (Diff 슬라이더)"
      aria-orientation="horizontal"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${firstLabel} ${Math.round(position)}%, ${secondLabel} ${100 - Math.round(position)}%`}
      style={{ touchAction: "none" }}
      className={`pst-diff relative aspect-16/9 w-full rounded-2xl border border-base-content/20 shadow-xs overflow-hidden select-none cursor-ew-resize focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${className}`}
    >
      {/* Background Layer: Second Content (BEFORE) */}
      <div
        className="pst-diff-item-2 absolute inset-0 w-full h-full pointer-events-none"
        role="img"
        aria-label={secondLabel}
      >
        {secondContent ?? (
          <div className="w-full h-full bg-base-200 flex flex-col items-center justify-center p-6 text-center text-base-content">
            <span className="badge badge-sm badge-neutral font-bold mb-2">
              BEFORE · Standard Material
            </span>
            <p className="text-lg sm:text-xl font-bold tracking-tight">
              {secondLabel}
            </p>
            <p
              className="text-xs font-semibold mt-1"
              style={{ color: "var(--label-secondary)" }}
            >
              고대비 정적 콘텐츠 카드 표면
            </p>
          </div>
        )}
      </div>

      {/* Foreground Layer: First Content (AFTER), clipped dynamically */}
      <div
        className="pst-diff-item-1 absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        role="img"
        aria-label={firstLabel}
      >
        {firstContent ?? (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-primary-content"
            style={{
              background: "var(--surface-brand-solid)",
              textShadow: "var(--text-shadow-on-brand)",
            }}
          >
            <span className="badge badge-sm bg-neutral text-neutral-content border-none font-bold mb-2">
              AFTER · Liquid Glass
            </span>
            <p className="text-lg sm:text-xl font-bold tracking-tight">
              {firstLabel}
            </p>
            <p className="text-xs font-semibold mt-1">
              반투명 블러 + 생동감 있는 광학 깊이
            </p>
          </div>
        )}
      </div>

      {/* Interactive Divider Line: Spans full height at exact position% */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-10 -translate-x-1/2 w-0.5 bg-white/95 shadow-sm"
        style={{ left: `${position}%` }}
      />

      {/* Floating Liquid Glass Knob Handle: Positioned directly on interactive divider line */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
        style={{ left: `${position}%` }}
      >
        <div
          className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center shadow-lg border border-white/60 text-base-content scale-100 hover:scale-110 active:scale-95 transition-transform duration-150"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 text-base-content/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l-3 3m0 0l3 3m-3-3h14m-3-6l3 3m0 0l-3 3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
