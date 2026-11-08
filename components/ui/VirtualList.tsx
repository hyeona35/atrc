"use client";

import React, { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface VirtualListProps<T> {
  /** Array of items to be rendered virtually. */
  items: T[];
  /** Estimated or fixed height in pixels for each row (defaults to 56px). */
  itemHeight?: number;
  /** Render callback for each virtual item. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Session storage key used for automatic scroll position restoration. */
  storageKey?: string;
  /** Custom EmptyState or fallback node when items array is empty. */
  emptyState?: React.ReactNode;
  /** Additional CSS class names for the virtual list container. */
  className?: string;
  /** Fixed container height (e.g. '360px' or 360). */
  containerHeight?: string | number;
}

export function VirtualList<T>({
  items,
  itemHeight = 56,
  renderItem,
  storageKey = "eh_virtual_list_scroll",
  emptyState,
  className = "",
  containerHeight = "360px",
}: VirtualListProps<T>) {
  "use no memo";
  const parentRef = useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  // Restore scroll position from sessionStorage
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved && parentRef.current) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          parentRef.current.scrollTop = parsed;
        }
      }
    } catch {
      // Storage unavailable
    }
  }, [storageKey]);

  // Persist scroll position to sessionStorage on scroll
  const handleScroll = () => {
    if (!storageKey || !parentRef.current) return;
    try {
      sessionStorage.setItem(storageKey, String(parentRef.current.scrollTop));
    } catch {
      // Storage unavailable
    }
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          height:
            typeof containerHeight === "number"
              ? `${containerHeight}px`
              : containerHeight,
        }}
        className={`relative w-full rounded-2xl border border-base-content/15 bg-base-100 flex items-center justify-center p-6 ${className}`}
      >
        {emptyState ?? (
          <span
            className="text-sm font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            표시할 항목이 없습니다.
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      style={{
        height: typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight,
        overflowY: "auto",
        contain: "strict",
      }}
      className={`relative w-full rounded-2xl border border-base-content/15 bg-base-100 ${className}`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;
          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex items-center px-4 border-b border-base-content/10"
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
