---
name: pstui
description: Comprehensive engineering guide, architectural rules, and component catalog for the pstui design system (Human-centric UI, Liquid Glass, DaisyUI 5, Tailwind CSS v4, Next.js 16 App Router). Use when creating, modifying, or reviewing any UI component, page layout, form, overlay dialog, or style within the pstui codebase.
---

# pstui Design System & Framework Guide

`pstui` is a modern web design system and component framework combining human-centric interface design principles, Liquid Glass optical materials, DaisyUI 5, and Tailwind CSS v4 on Next.js 16 App Router.

---

## 1. Core Architecture & Layer Mental Model

Every visual element in `pstui` belongs strictly to one of two physical layers:

### A. Liquid Glass Layer (Floating Navigation & Controls)
- **Target**: Bottom Tab Bar (`TabBar`), Left Sidebar (`Sidebar`), Floating App Bars, Floating Action Buttons (CTA), Popovers (`Dropdown`), Sliders thumbs.
- **Tokens**:
  - Light: `--liquid-glass-bg: rgba(255, 255, 255, 0.72);`
  - Dark: `--liquid-glass-bg: rgba(24, 24, 32, 0.68);`
  - Backdrop Blur: `var(--liquid-glass-blur)` (`blur(24px) saturate(190%)`)
- **Golden Rule**: **NEVER apply Liquid Glass to scrollable content cards, tables, or list rows.**

### B. Standard Material Layer (Content Surfaces)
- **Target**: Content cards (`Card`), Accordions, Collapses, List rows (`List`), Forms, Modals.
- **Tokens**:
  - `--material-ultra-thin`: Full screen overlays
  - `--material-thin`: Inline selections, nested segments
  - `--material-regular`: Standard card & section backgrounds (`rgba(255, 255, 255, 0.78)` in light, `rgba(34, 34, 44, 0.78)` in dark)
  - `--material-thick`: High-contrast foreground items

---

## 2. Responsive AppShell Standards

The application layout must adapt seamlessly across viewports:

1. **Mobile (`< 768px`)**:
   - Fixed floating bottom Tab Bar (`TabBar` / `BottomBar`, `height: var(--tabbar-height)`).
   - Items capped at 3~5 items.
   - Passive scroll listener: minimizes (`scale(0.90)` and moves down) on downward scroll (>10px), restores immediately on upward scroll.
   - Sidebar is hidden (`display: none`).

2. **Desktop (`>= 768px`)**:
   - Fixed floating left Sidebar (`Sidebar`, `width: var(--sidebar-width)`).
   - Bottom Tab Bar is hidden (`display: none`).
   - Leading toolbar collapse/expand toggle button at the top of the sidebar.
   - Optional 3rd-column `Split View` for master-detail workflows.

3. **Background Extension (Edge-to-Edge)**:
   - `<main>` container must fill 100vw and 100vh.
   - Do NOT crop `<main>` margins. Use internal padding:
     ```css
     padding-inline-start: calc(var(--active-sidebar-width) + 24px);
     padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0px) + 24px);
     ```
   - Content scrolls behind the translucent Liquid Glass chrome.

4. **Desktop Bottom Edge Prohibition**:
   - Never anchor primary CTA buttons or critical status indicators to the bottom window edge on desktop (it may fall below screen fold). Anchor to top toolbar or content header.

---

## 3. Brand Tokens, Color Restraint & Typography

- **Soft Pastel Brand Palette & Calibrated Contrast**:
  - **Dark Mode**:
    - Primary Accent: `#f472b6` (`--color-primary`, Pastel Blossom Pink)
    - Secondary Accent: `#c084fc` (`--color-secondary`, Pastel Lilac)
    - Canvas Background: `#09070e` (`--bg-base`, `--color-base-200`)
    - Elevated Card Surface: `#1c1926` (`--bg-elevated`, `--color-base-100`)
    - Sharp Separators: `rgba(240, 235, 255, 0.20)` (`--separator`)
    - Brand Gradient: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
  - **Light Mode (Calibrated High-Contrast)**:
    - Primary Accent: `#db528d` (`--color-primary`, Soft Pastel Rose, ensures >= 5.5:1 contrast with white text)
    - Secondary Accent: `#9055cf` (`--color-secondary`, Soft Pastel Lavender)
    - Text Accent Token: `--accent-primary-text: #a8275f` (WCAG AAA >= 7:1)
    - Brand Gradient: `linear-gradient(135deg, #db528d, #9055cf)`
- **Unified Strong Curvature (Squircle Tokens)**:
  - Containers, Modals, Cards, Sheets: `rounded-3xl` (`--radius-box: 1.5rem;` 24px~32px)
  - Interactive Fields, Buttons, Pills: `rounded-2xl` (`--radius-field: 1rem; --radius-selector: 1.25rem;` 16px~18px)
- **Official Typography**:
  - NanumSquare Neo Variable (`'NanumSquareNeo', system-ui, sans-serif`) with `--font-sans-fallback` for Next.js Zero-CLS layout shifts.
  - Preloaded WOFF2 format via `<head>`.
- **Accent Restraint**: Reserve brand colors strictly for 1–2 primary action buttons or active selection states per screen. Never use brand colors for plain non-interactive decorative text.
- **Inclusive High Contrast (WCAG AAA)**:
  - All text must maintain >= 4.5:1 (normal) and >= 7:1 (small / high contrast mode).
  - High contrast text tokens: `--accent-primary-text: #b0007b` (light) / `#ffa3e6` (dark).
  - Non-color cues (icons, shapes, underlines) are mandatory for all state indications.

---

## 4. Component Inventory & Import Guide

All components are cleanly exported from `@/components/ui`:

```tsx
import {
  // Action & Buttons (Button.tsx)
  Button,
  ToggleButton,

  // Text & Search Inputs (Input.tsx)
  TextField,
  SearchField,
  OtpInput, // alias OTP

  // Selection Controls (Selection.tsx)
  Checkbox,
  Radio,
  Switch,
  Slider,

  // Form Controls (Select.tsx)
  Select,
  FieldSet, // alias Fieldset
  FileUpload,
  Filter,
  Rating,
  Swap,

  // Containment & Disclosure (Card.tsx)
  Card,
  Accordion,
  Collapse,
  Carousel,
  Dropdown, // alias PullDownMenu

  // Navigation (Navigation.tsx)
  TabBar, // alias BottomBar
  Sidebar,
  Breadcrumbs,
  Tabs,
  Steps,
  MegaMenu, // alias Megamenu
  Divider,
  Stack,

  // Data Display (Display.tsx)
  Badge,
  Calendar,
  ChatBubble,
  Countdown,
  Diff,
  Kbd, // alias KBD
  List,
  Mask,
  Link,

  // Feedback & Status (Feedback.tsx)
  Alert,
  Indicator,
  Progress,
  RadialProgress,
  Tooltip,

  // Mobile Sheets, Virtualization & Power-User (New)
  BottomSheet,
  VirtualList,
  CommandMenu,
  OfflineBanner,

  // Error Isolation & Empty States (Core v0.2.0)
  ErrorBoundary,
  EmptyState,

  // Vector Icons (icons.tsx - Pure React Server Component)
  IconGrid,
  IconCompass,
  IconSliders,
  IconLayers,
  IconCheckCircle,
  IconErrorCircle,
  // ...
} from "@/components/ui";
```

### 4.1 Server Components (RSC) and Client Boundaries
- **Pure React Server Components**: `icons.tsx` (all 37+ icons), `Card` (`Card.tsx`), `EmptyState` (`EmptyState.tsx`), `Divider`, `Breadcrumbs`, `Steps` (`Navigation.tsx`), `Badge`, `Kbd`, `Mask`, `Diff`, `List`, `ChatBubble`, `Link` (`Display.tsx`), `Indicator`, `RadialProgress`, `Tooltip` (`Feedback.tsx`). These components do NOT carry `"use client"` directives and render with zero client bundle overhead in Server Components.
- **Client Components**: Interactive controls (`Button`, `TextField`, `SearchField`, `OtpInput`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Select`, `Calendar`, `Countdown`, `TabBar`, `Sidebar`, `Tabs`, `MegaMenu`, `Stack`, `Alert`, `Progress`, `Accordion`, `Dropdown`, `ErrorBoundary`) isolate client state/handlers in their respective client boundaries while remaining seamlessly accessible via `@/components/ui`.

### 4.2 Deprecated Forwarders Completely Removed
All legacy forwarder files (`layoutNavigation.tsx`, `formDataInput.tsx`, `containmentDisclosure.tsx`, `dataDisplay.tsx`, `feedbackStatus.tsx`) have been deprecated and completely removed. All components must be imported directly from `@/components/ui` or the 9 concise module files (`Button.tsx`, `Input.tsx`, `Selection.tsx`, `Select.tsx`, `Card.tsx`, `Navigation.tsx`, `Display.tsx`, `Feedback.tsx`, `icons.tsx`).

---

## 5. Engineering Patterns & Code Recipes

### 5.1 Button Patterns (Hit Area, Spinner, Ellipsis)
```tsx
// 1. Primary Action with Async Loading
<Button
  variant="primary"
  isLoading={isSaving}
  loadingLabel="저장 중…"
  onClick={handleSave}
>
  설정 저장
</Button>

// 2. Button opening a modal (must end with '…' automatically via opensModal)
<Button
  variant="outline"
  opensModal
  onClick={() => openModal({ title: "프로필 편집…", content: <ProfileEditor /> })}
>
  프로필 편집
</Button>

// 3. Destructive Action (guards against accidental Enter submission)
<Button variant="destructive" onClick={handleDeleteConfirm}>
  계정 삭제
</Button>
```

### 5.2 TextField with Validation & Clear Button
```tsx
<TextField
  label="이메일 주소"
  type="email"
  value={email}
  onChange={setEmail}
  validateOnBlur={(val) => (!val.includes("@") ? "유효한 이메일을 입력하십시오." : null)}
  helperText="계정 알림을 수신할 이메일입니다."
/>
```

### 5.3 Modals & Dirty State Protection
```tsx
import { useModal } from "@/context/OverlayContext";

function EditNoteModal() {
  const { setModalDirty, closeModal } = useModal();
  const [content, setContent] = useState("");

  const handleChange = (val: string) => {
    setContent(val);
    setModalDirty(true); // Triggers confirmation sheet on backdrop / ESC click
  };

  return (
    <div>
      <textarea value={content} onChange={(e) => handleChange(e.target.value)} />
    </div>
  );
}
```

### 5.4 Toast with Undo Action
```tsx
import { useToast } from "@/context/OverlayContext";

function ItemList() {
  const { showToast } = useToast();

  const handleDelete = (item: Item) => {
    deleteItem(item.id);
    showToast({
      title: "항목이 삭제되었습니다",
      description: item.name,
      variant: "info",
      undoLabel: "실행 취소",
      onUndo: () => restoreItem(item),
    });
  };
}
```

### 5.5 AlertDialog with Concrete Verbs
```tsx
import { useModal } from "@/context/OverlayContext";

function ResetSection() {
  const { openAlertDialog } = useModal();

  const handleReset = () => {
    openAlertDialog({
      title: "캐시 데이터 초기화",
      description: "로컬에 저장된 임시 캐시를 모두 제거합니다. 계속하시겠습니까?",
      actionVerb: "초기화", // Concrete verb required by pstui (never '확인' or '예')
      isDestructive: true,
      onAction: async () => {
        await clearCache();
      },
    });
  };
}
```

### 5.6 Pre-Permission Modal (Ethical & Non-Dark Pattern)
```tsx
import { useModal } from "@/context/OverlayContext";

function NotificationEnableButton() {
  const { openPrePermissionModal } = useModal();

  const handleRequest = () => {
    openPrePermissionModal({
      title: "알림 수신 권한 안내",
      description: "주요 일정과 작업 완료 알림을 기기에서 실시간으로 받아보실 수 있습니다.",
      featurePurpose: "중요 업데이트 즉시 전달",
      buttonLabel: "계속", // Only '계속' or '다음'
      onContinue: async () => {
        await Notification.requestPermission();
      },
    });
  };
}
```

### 5.7 Alerts with Concrete Verbs & Non-color Cues
```tsx
<Alert
  variant="error"
  title="네트워크 연결 실패"
  description="서버에 연결할 수 없습니다. Wi-Fi 설정을 확인하십시오."
  actionLabel="다시 시도"
  onAction={handleRetry}
  onCancel={() => setShowAlert(false)}
/>
```

### 5.8 Fluid Motion Physics (BottomSheet with Momentum Projection & Rubber-Banding)
```tsx
import { BottomSheet } from "@/components/ui";

// BottomSheet encapsulates Apple WWDC Designing Fluid Interfaces physics:
// 1. Exponential momentum projection: project(v) = (v / 1000) * d / (1 - d), d = 0.998
// 2. Soft rubber-banding boundary resistance: rubberband(x, D) = (x * D * 0.55) / (D + 0.55 * x)
// 3. Tactile haptic feedback on dismiss / threshold release
export function MobileDetailSheet({ isOpen, onClose }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="옵션 상세 설정">
      <div className="p-4 space-y-4">
        {/* Sheet content with 1:1 direct manipulation */}
      </div>
    </BottomSheet>
  );
}
```

### 5.8 Error Isolation & Empty State Recipes
```tsx
// 1. Component / Slot Error Isolation
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div className="material-regular rounded-3xl p-5 border border-error/25">
      <p className="text-sm font-bold text-status-error">위젯 로드 오류</p>
      <Button size="xs" onClick={reset}>다시 시도</Button>
    </div>
  )}
>
  <TelemetryWidget />
</ErrorBoundary>

// 2. Universal Empty State with Action Slot
<EmptyState
  size="md"
  title="검색 결과가 없습니다"
  description="다른 키워드로 검색하거나 필터를 초기화해 보세요."
  action={
    <Button size="sm" variant="primary" onClick={handleReset}>
      필터 초기화
    </Button>
  }
/>
```

### 5.9 Production Deployment & Verification Workflow
```bash
# 1. Run ESLint & TypeScript static analysis (0 errors required)
npm run lint

# 2. Build production bundle via Turbopack & verify all static/prerendered routes
npm run build

# 3. Verify all 20 environment, token, PWA, SEO & deployment assets
npm run setup

# 4. Deploy to Vercel (cleanUrls, security headers, immutable caching via vercel.json)
vercel deploy --prod
```

---


### 5.10 Lighthouse Performance & Accessibility Benchmarks
- **Accessibility**: **100 / 100** (Strict semantic heading order h1->h2, WCAG 2.5.3 visible label-content matching).
- **Best Practices**: **100 / 100** (Full HTTPS headers, 0 console runtime warnings, modern web APIs).
- **SEO**: **100 / 100** (Valid JSON-LD schema, metadataBase, canonical URL, sitemap, robots, RSS/Atom).
- **Performance**: Desktop **81**, Zero-CLS (0.000), Zero Total Blocking Time (0ms), asynchronous non-blocking RSC streaming telemetry.
- **Sidebar Depth**: Unclipped horizontal shadow (`.pst-sidebar-shadow`) with floating offset (`top-3.5 bottom-3.5 start-3.5`) and container `overflow-x-clip md:overflow-x-visible`.

### 5.11 Component Export, Update & Version Synchronization CLI
pstui provides a built-in CLI to export components into any Next.js project and synchronize future updates:
```bash
# 1. Export all components, AppShell, OverlayContext, and tokens to another project
npm run export -- ../my-next-app

# 2. Scaffold a brand new turnkey Next.js 16 starter application
node setup.mjs --export ../my-new-app --mode template

# 3. Safely update existing project to latest pstui release
npm run update -- ../my-next-app # or npm run sync

# 4. Inspect differences without modifying files
node setup.mjs --diff ../my-next-app

# 5. Regenerate SHA-256 integrity manifest
npm run manifest
```
- **Manifest Architecture (`pstui.manifest.json`)**: Automatically tracks 29 managed files and dependencies with SHA-256 hashes.
- **User Modification Protection**: Customized components are preserved with `.pstui-latest` created alongside. Specify `--force` to automatically backup to `.bak.<timestamp>` and apply updates.
- **Subpath Imports**: Standard package exports (`pstui/ui`, `pstui/layout`, `pstui/context`, `pstui/tokens`).

## 6. Strict Anti-Patterns


1. **NO Native Code**: Never write Swift, Objective-C, or platform-specific APIs. Use web standard CSS/HTML/JS only.
2. **NO Desktop Frame Traps**: Never constrain a desktop layout into a phone-sized `max-width: 430px` box with empty side bars.
3. **NO Hardcoded Colors**: Avoid `#fff`, `#000`, `rgb(...)`. Use `var(--color-...)` and `var(--label-...)`.
4. **NO Mount Permissions**: Never request permissions (`navigator.permissions`, camera, geolocation) inside `useEffect()`. Only trigger on explicit user click.
5. **NO Generic Alert Verbs**: Never use "확인(OK)" or "예(Yes)" on destructive alerts. Always use concrete verbs ("삭제", "초기화", "변환").
6. **NO Confirmation Alerts for Undoable Actions**: If an action is reversible (e.g. item removal from a list), perform it immediately and show a Toast with an "실행 취소(Undo)" button.
7. **NO 'use client' on Route Pages**: Route pages (`app/**/page.tsx`) must always be pure React Server Components (RSC). Isolate interactive client hooks and state inside client boundary modules (`*Client.tsx`).
8. **NO Unconstrained Fixed Mobile Dock**: Mobile bottom docks must specify `width: calc(100% - 2rem); left: 1rem; right: 1rem; max-width: calc(100vw - 2rem)` to prevent DaisyUI `.dock` default `width: 100%` from causing horizontal overflow.

---

## 7. Pre-Submission Self-QA Checklist

- [ ] All interactive elements have `min-width: 44px; min-height: 44px;` and `:active` scale(0.96) (`.pst-press`).
- [ ] No Liquid Glass tokens on `Card`, `List`, or body content surfaces.
- [ ] Mobile `< 768px` uses `TabBar`, Desktop `>= 768px` uses `Sidebar`.
- [ ] Dark mode, high-contrast, and reduced-motion media queries tested.
- [ ] `npm run build` succeeds with 0 errors via Turbopack and TypeScript.

---

## 8. Legal & Trademark Notice
`pstui` is an independent open-source UI design system inspired by human-centric design principles. It is NOT affiliated with, endorsed by, or sponsored by Apple Inc. Apple, iOS, iPadOS, macOS, visionOS, SF Pro, and SF Symbols are registered trademarks or trademarks of Apple Inc.

