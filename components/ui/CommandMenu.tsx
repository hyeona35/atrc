"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  IconSearch,
  IconGrid,
  IconCompass,
  IconSliders,
  IconLayers,
  IconBellShield,
  IconMoon,
  IconSun,
  IconXMark,
} from "./icons";
import { triggerHaptic } from "@/lib/haptics";

export interface CommandMenuItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  onSelect: () => void;
  keywords?: string[];
}

export interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionId: string) => void;
  theme: "light" | "dark";
  onToggleTheme: (isDark: boolean) => void;
  customItems?: CommandMenuItem[];
}

function CommandMenuDialog({
  onClose,
  onSelectSection,
  theme,
  onToggleTheme,
  customItems,
}: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
  };

  const defaultItems: CommandMenuItem[] = [
    {
      id: "sec-overview",
      title: "관측 요약으로 이동",
      category: "화면 이동",
      icon: <IconGrid className="w-4 h-4" />,
      onSelect: () => onSelectSection("overview"),
      keywords: ["overview", "home", "메인", "요약"],
    },
    {
      id: "sec-signals",
      title: "실시간 검증 시그널",
      category: "화면 이동",
      icon: <IconCompass className="w-4 h-4" />,
      onSelect: () => onSelectSection("signals"),
      keywords: ["signals", "시그널", "뉴스"],
    },
    {
      id: "sec-models",
      title: "프론티어 지능 및 벤치마크",
      category: "화면 이동",
      icon: <IconLayers className="w-4 h-4" />,
      onSelect: () => onSelectSection("models"),
      keywords: ["models", "모델", "벤치마크"],
    },
    {
      id: "sec-macro",
      title: "거시경제 · 미래 마일스톤",
      category: "화면 이동",
      icon: <IconSliders className="w-4 h-4" />,
      onSelect: () => onSelectSection("macro"),
      keywords: ["macro", "거시", "미래"],
    },
    {
      id: "sec-x",
      title: "주요 인물 X 피드",
      category: "화면 이동",
      icon: <IconBellShield className="w-4 h-4" />,
      onSelect: () => onSelectSection("x-feed"),
      keywords: ["x", "twitter", "트위터", "인물"],
    },
  ];

  const themeItem: CommandMenuItem = {
    id: "theme-toggle",
    title: theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환",
    category: "테마 및 설정",
    icon: theme === "dark" ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />,
    onSelect: () => onToggleTheme(theme !== "dark"),
    keywords: ["theme", "dark", "light", "모드"],
  };

  const items: CommandMenuItem[] = customItems
    ? [...customItems, themeItem]
    : [...defaultItems, themeItem];

  const filtered = items.filter((item) => {
    if (!query.trim()) return true;
    const lower = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower) ||
      item.keywords?.some((k) => k.toLowerCase().includes(lower))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filtered[selectedIndex];
      if (current) {
        triggerHaptic("selection");
        current.onSelect();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="커맨드 메뉴"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 select-none"
    >
      <div
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: "var(--liquid-glass-dimming)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-lg liquid-glass-elevated rounded-3xl shadow-2xl border border-base-content/15 overflow-hidden flex flex-col z-10"
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--separator)" }}
        >
          <IconSearch className="w-5 h-5 text-base-content/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="명령어 입력 또는 섹션 검색… (ESC로 닫기)"
            className="w-full bg-transparent border-0 outline-none p-0 text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:ring-0"
          />
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs rounded-xl pst-press text-base-content/60 hover:text-base-content"
          >
            <IconXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Command Menu Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-base-content/50">
              검색된 명령어나 섹션이 없습니다
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-start text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? "bg-primary/14 text-accent-primary ring-1 ring-primary/30"
                      : "text-base-content hover:bg-base-content/6"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </span>
                  <span className="text-[11px] font-normal opacity-60 shrink-0 ps-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div
          className="px-4 py-2 border-t flex items-center justify-between text-[11px] font-medium opacity-60"
          style={{ borderColor: "var(--separator)" }}
        >
          <span>↑↓ 탐색 · Enter 선택</span>
          <span>ESC 닫기</span>
        </div>
      </div>
    </div>
  );
}

export function CommandMenu(props: CommandMenuProps) {
  if (!props.isOpen) return null;
  return <CommandMenuDialog {...props} />;
}
