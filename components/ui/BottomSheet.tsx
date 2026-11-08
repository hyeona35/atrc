"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { triggerHaptic } from "@/lib/haptics";
import { IconXMark } from "./icons";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  dismissThreshold?: number; // px downward before dismissing
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  dismissThreshold = 80,
  className = "",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const isInsideBodyRef = useRef<boolean>(false);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const titleId = useId();

  const handleClose = React.useCallback(() => {
    setTranslateY(0);
    setIsDragging(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as Node | null;
    const isInsideBody = Boolean(
      bodyRef.current && target && bodyRef.current.contains(target)
    );
    isInsideBodyRef.current = isInsideBody;
    startYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    // If touch started inside scrollable content, only drag down if body is scrolled to the top
    if (isInsideBodyRef.current && bodyRef.current && bodyRef.current.scrollTop > 0) {
      return;
    }
    // Apple Fluid Interfaces: Rubber-banding resistance when dragged upward beyond boundary
    if (deltaY < 0) {
      const overshoot = -deltaY;
      const dimension = 400; // approximate sheet height dimension
      const resisted = (overshoot * dimension * 0.55) / (dimension + 0.55 * overshoot);
      currentYRef.current = -resisted;
      setTranslateY(-resisted);
    } else {
      currentYRef.current = deltaY;
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (startYRef.current === null) return;
    const deltaY = currentYRef.current;
    const duration = Date.now() - startTimeRef.current;
    const velocityPxPerSec = (deltaY / Math.max(1, duration)) * 1000; // px/s
    // Apple Fluid Interfaces: Exponential decay momentum projection (Designing Fluid Interfaces WWDC 2018)
    const decelerationRate = 0.998;
    const projectedDistance = (velocityPxPerSec / 1000) * decelerationRate / (1 - decelerationRate);
    const projectedEndpoint = deltaY + projectedDistance;

    setIsDragging(false);
    startYRef.current = null;
    currentYRef.current = 0;
    isInsideBodyRef.current = false;

    // Trigger dismiss if pulled down past threshold or projected endpoint crosses dismiss threshold
    if (deltaY > dismissThreshold || projectedEndpoint > 180 || (velocityPxPerSec > 400 && deltaY > 25)) {
      triggerHaptic("medium");
      handleClose();
    } else {
      triggerHaptic("light");
      setTranslateY(0);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 select-none"
    >
      {/* Dimmed Liquid Glass Backdrop */}
      <div
        className="fixed inset-0 transition-opacity duration-300 ease-out"
        style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet Modal Box with Drag-to-Dismiss Handle & Strong Curvature */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          maxHeight: "calc(90dvh - env(safe-area-inset-top, 0px))",
        }}
        className={`relative w-full sm:max-w-lg liquid-glass-elevated rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden pb-safe z-10 ${className}`}
      >
        {/* Pill Drag Handle for Mobile Intuitive Affordance */}
        <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing sm:hidden">
          <span
            className="w-12 h-1.5 rounded-full bg-base-content/25 hover:bg-base-content/40 transition-colors"
            aria-hidden="true"
          />
        </div>

        {/* Sheet Header */}
        {(title || description) && (
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "var(--separator)" }}
          >
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="text-base font-bold tracking-tight text-base-content"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="닫기"
              className="btn btn-ghost btn-circle btn-sm rounded-xl pst-press text-base-content"
            >
              <IconXMark className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sheet Body */}
        <div ref={bodyRef} className="p-5 overflow-y-auto overflow-x-hidden flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
