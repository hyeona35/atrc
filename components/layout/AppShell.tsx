"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  BottomBar,
  Sidebar,
  type BottomBarItem,
  type SidebarNavItem,
  type CommandMenuItem,
  Button,
  ToggleButton,
  Badge,
  KBD,
} from "@/components/ui";
import {
  IconBellShield,
  IconCheckCircle,
  IconCompass,
  IconGrid,
  IconLayers,
  IconMoon,
  IconSidebarLeft,
  IconSliders,
  IconSplitView,
  IconSun,
  IconUser,
} from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useModal, useToast } from "@/context/OverlayContext";

import dynamic from "next/dynamic";

const CommandMenu = dynamic(
  () => import("@/components/ui/CommandMenu").then((mod) => mod.CommandMenu),
  { ssr: false }
);
const OfflineBanner = dynamic(
  () => import("@/components/ui/OfflineBanner").then((mod) => mod.OfflineBanner),
  { ssr: false }
);
import { triggerHaptic } from "@/lib/haptics";

function subscribeColorScheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getColorSchemeSnapshot(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getColorSchemeServerSnapshot(): "light" | "dark" {
  return "light";
}

export interface SectionMeta {
  title: string;
  badge: string;
  description?: string;
}

export interface SplitViewItem {
  id: string;
  title: string;
  count: string;
}

export interface AppShellProps {
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
  title?: string;
  subtitle?: string;
  brandLabel?: string;
  defaultTheme?: "light" | "dark";
  sectionTitles?: Record<string, SectionMeta>;
  sidebarItems?: SidebarNavItem[];
  mobileTabs?: BottomBarItem[];
  activeMobileTabId?: string;
  headerCenterSlot?: React.ReactNode;
  headerRightExtraSlot?: React.ReactNode;
  mobileRightExtraSlot?: React.ReactNode;
  hideSplitViewToggle?: boolean;
  hideAuthControls?: boolean;
  minimalHeader?: boolean;
  splitViewItems?: SplitViewItem[];
  commandItems?: CommandMenuItem[];
  children: React.ReactNode;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    id: "overview",
    label: "관측 요약",
    icon: <IconGrid className="w-5 h-5" />,
    activeIcon: <IconGrid className="w-5 h-5" filled />,
  },
  {
    id: "signals",
    label: "실시간 시그널",
    icon: <IconCompass className="w-5 h-5" />,
    activeIcon: <IconCompass className="w-5 h-5" filled />,
  },
  {
    id: "models",
    label: "프론티어 지능",
    icon: <IconLayers className="w-5 h-5" />,
    activeIcon: <IconLayers className="w-5 h-5" filled />,
  },
  {
    id: "macro",
    label: "거시 · 미래",
    icon: <IconSliders className="w-5 h-5" />,
    activeIcon: <IconSliders className="w-5 h-5" filled />,
  },
];

const MOBILE_BOTTOM_ITEMS: BottomBarItem[] = [
  {
    id: "overview",
    label: "요약",
    icon: <IconGrid className="w-5 h-5" />,
    activeIcon: <IconGrid className="w-5 h-5" filled />,
  },
  {
    id: "signals",
    label: "시그널",
    icon: <IconCompass className="w-5 h-5" />,
    activeIcon: <IconCompass className="w-5 h-5" filled />,
  },
  {
    id: "models",
    label: "지능",
    icon: <IconLayers className="w-5 h-5" />,
    activeIcon: <IconLayers className="w-5 h-5" filled />,
  },
  {
    id: "macro",
    label: "거시",
    icon: <IconBellShield className="w-5 h-5" />,
    activeIcon: <IconBellShield className="w-5 h-5" filled />,
  },
];

const DEFAULT_SECTION_TITLES: Record<string, SectionMeta> = {
  overview: { title: "관측 요약", badge: "실시간" },
  signals: { title: "실시간 시그널", badge: "자동 요약" },
  models: { title: "프론티어 지능", badge: "레지스트리" },
  macro: { title: "거시 · 미래", badge: "12대 지표" },
};

export function AppShell({
  activeSection: controlledActiveSection,
  onSelectSection: controlledOnSelectSection,
  title = "Event Horizon",
  subtitle = "실시간 AI 시그널 자동 요약 및 특이점 관측소",
  brandLabel = "Event Horizon",
  defaultTheme,
  sectionTitles = DEFAULT_SECTION_TITLES,
  sidebarItems,
  mobileTabs,
  activeMobileTabId,
  headerCenterSlot,
  headerRightExtraSlot,
  mobileRightExtraSlot,
  hideSplitViewToggle = false,
  hideAuthControls = false,
  minimalHeader = false,
  splitViewItems,
  commandItems,
  children,
}: AppShellProps) {
  const resolvedSidebarItems = sidebarItems ?? SIDEBAR_ITEMS;
  const resolvedMobileTabs = mobileTabs ?? MOBILE_BOTTOM_ITEMS;
  const defaultHomeSection = resolvedSidebarItems[0]?.id || "overview";

  const [internalActiveSection, setInternalActiveSection] =
    useState<string>(defaultHomeSection);
  const activeSection = controlledActiveSection ?? internalActiveSection;
  const onSelectSection = controlledOnSelectSection ?? setInternalActiveSection;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [showSplitView, setShowSplitView] = useState<boolean>(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState<boolean>(false);
  const osColorScheme = useSyncExternalStore(
    subscribeColorScheme,
    getColorSchemeSnapshot,
    getColorSchemeServerSnapshot
  );
  const [userThemeOverride, setUserThemeOverride] = useState<
    "light" | "dark" | null
  >(defaultTheme ?? null);
  const theme = userThemeOverride ?? osColorScheme;

  const { user, openAuthModal, signOut } = useAuth();
  const { openAlertDialog } = useModal();
  const { showToast } = useToast();

  const currentSection = sectionTitles[activeSection] ?? DEFAULT_SECTION_TITLES[activeSection] ?? {
    title: "관측 요약",
    badge: "실시간",
  };

  // Synchronize document.title dynamically based on page / section per Requirement 5
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${currentSection.title} — ${title}`;
    }
  }, [currentSection.title, title]);

  // Synchronize documentElement data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Power-user global shortcut (⌘K / Ctrl+K) for Command Menu per Requirement 31
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
        triggerHaptic("selection");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = (nextDark: boolean) => {
    const nextTheme = nextDark ? "dark" : "light";
    setUserThemeOverride(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    triggerHaptic("selection");
    if (!minimalHeader) {
      showToast({
        title: nextDark
          ? "다크 모드(Elevated Pastel Depth) 적용됨"
          : "라이트 모드(Soft Pastel Surface) 적용됨",
        variant: "info",
        durationMs: 2500,
      });
    }
  };

  const handleSignOutConfirm = () => {
    triggerHaptic("medium");
    openAlertDialog({
      title: "현재 세션에서 로그아웃하시겠습니까?",
      description:
        "로그아웃하더라도 임시 저장된 워크스페이스 초안은 기기에 안전하게 보관됩니다.",
      actionVerb: "로그아웃",
      isDestructive: true,
      onAction: async () => {
        await signOut();
      },
    });
  };

  return (
    <div
      style={
        {
          "--active-sidebar-width": isSidebarCollapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
        } as React.CSSProperties
      }
      className="relative w-full min-h-dvh overflow-x-clip md:overflow-x-visible"
    >
      {/* 1. Tablet & PC (>= md) Fixed Collapsible Liquid Glass Sidebar */}
      <Sidebar
        items={resolvedSidebarItems}
        activeId={activeSection}
        onSelect={onSelectSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        brandLabel={brandLabel}
      />

      {/* 2. Edge-to-Edge Background Extension Main Content (<main> spans 100vw, 100dvh; uses internal padding so content scrolls behind Liquid Glass) */}
      <main
        className="w-full min-h-dvh transition-all duration-300 ease-out px-4 sm:px-6 md:pe-6 pt-3 md:ps-[calc(var(--active-sidebar-width)+24px)]"
        style={{
          paddingBottom:
            "calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0px) + 32px)",
        }}
      >
        {/* 2A. Desktop/Tablet (>= md) Unified Top Workspace App Bar (Strong Curvature rounded-3xl) */}
        <header className="hidden md:flex sticky top-3 z-20 liquid-glass rounded-3xl px-4 py-2.5 items-center justify-between gap-3 transition-all duration-300 ease-out mb-5 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 shrink">
            {/* Leading Sidebar Collapse/Expand Toggle Button per Requirement 1 */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setIsSidebarCollapsed((prev) => !prev);
              }}
              aria-label={
                isSidebarCollapsed
                  ? "사이드바 전체 확장 모드로 전환"
                  : "사이드바 미니 아이콘 모드로 접기"
              }
              className="btn btn-sm btn-ghost btn-square rounded-2xl pst-press border border-base-content/20 text-base-content shrink-0"
            >
              <IconSidebarLeft
                className={`w-4 h-4 transition-transform duration-300 ${
                  isSidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                onSelectSection(defaultHomeSection);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="text-start flex flex-col justify-center min-w-0 cursor-pointer pst-press group focus-visible:outline-2 focus-visible:outline-primary rounded-xl p-1 -m-1"
              title={`${currentSection.title} - 메인으로 이동`}
              aria-label={`${currentSection.title} - 메인으로 이동 및 맨 위로 스크롤`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {!minimalHeader && (
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-hidden="true"
                  />
                )}
                <h1 className="text-base font-bold tracking-tight text-base-content group-hover:text-primary transition-colors truncate">
                  {currentSection.title}
                </h1>
                {!minimalHeader && (
                  <Badge variant="primary" size="xs">
                    {currentSection.badge}
                  </Badge>
                )}
              </div>
              {!minimalHeader && (
                <p
                  className="text-xs font-medium truncate ps-4.5"
                  style={{ color: "var(--label-secondary)" }}
                >
                  {currentSection.description ?? subtitle}
                </p>
              )}
            </button>
          </div>

          {/* Optional Center Command Bar Slot (e.g. Live API & Tibo Limit Reset Ticker) */}
          {headerCenterSlot && (
            <div className="hidden xl:flex items-center justify-center min-w-0 shrink">
              {headerCenterSlot}
            </div>
          )}

          {/* Trailing Workspace Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {headerRightExtraSlot}

            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setIsCommandMenuOpen(true);
              }}
              className="pst-press cursor-pointer inline-flex items-center"
              aria-label="빠른 이동 커맨드 메뉴 (⌘K)"
            >
              <KBD keys={["⌘", "K"]} size="xs" />
            </button>

            {!hideSplitViewToggle && (
              <ToggleButton
                label="보조 열"
                icon={<IconSplitView className="w-4 h-4" />}
                active={showSplitView}
                onToggle={setShowSplitView}
              />
            )}

            {minimalHeader ? (
              <button
                type="button"
                onClick={() => toggleTheme(theme !== "dark")}
                aria-label={
                  theme === "dark"
                    ? "라이트 모드로 전환"
                    : "다크 모드로 전환"
                }
                className="min-w-11 min-h-11 rounded-2xl inline-flex items-center justify-center border border-base-content/12 bg-base-100/70 hover:bg-base-100 text-base-content transition-colors pst-press"
              >
                {theme === "dark" ? (
                  <IconSun className="w-4 h-4" />
                ) : (
                  <IconMoon className="w-4 h-4" />
                )}
              </button>
            ) : (
              <ToggleButton
                label="다크"
                icon={
                  theme === "dark" ? (
                    <IconMoon className="w-4 h-4" />
                  ) : (
                    <IconSun className="w-4 h-4" />
                  )
                }
                active={theme === "dark"}
                onToggle={toggleTheme}
              />
            )}

            {!hideAuthControls &&
              (user ? (
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm badge-soft badge-success font-semibold py-2.5 px-3 inline-flex items-center gap-1 rounded-full">
                    <IconCheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{user.displayName || user.email}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSignOutConfirm}
                  >
                    로그아웃…
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  opensModal
                  leadingIcon={<IconUser className="w-4 h-4" />}
                  onClick={openAuthModal}
                >
                  로그인
                </Button>
              ))}
          </div>
        </header>

        {/* 2B. Mobile (< md) Stable Fixed-Height App Bar per Requirement 4 (Zero CLS, Zero Jittering) */}
        <header className="md:hidden sticky top-2 z-20 liquid-glass rounded-3xl px-3.5 py-2.5 flex items-center justify-between gap-2 mb-4 shadow-sm transition-all duration-300">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              onSelectSection(defaultHomeSection);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            title={`${currentSection.title} - 홈으로 이동`}
            aria-label={`${currentSection.title} - 메인으로 이동 및 맨 위로 스크롤`}
            className="text-start flex-1 min-w-0 cursor-pointer pst-press rounded-xl focus-visible:outline-2 focus-visible:outline-primary p-1 -m-1 flex items-center gap-2"
          >
            {!minimalHeader && (
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                style={{ background: "var(--gradient-brand)" }}
                aria-hidden="true"
              />
            )}
            <h1 className="font-bold tracking-tight text-base-content text-sm sm:text-base truncate">
              {currentSection.title}
            </h1>
            {!minimalHeader && (
              <span className="badge badge-xs badge-primary font-semibold shrink-0 rounded-full">
                {currentSection.badge}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {mobileRightExtraSlot}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setIsCommandMenuOpen(true);
              }}
              className="btn btn-ghost btn-circle btn-xs rounded-xl pst-press text-base-content"
              aria-label="⌘K 커맨드 메뉴 열기"
            >
              <KBD keys={["⌘K"]} size="xs" />
            </button>
            {minimalHeader ? (
              <button
                type="button"
                onClick={() => toggleTheme(theme !== "dark")}
                aria-label={
                  theme === "dark"
                    ? "라이트 모드로 전환"
                    : "다크 모드로 전환"
                }
                className="min-w-11 min-h-11 rounded-2xl inline-flex items-center justify-center border border-base-content/12 bg-base-100/70 hover:bg-base-100 text-base-content transition-colors pst-press"
              >
                {theme === "dark" ? (
                  <IconSun className="w-4 h-4" />
                ) : (
                  <IconMoon className="w-4 h-4" />
                )}
              </button>
            ) : (
              <ToggleButton
                label="다크"
                icon={
                  theme === "dark" ? (
                    <IconMoon className="w-4 h-4" />
                  ) : (
                    <IconSun className="w-4 h-4" />
                  )
                }
                active={theme === "dark"}
                onToggle={toggleTheme}
              />
            )}
            {!hideAuthControls &&
              (user ? (
                <Button
                  size="xs"
                  variant="soft"
                  onClick={handleSignOutConfirm}
                >
                  로그아웃…
                </Button>
              ) : (
                <Button
                  size="xs"
                  variant="primary"
                  opensModal
                  leadingIcon={<IconUser className="w-3.5 h-3.5" />}
                  onClick={openAuthModal}
                >
                  로그인
                </Button>
              ))}
          </div>
        </header>

        {/* 2C. Optional Split View (Secondary List Column on Tablet/PC) */}
        <div
          className={`grid gap-6 transition-all duration-300 ease-out ${
            showSplitView ? "lg:grid-cols-[260px_1fr]" : "grid-cols-1"
          }`}
        >
          {showSplitView && (
            <aside
              aria-label="보조 목록 열 (Split View)"
              className="hidden lg:block material-regular rounded-3xl shadow-xs p-4 h-fit sticky top-20 space-y-3"
            >
              <div
                className="flex items-center justify-between pb-2 border-b"
                style={{ borderColor: "var(--separator)" }}
              >
                <h2 className="text-sm font-bold text-base-content">
                  3단계 보조 열 (Split View)
                </h2>
                <Badge variant="primary" size="xs">
                  Master-Detail
                </Badge>
              </div>
              <p
                className="text-xs font-medium leading-relaxed"
                style={{ color: "var(--label-secondary)" }}
              >
                사이드바는 최대 2단계 계층까지만 유지하고, 3단계 이상의 하위 탐색은 인접한 Split View 열로 분리합니다.
              </p>
              <div className="space-y-1.5">
                {(
                  splitViewItems ?? [
                    { id: "overview", title: "관측 요약", count: "요약" },
                    { id: "signals", title: "실시간 시그널", count: "피드" },
                    { id: "x-feed", title: "인물 X 피드", count: "24인" },
                    { id: "models", title: "프론티어 지능", count: "모델" },
                    { id: "macro", title: "거시 · 미래", count: "12지표" },
                  ]
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectSection(cat.id)}
                    className={`w-full pst-press rounded-2xl px-3 py-2 text-start text-xs flex items-center justify-between transition-all ${
                      activeSection === cat.id
                        ? "bg-primary text-primary-content font-bold shadow-xs"
                        : "hover:bg-base-content/8 text-base-content font-semibold"
                    }`}
                  >
                    <span>{cat.title}</span>
                    <span
                      className={`badge badge-xs font-semibold rounded-full ${
                        activeSection === cat.id
                          ? "badge-neutral"
                          : "bg-base-content/10 text-base-content border-none"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          )}

          <div className="min-w-0">{children}</div>
        </div>
      </main>

      {/* 3. Mobile (< md) Fixed Liquid Glass BottomBar (Dock) */}
      <BottomBar
        items={resolvedMobileTabs}
        activeId={
          activeMobileTabId ??
          (activeSection === "containment" ? "navigation" : activeSection)
        }
        onSelect={onSelectSection}
      />

      {/* 4. Power-User Command Menu Dialog (⌘K) per Requirement 31 */}
      {isCommandMenuOpen && (
        <CommandMenu
          isOpen={isCommandMenuOpen}
          onClose={() => setIsCommandMenuOpen(false)}
          onSelectSection={onSelectSection}
          theme={theme}
          onToggleTheme={toggleTheme}
          customItems={commandItems}
        />
      )}

      {/* 5. Real-Time Offline Detection & Background Queueing Banner per Requirement 34 & 35 */}
      <OfflineBanner />
    </div>
  );
}
