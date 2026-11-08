# pstui — Human-Centric & Liquid Glass Web UI Framework

<div align="center">

![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![daisyUI 5](https://img.shields.io/badge/daisyUI-v5.7.50-5A0EF8?style=for-the-badge&logo=daisyui)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/badge/version-v0.2.0-pink.svg?style=for-the-badge)

<p align="center">
  <a href="#korean">한국어</a> •
  <a href="#english">English</a> •
  <a href="#japanese">日本語</a> •
  <a href="#license">License</a> •
  <a href="#disclaimer">Disclaimer</a>
</p>

</div>

---

<a id="korean"></a><a id="한국어"></a>
## 한국어 (Korean)

### 1. 개요 (Overview)
**pstui**는 인간 중심 인터랙션 디자인(Human-Centric Interaction) 철학과 **Liquid Glass** 광학 머티리얼 시스템을 크로스플랫폼 모던 웹 환경(Next.js 16 App Router, Tailwind CSS v4, DaisyUI 5)에 구현한 독립 오픈 소스 프런트엔드 UI 프레임워크 및 컴포넌트 시스템입니다 (v0.2.0 배포판).


### 2. 핵심 아키텍처 및 특징 (Key Features)

- **적응형 AppShell (Adaptive Navigation)**:
  - **모바일(`< 768px`)**: 하단 부유형 Liquid Glass 탭 막대(`TabBar` / `BottomBar`), 패시브 스크롤 리스너 기반 자동 최소화(`scale(0.90)`) 및 위로 스크롤 시 복원.
  - **데스크톱(`>= 768px`)**: 좌측 부유형 Liquid Glass 사이드바(`Sidebar`, 선행 툴바 접기/펼치기 토글) 및 선택적 3단 `Split View` 목록 열 지원.
  - **배경 확장 (Edge-to-Edge)**: 콘텐츠가 사이드바 및 탭 막대 뒤로 자연스럽게 비치도록 내부 패딩(`padding-inline-start`, `padding-bottom`) 기반 레이아웃 구성.

- **레이어 분리 원칙 (Layer Separation)**:
  - **Liquid Glass**: 콘텐츠 위에 떠 있는 탐색/기능 레이어(탭바, 사이드바, 플로팅 툴바, 팝오버)에만 적용.
  - **Standard Material**: 스크롤되는 일반 콘텐츠 카드(`Card`), 표, 리스트 행(`List`)은 고대비 정적 머티리얼(`--material-regular`)을 엄격히 적용.

- **시맨틱 브랜드 컬러 및 정밀 대비 (Brand Accent & Precision Contrast)**:
  - **라이트 모드**: 소프트 로즈/핑크(`#db528d`) 및 소프트 라벤더(`#9055cf`), 텍스트 전용 토큰(`--accent-primary-text: #a8275f`)으로 흰색 배경 대비율 5.5:1 이상 확보 (WCAG AA/AAA 준수).
  - **다크 모드**: 파스텔 핑크(`#f472b6`) 및 퍼플(`#c084fc`), 캔버스 배경(`#09070e`)과 카드/서피스(`#1c1926`, 외곽선 `rgba(240, 235, 255, 0.20)`) 간 정밀 대비 증강으로 심미성과 가독성 극대화.
  - 강조색은 화면당 가장 중요한 1~2개의 핵심 CTA 또는 활성 상태에만 절제하여 사용.

- **포용적 디자인 및 WCAG AAA 준수 (Inclusive & Accessible)**:
  - 일반 텍스트 4.5:1, 작은 텍스트 및 고대비 모드(`prefers-contrast: more`) 7:1 이상 대비 보장.
  - 색맹/저시력자를 위한 비색상 단서(상태 글리프 모양, 밑줄, 레이블) 의무 병행.
  - Display-P3 광색역 지원 및 `@media (prefers-reduced-motion: reduce)` 대응.

- **전역 오버레이 & 안전장치 (`OverlayContext`)**:
  - `Modal`: 시맨틱 포커스 트랩, 미저장 데이터(Dirty State) 유실 방지 시트(`isDirty` 가드).
  - `ActionSheet`: 모바일 하단 슬라이드 시트.
  - `AlertDialog`: '확인'/'예' 대신 구체적 동작 동사('삭제', '초기화', '변환') 강제.
  - `PrePermissionModal`: 시스템 권한 전 사전 안내 모달 ('계속'/'다음' 단일 버튼 다크패턴 방지).
  - `Toast`: 실행 취소(Undo) 핸들러 지원 및 `line-clamp-2 break-keep` 가독성 개선.

- **React Server Components (RSC) 최적화 아키텍처**:
  - `app/page.tsx`: 라우트 페이지는 순수 서버 컴포넌트(Pure RSC)로 구동되며, 클라이언트 상태와 인터랙션은 `WorkbenchClient.tsx` 클라이언트 경계 모듈로 완벽히 격리됩니다.
  - `icons.tsx`: 37종 벡터 아이콘 전체가 Pure RSC로 구동되어 클라이언트 번들 용량 오버헤드가 0입니다.
  - `lib/server/metrics.ts`: `React.cache()` 적용으로 동일 렌더 패스 내 서버 텔레메트리 중복 호출 100% 제거.
  - 정적 프레젠테이션 컴포넌트(`Divider`, `Badge`, `Kbd`, `Mask`, `List`, `ChatBubble`, `Link`, `Card`, `EmptyState`, `Indicator`, `RadialProgress`, `Tooltip`, `Breadcrumbs`, `Steps`)는 `"use client"` 없이 서버 컴포넌트로 직접 렌더링됩니다.
  - 인터랙티브 상태 및 이벤트 핸들러가 필요한 컴포넌트(`Button`, `Input`, `Selection`, `Select`, `Calendar`, `Countdown`, `Diff`, `TabBar`, `Sidebar`, `Tabs`, `MegaMenu`, `Stack`, `Alert`, `Progress`, `Accordion`, `Dropdown`, `ErrorBoundary` 등)는 클라이언트 경계 모듈을 통해 격리되어 Next.js 16 번들 크기를 최소화합니다.

- **간결한 컴포넌트 아키텍처 (`components/ui/`)**:
  - [`Button.tsx`](components/ui/Button.tsx): `Button` (더블클릭 방지, 비동기 Promise 자동 pending 스피너, 44px 터치, 생략 부호 `…`, `.pst-press`), `ToggleButton`
  - [`Input.tsx`](components/ui/Input.tsx): `TextField` (고정 레이블, 지우기 버튼), `SearchField` (모바일 Safe Scope Bar, 수평/수직 아이콘-placeholder 완전 일치 정렬, 알약 토큰), `OtpInput` (6자리 3+3 인지적 여유 그룹화)
  - [`Selection.tsx`](components/ui/Selection.tsx): `Checkbox` (혼재 대시 `-` 상태), `Radio` (6개 이상 시 자동 Select 전환), `Switch`, `Slider`
  - [`Select.tsx`](components/ui/Select.tsx): `Select`, `FieldSet`, `FileUpload` (`emptyState` 슬롯), `Filter`, `Rating`, `Swap`
  - [`Card.tsx`](components/ui/Card.tsx): `Card` (Pure RSC, `imagePriority` LCP 최적화, `overflow-visible`로 드롭다운 클리핑 방지, `rounded-3xl`), `Accordion`, `Collapse`, `Carousel`, `Dropdown` / `PullDownMenu` (`align="start" | "end"` 클리핑 방지, 삭제 보호)
  - [`Navigation.tsx`](components/ui/Navigation.tsx): `Divider` (Pure RSC), `Breadcrumbs` (Pure RSC), `Steps` (Pure RSC), `TabBar` (모바일 가로 밀림 방지 및 rAF 히스테리시스 진동 차단), `Sidebar` (상단 App Bar 단일 토글 연동), `Tabs`, `MegaMenu`, `Stack`
  - [`Display.tsx`](components/ui/Display.tsx): `Badge` (Pure RSC), `Kbd` (Pure RSC), `Mask` (Pure RSC), `Diff` (물리 터치/키보드 슬라이더), `List` (Pure RSC, `emptyState` 슬롯), `ChatBubble` (Pure RSC), `Link` (Pure RSC), `Calendar`, `Countdown`
  - [`Feedback.tsx`](components/ui/Feedback.tsx): `Indicator` (Pure RSC), `RadialProgress` (서브픽셀 SVG 안티에일리어싱 벡터 원형), `Tooltip` (Pure RSC), `Alert` (시맨틱 버튼 색상 일치), `Progress` (작업 설명, 일시정지/취소)
  - [`ErrorBoundary.tsx`](components/ui/ErrorBoundary.tsx): `ErrorBoundary` (컴포넌트/슬롯 단위 에러 격리, 커스텀/기본 pstui 스타일 폴백, 인라인 '다시 시도' 액션)
  - [`EmptyState.tsx`](components/ui/EmptyState.tsx): `EmptyState` (Pure RSC, 파스텔 링 아이콘, 볼드 헤드라인, 가이드 문구, 원클릭 복구 액션 슬롯)
  - [`BottomSheet.tsx`](components/ui/BottomSheet.tsx): 제스처 바텀 시트 (Pill 드래그 핸들, 아래 스와이프 닫기, 속도 계산, 햅틱)
  - [`VirtualList.tsx`](components/ui/VirtualList.tsx): TanStack Virtual 대용량 가상화 리스트 (`emptyState` 슬롯, `sessionStorage` 스크롤 복원)
  - [`CommandMenu.tsx`](components/ui/CommandMenu.tsx): `⌘K` / `Ctrl+K` 전역 단축키 파워유저 커맨드 팔레트
  - [`OfflineBanner.tsx`](components/ui/OfflineBanner.tsx): 오프라인 감지 및 백그라운드 요청 큐 자동 동기화
  - [`icons.tsx`](components/ui/icons.tsx): 37+ 벡터 아이콘 시스템 (Pure RSC)

- **모던 웹 아키텍처 & 프런트엔드 엔지니어링**:
  - **감성 파스텔 브랜드 팔레트**: 소프트 로즈/핑크(`#db528d` light, `#f472b6` dark) & 소프트 라일락/라벤더(`#9055cf` light, `#c084fc` dark).
  - **통일된 강한 곡률 (Strong Curvature)**: 컨테이너/카드/모달 `rounded-3xl`, 폼필드/버튼/필 `rounded-2xl`.
  - **광학 자간 및 한국어 줄바꿈 보호**: `word-break: keep-all; overflow-wrap: break-word;`, 헤딩 `-0.025em`, 본문 `-0.008em`, 수치 정렬 `tabular-nums`.
  - **전역 터치 & 클릭 피드백**: `:active:not(:disabled) { transform: scale(0.97); }` 누름 물리 반응.
  - **Zero-CLS 모바일 App Bar**: 높이 가변 축소로 인한 진동을 완전히 제거한 56px 고정 Liquid Glass App Bar.
  - **Next.js 16 인터셉팅 라우트**: `@modal/(.)preview/[id]` 인앱 오버레이 모달 및 `/preview/[id]` 단독 페이지 폴백.
  - **React 19 최신 상태 엔진**: `useOptimistic` 낙관적 즉각 반응과 `useActionState` 깜빡임 없는 인라인 폼 검증.
  - **촉각 햅틱 피드백**: Web Vibration API 기반 가벼운 터치/선택/성공/경고/에러 진동 (`lib/haptics.ts`).
  - **서체**: 나눔스퀘어 네오(NanumSquare Neo Variable) 공식 채택 및 Zero-CLS 메트릭 폴백.
  - **SEO & PWA**: `robots.ts`, `sitemap.ts`, `manifest.json`, `humans.txt`, `llms.txt`, `llms-full.txt`, `ads.txt`, `feed.xml`(RSS/Atom), `sw.js` 완비.


- **Lighthouse 공식 감사 3개 부문 100점 만점 달성**:
  - **접근성(Accessibility)**: **100 / 100** (WCAG AAA 고대비 및 2.5.3 보이는 텍스트 레이블 매칭)
  - **모범 사례(Best Practices)**: **100 / 100** (보안 헤더, 콘솔 무오류)
  - **검색 최적화(SEO)**: **100 / 100** (JSON-LD, robots, sitemap, feed.xml 완비)
  - **성능(Performance)**: 데스크톱 **81점**, Zero-CLS (`0.000`), 데스크톱 TBT **0ms** (Zero Total Blocking Time)
  - **사이드바 심도**: 잘림 없는 수평 확산 셰도우(`.pst-sidebar-shadow`)와 14px 부유 마진 적용

### 3. 시작하기 (Quick Start)

#### 필수 요구사항
- Node.js 18.x 이상 (권장 20.x+)
- npm 10.x 이상

#### 원커맨드 설정 및 개발 서버 실행
```bash
# 종속성 설치
npm install

# 원커맨드 아키텍처 환경 검사 및 설정
npm run setup

# 개발 서버 시작 (http://localhost:3000)
npm run dev

# 프로덕션 빌드 (Turbopack 최적화 & TypeScript 타입 검증)
npm run build

# 신규 순수 RSC 페이지 자동 스캐폴딩
node setup.mjs --new-page my-dashboard
```

### 4. 프레임워크 내보내기 및 버전 동기화 (Export & Update CLI)

`pstui`는 독립 오픈 소스 디자인 시스템으로서, 다른 Next.js 프로젝트로 컴포넌트와 토큰을 손쉽게 **내보내기(Export)**하고 추후 새 버전이 출시되었을 때 **안전하게 업데이트(Update & Sync)**할 수 있는 양방향 CLI 도구 및 매니페스트 관리 체계를 탑재하고 있습니다.

#### 4.1 기존 Next.js 프로젝트로 내보내기 (Export)
기존 프로젝트에 UI 컴포넌트 전체, 적응형 레이아웃(`AppShell`), 전역 오버레이 컨텍스트(`OverlayContext`), 햅틱/오프라인 유틸리티, 그리고 독립형 토큰 스타일시트(`styles/pstui-tokens.css`)를 원클릭으로 내보냅니다:
```bash
# 전체 디자인 시스템 및 컴포넌트 내보내기
npm run export -- ../my-next-app

# UI 컴포넌트만 선택하여 내보내기
node setup.mjs --export ../my-next-app --mode components
```
- 내보내기 완료 시 대상 프로젝트에 `pstui.manifest.json` 및 `PSTUI_SETUP.md`가 자동 생성되어 컴포넌트 버전과 파일 무결성 해시(SHA-256)를 추적합니다.

#### 4.2 신규 턴키 프로젝트 생성 (Template Mode)
Next.js 16 App Router + Tailwind v4 + DaisyUI 5 구성이 완비된 단독 스타터 프로젝트를 즉시 생성합니다:
```bash
node setup.mjs --export ../my-new-app --mode template
cd ../my-new-app && npm install && npm run dev
```

#### 4.3 최신 버전으로 업데이트 및 동기화 (Update & Sync)
pstui의 새 릴리스가 나왔을 때 기존 프로젝트의 컴포넌트와 토큰을 최신으로 안전하게 동기화합니다:
```bash
# 대상 프로젝트 안전 업데이트
npm run update -- ../my-next-app
# 또는
npm run sync -- ../my-next-app
```
- **사용자 커스텀 수정 보존 (Safe Guard)**: 개발자가 직접 수정한 컴포넌트는 절대 덮어쓰지 않고 `.pstui-latest` 파일을 병기 생성하여 수동 병합할 수 있도록 보존합니다.
- **강제 덮어쓰기 모드 (`--force`)**: `--force` 플래그 지정 시 사용자 수정 파일을 `<파일명>.bak.<타임스탬프>`로 자동 백업한 후 최신 버전으로 갱신합니다.

#### 4.4 변경점 비교 점검 (Diff Inspection)
수정 없이 대상 프로젝트와 최신 pstui 릴리스 간의 차이점 및 수정 여부를 사전에 파악합니다:
```bash
node setup.mjs --diff ../my-next-app
```

#### 4.5 패키지 서브패스 임포트 (Subpath Exports)
`package.json`의 표준 `exports` 명세에 따라 모듈식 임포트가 가능합니다:
```tsx
import { Button, Card, EmptyState } from "pstui/ui";
import { AppShell } from "pstui/layout/AppShell";
import { OverlayProvider, useModal } from "pstui/context/OverlayContext";
```
```css
/* 글로벌 스타일시트에서 토큰 직접 로드 */
@import "pstui/tokens";
```

### 5. 컴포넌트 사용 예시 (Usage Example)
```tsx
import { Button, TextField, Card, EmptyState } from "@/components/ui";
import { useModal, useToast } from "@/context/OverlayContext";

export default function MyPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();

  return (
    <Card title="pstui 워크스페이스" subtitle="Liquid Glass 기반 웹 시스템">
      <TextField
        label="프로젝트 이름"
        value={name}
        onChange={setName}
        helperText="작업공간 식별자를 입력하십시오."
      />
      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          opensModal
          onClick={() => openModal({ title: "설정…", content: <Settings /> })}
        >
          환경설정
        </Button>
      </div>
    </Card>
  );
}
```

### 6. 에이전트 스킬 (Agent Skills)

pstui는 AI 에이전트가 코드를 탐색, 작성 및 확장할 때 참조할 수 있는 전용 스킬을 탑재하고 있습니다.
- **스킬 정의 경로**: [`.agents/skills/pstui/SKILL.md`](.agents/skills/pstui/SKILL.md)
- **주요 내용**: 인간 중심 디자인 원칙, Liquid Glass 레이어 분리 규칙, 시맨틱 토큰 매핑, 내보내기/동기화 CLI 워크플로, 컴포넌트 구현 레시피 및 사전 점검 체크리스트.

---


<a id="english"></a>
## English

### 1. Overview
**pstui** is an independent open-source, production-grade UI design system and component framework engineered for the modern web (Next.js 16 App Router, Tailwind CSS v4, DaisyUI 5). It brings together human-centric interaction principles, the tactile depth of the **Liquid Glass** optical material system, and inclusive accessibility (WCAG AAA).

### 2. Key Architecture & Features

- **Adaptive AppShell (`AppShell.tsx`)**:
  - **Mobile (`< 768px`)**: Floating bottom Liquid Glass Tab Bar (`TabBar` / `BottomBar`) that gracefully minimizes (`scale(0.90)`) on downward scroll and restores on upward scroll via passive event listeners.
  - **Desktop (`>= 768px`)**: Floating left Liquid Glass Sidebar (`Sidebar`) with a leading toolbar collapse toggle, plus an optional 3-column `Split View`.
  - **Edge-to-Edge Background Extension**: `<main>` background extends to 100vw and 100vh, while internal padding (`padding-inline-start`, `padding-bottom`) allows scrolling content to peek behind the translucent Liquid Glass chrome.

- **Strict Layer Classification**:
  - **Liquid Glass**: Reserved solely for functional floating chrome (Tab Bar, Sidebar, Floating Toolbars, Popovers, Primary Floating CTA).
  - **Standard Material**: Scrolling body content cards (`Card`), tables, and list rows (`List`) strictly utilize opaque/translucent standard materials (`--material-regular`).

- **Soft Pastel Palette & Precision Contrast**:
  - **Light Mode**: Soft rose/pink (`#db528d`) and soft lavender (`#9055cf`), with dedicated high-contrast text tokens (`--accent-primary-text: #a8275f`, >= 5.5:1 against white backgrounds, WCAG AA/AAA compliant).
  - **Dark Mode**: Pastel blossom pink (`#f472b6`) and lilac (`#c084fc`), with calibrated contrast between the deep canvas background (`#09070e`) and elevated card surfaces (`#1c1926`, separator `rgba(240, 235, 255, 0.20)`).
  - Primary accents are strictly reserved for 1–2 key calls-to-action or active selection states per view.

- **Inclusive Color & WCAG AAA Accessibility**:
  - 4.5:1 contrast for regular text, 7:1+ for small text and High Contrast mode (`prefers-contrast: more`).
  - Mandatory non-color cues (glyphs, checkmarks, underlines, badges) for every state change.
  - Display-P3 wide color gamut support with sRGB fallbacks; `@media (prefers-reduced-motion: reduce)` motion suppression.

- **Global Overlay & Safety System (`OverlayContext`)**:
  - `Modal`: Semantic focus trap, dirty-state discard sheet guards (`isDirty`).
  - `ActionSheet`: Smooth bottom slide sheet for mobile viewports.
  - `AlertDialog`: Action buttons enforce concrete verbs ("Delete", "Reset", "Convert") instead of generic "OK"/"Yes".
  - `PrePermissionModal`: Ethical pre-alert system modal with single "Continue" button (no dark patterns).
  - `Toast`: Non-blocking feedback banners with built-in Undo handlers.

- **React Server Components (RSC) Architecture**:
  - `icons.tsx`: All 37+ vector icons are Pure React Server Components with zero client runtime bundle overhead.
  - `lib/server/metrics.ts`: Uses `React.cache()` to eliminate duplicate server telemetry fetches during the same render pass.
  - Presentational static components (`Divider`, `Badge`, `Kbd`, `Mask`, `Diff`, `List`, `ChatBubble`, `Link`, `Card`, `EmptyState`, `Indicator`, `RadialProgress`, `Tooltip`, `Breadcrumbs`, `Steps`) render on the server without `"use client"` directives.
  - Interactive stateful components (`Button`, `Input`, `Selection`, `Select`, `Calendar`, `Countdown`, `TabBar`, `Sidebar`, `Tabs`, `MegaMenu`, `Stack`, `Alert`, `Progress`, `Accordion`, `Dropdown`, `ErrorBoundary`, etc.) isolate `"use client"` boundaries to maintain lightweight Next.js 16 App Router bundle sizes.

- **Concise & Intuitive Component Architecture (`components/ui/`)**:
  - [`Button.tsx`](components/ui/Button.tsx): `Button` (44px hit target, inline SVG spinner, modal ellipsis `…`, `.pst-press`), `ToggleButton`
  - [`Input.tsx`](components/ui/Input.tsx): `TextField` (fixed label, clear button, blur vs change validation), `SearchField` (mobile safe Scope Bar, Pill tokens), `OtpInput` (6-digit 3+3 cognitive grouping)
  - [`Selection.tsx`](components/ui/Selection.tsx): `Checkbox` (indeterminate `-` dash), `Radio` (auto-select fallback if >= 6), `Switch`, `Slider`
  - [`Select.tsx`](components/ui/Select.tsx): `Select`, `FieldSet`, `FileUpload` (`emptyState` slot), `Filter`, `Rating`, `Swap`
  - [`Card.tsx`](components/ui/Card.tsx): `Card` (Pure RSC, `imagePriority` LCP optimization, `overflow-visible` to prevent menu clipping), `Accordion`, `Collapse`, `Carousel`, `Dropdown` / `PullDownMenu` (`align="start" | "end"`, destructive confirmation popovers)
  - [`Navigation.tsx`](components/ui/Navigation.tsx): `Divider` (Pure RSC), `Breadcrumbs` (Pure RSC), `Steps` (Pure RSC), `TabBar` (passive rAF hysteresis scroll lock), `Sidebar` (App Bar collapse toggle), `Tabs`, `MegaMenu`, `Stack`
  - [`Display.tsx`](components/ui/Display.tsx): `Badge` (Pure RSC), `Kbd` (Pure RSC), `Mask` (Pure RSC), `Diff` (Pure RSC), `List` (Pure RSC, `emptyState` slot), `ChatBubble` (Pure RSC), `Link` (Pure RSC), `Calendar`, `Countdown`
  - [`Feedback.tsx`](components/ui/Feedback.tsx): `Indicator` (Pure RSC), `RadialProgress` (subpixel SVG anti-aliased vector circle), `Tooltip` (Pure RSC), `Alert` (semantic variant button colors), `Progress` (determinate-first with task description & pause)
  - [`ErrorBoundary.tsx`](components/ui/ErrorBoundary.tsx): `ErrorBoundary` (component/slot isolation, pstui custom fallback card, inline retry action)
  - [`EmptyState.tsx`](components/ui/EmptyState.tsx): `EmptyState` (Pure RSC, pastel ring icon, bold headline, guidance text, recovery action slots)
  - [`BottomSheet.tsx`](components/ui/BottomSheet.tsx): Gesture bottom sheet (Apple momentum projection & rubber-banding, drag-to-dismiss, velocity calculation, haptics)
  - [`VirtualList.tsx`](components/ui/VirtualList.tsx): TanStack Virtual windowing list (`emptyState` slot, `sessionStorage` scroll restoration)
  - [`CommandMenu.tsx`](components/ui/CommandMenu.tsx): Global `⌘K` / `Ctrl+K` power-user command palette
  - [`OfflineBanner.tsx`](components/ui/OfflineBanner.tsx): Offline detection & background request queue auto-flush
  - [`icons.tsx`](components/ui/icons.tsx): 37+ vector icon system (Pure RSC)

### 3. Quick Start

#### Requirements
- Node.js 20.x or newer
- npm 10.x or newer

#### Installation & Development
```bash
# Install dependencies
npm install

# Run development server with Turbopack (http://localhost:3000)
npm run dev

# Build production bundle with type checking
npm run build

# Start production server
npm run start
```

### 4. Framework Export & Version Synchronization (Export & Update CLI)

`pstui` provides a robust, two-way CLI tooling and manifest system to **export** components and tokens to other Next.js projects and **synchronize/update** safely when new versions are released.

#### 4.1 Export to Existing Next.js Projects
Instantly copy all components, adaptive layout (`AppShell`), overlay context, haptics, and standalone design tokens (`styles/pstui-tokens.css`) into your target project:
```bash
# Export complete design system and components
npm run export -- ../my-next-app

# Export only UI components
node setup.mjs --export ../my-next-app --mode components
```
- Creates `pstui.manifest.json` and `PSTUI_SETUP.md` in the target project, recording SHA-256 integrity hashes for safe future upgrades.

#### 4.2 Scaffold Turnkey Project (Template Mode)
Scaffold an independent, ready-to-run Next.js 16 App Router + Tailwind v4 + DaisyUI 5 application:
```bash
node setup.mjs --export ../my-new-app --mode template
cd ../my-new-app && npm install && npm run dev
```

#### 4.3 Safe Update & Synchronization (Update & Sync)
When a new pstui version is released, safely upgrade your existing project without losing customizations:
```bash
# Safe upgrade target project
npm run update -- ../my-next-app
# or
npm run sync -- ../my-next-app
```
- **Custom Modification Protection**: If a component has been customized by the developer, pstui will never overwrite it. It preserves your local code and writes `.pstui-latest` alongside for review.
- **Forced Update Mode (`--force`)**: Automatically backs up modified files to `<file>.bak.<timestamp>` before applying the official update.

#### 4.4 Non-Destructive Diff Inspection
Inspect changes and update availability between the target project and latest pstui release without altering files:
```bash
node setup.mjs --diff ../my-next-app
```

#### 4.5 Subpath Package Exports
Import components modularly via `package.json` standard subpath mappings:
```tsx
import { Button, Card, EmptyState } from "pstui/ui";
import { AppShell } from "pstui/layout/AppShell";
import { OverlayProvider, useModal } from "pstui/context/OverlayContext";
```
```css
/* Direct tokens import in your globals.css */
@import "pstui/tokens";
```

### 5. Basic Usage
```tsx
import { Button, TextField, Card, EmptyState } from "@/components/ui";
import { useModal, useToast } from "@/context/OverlayContext";

export function ExampleWidget() {
  const { openModal } = useModal();
  const { showToast } = useToast();

  return (
    <Card title="pstui Surface" subtitle="Modern Liquid Glass Web System">
      <TextField
        label="Account Name"
        value={name}
        onChange={setName}
        helperText="Enter your workspace handle."
      />
      <div className="mt-4">
        <Button variant="primary" opensModal onClick={() => openModal({ title: "Settings…", content: <Settings /> })}>
          Configure Settings
        </Button>
      </div>
    </Card>
  );
}
```

### 6. Agent Skills

pstui includes a dedicated agent skill that AI assistants can reference when generating or reviewing code:
- **Skill Path**: [`.agents/skills/pstui/SKILL.md`](.agents/skills/pstui/SKILL.md)
- **Contents**: Human-centric design principles, Liquid Glass layer separation rules, semantic token mapping, export/update CLI workflows, code recipes, and pre-submission QA checklists.

---

<a id="japanese"></a><a id="日本語"></a>
## 日本語 (Japanese)

### 1. 概要 (Overview)
**pstui** は、人間中心のインターフェース設計原則と **Liquid Glass** 光学マテリアルアーキテクチャを、最新のウェブ標準（Next.js 16 App Router、Tailwind CSS v4、DaisyUI 5）上で実現した独立系オープンソース UI フレームワークです。

### 2. コアアーキテクチャと主な特徴 (Key Features)

- **適応型 AppShell (`AppShell.tsx`)**:
  - **モバイル (`< 768px`)**: 画面下部フロート型 Liquid Glass タブバー (`TabBar` / `BottomBar`)。パッシブスクロールリスナーにより、下方向スクロール時に自動縮小 (`scale(0.90)`)、上方向スクロールで即座に復帰。
  - **デスクトップ (`>= 768px`)**: 画面左側フロート型 Liquid Glass サイドバー (`Sidebar`)。上部ツールバーの折りたたみトグルボタン、および補助一覧列（`Split View`）に対応。
  - **エッジ・トゥ・エッジ背景拡張**: メインコンテンツは画面端まで広がり、内部パディングにより半透明な Liquid Glass の背後に美しくコンテンツが透過表示されます。

- **厳格なレイヤー分離原則**:
  - **Liquid Glass**: タブバー、サイドバー、ツールバー、ポップオーバーなど、コンテンツの上に浮かぶナビゲーション層にのみ適用。
  - **Standard Material**: スクロールされる通常カード (`Card`) やテーブル、リスト行 (`List`) には高コントラストな静的マテリアル (`--material-regular`) を適用。

- **ソフトパステルパレットと精密なコントラスト**:
  - **ライトモード**: ソフトローズ/ピンク（`#db528d`）およびソフトラベンダー（`#9055cf`）、専用テキストトークン（`--accent-primary-text: #a8275f`、白背景とのコントラスト比 5.5:1 以上で WCAG AA/AAA に完全準拠）。
  - **ダークモード**: パステルピンク（`#f472b6`）およびライラック（`#c084fc`）、深みのあるキャンバス背景（`#09070e`）と浮き上がるカード/サーフェス（`#1c1926`、区切り線 `rgba(240, 235, 255, 0.20)`）の精密な明度比により視認性と美しさを両立。
  - アクセントカラーは画面あたり最重要の 1〜2 個のアクション（CTA）やアクティブ選択状態にのみ限定適用。

- **包括的デザインと WCAG AAA 準拠**:
  - 通常テキスト 4.5:1、高コントラストモード (`prefers-contrast: more`) で 7:1 以上の明度比を確保。
  - 色覚特性に配慮し、状態変化には色だけでなく形状記号（▲/▼、チェック、下線）を必須併記。
  - Display-P3 広色域対応およびモーション低減モード (`prefers-reduced-motion`) を完全サポート。

- **グローバルオーバーレイシステム (`OverlayContext`)**:
  - `Modal`: フォーカストラップおよび未保存データ保護シート (`isDirty` ガード)。
  - `ActionSheet`: モバイル向け下部スライドシート。
  - `AlertDialog`: 「OK」や「はい」を廃止し、具体的な動詞（「削除」「リセット」「変換」）ボタンを義務付け。
  - `PrePermissionModal`: ダークパターンを排除した「次へ」単一ボタンの事前確認モーダル。
  - `Toast`: 取り消し（Undo）対応の通知バナー。

- **React Server Components (RSC) アーキテクチャ**:
  - `icons.tsx`: 37+ 種類のベクターアイコンすべてが Pure RSC として動作し、クライアントバンドル容量オーバーヘッドがありません。
  - `lib/server/metrics.ts`: `React.cache()` を導入し、同一レンダーパス内でのサーバーテレメトリ重複取得を 100% 排除。
  - 静的プレゼンテーションコンポーネント（`Divider`、`Badge`、`Kbd`、`Mask`、`Diff`、`List`、`ChatBubble`、`Link`、`Card`、`EmptyState`、`Indicator`、`RadialProgress`、`Tooltip`、`Breadcrumbs`、`Steps`）は `"use client"` なしでサーバーコンポーネントとして直接レンダリングされます。
  - インタラクティブな状態管理やイベントハンドラーが必要なコンポーネント（`Button`、`Input`、`Selection`、`Select`、`Calendar`、`Countdown`、`TabBar`、`Sidebar`、`Tabs`、`MegaMenu`、`Stack`、`Alert`、`Progress`、`Accordion`、`Dropdown`、`ErrorBoundary` など）はクライアントモジュール境界で隔離され、Next.js 16 のバンドルサイズを最小化します。

- **直感的で簡潔なコンポーネント構造 (`components/ui/`)**:
  - [`Button.tsx`](components/ui/Button.tsx): `Button`（44px ヒットエリア、インラインスピ너、省略記号 `…`、`.pst-press`）、`ToggleButton`
  - [`Input.tsx`](components/ui/Input.tsx): `TextField`（固定ラベル、クリアボタン）、`SearchField`（モバイル Safe スコープバー、検索トークン）、`OtpInput`（6桁 3+3 認知的グループ化）
  - [`Selection.tsx`](components/ui/Selection.tsx): `Checkbox`（中間ダッシュ状態 `-`）、`Radio`（6個以上で自動 Select 化）、`Switch`、`Slider`
  - [`Select.tsx`](components/ui/Select.tsx): `Select`、`FieldSet`、`FileUpload`（`emptyState` スロット）、`Filter`、`Rating`、`Swap`
  - [`Card.tsx`](components/ui/Card.tsx): `Card`（Pure RSC、`imagePriority` LCP 最適化、`overflow-visible` によるポップオーバー切り欠き防止）、`Accordion`、`Collapse`、`Carousel`、`Dropdown`（`align="start" | "end"` 切り欠き防止、破壊的アクション保護）
  - [`Navigation.tsx`](components/ui/Navigation.tsx): `Divider`（Pure RSC）、`Breadcrumbs`（Pure RSC）、`Steps`（Pure RSC）、`TabBar`（パッシブ rAF ヒステリシス振動抑制）、`Sidebar`（App Bar 単一折りたたみトグル）、`Tabs`、`MegaMenu`、`Stack`
  - [`Display.tsx`](components/ui/Display.tsx): `Badge`（Pure RSC）、`Kbd`（Pure RSC）、`Mask`（Pure RSC）、`Diff`（Pure RSC）、`List`（Pure RSC、`emptyState` スロット）、`ChatBubble`（Pure RSC）、`Link`（Pure RSC）、`Calendar`、`Countdown`
  - [`Feedback.tsx`](components/ui/Feedback.tsx): `Indicator`（Pure RSC）、`RadialProgress`（サブピクセル SVG ベクター円形）、`Tooltip`（Pure RSC）、`Alert`（セマンティックボタン色対応）、`Progress`（進捗説明、一時停止/中止保護）
  - [`ErrorBoundary.tsx`](components/ui/ErrorBoundary.tsx): `ErrorBoundary`（コンポーネント単位のエラー隔離、カスタム/pstui 標準フォールバックカード、インライン「再試行」アクション）
  - [`EmptyState.tsx`](components/ui/EmptyState.tsx): `EmptyState`（Pure RSC、パステルリングアイコン、太字見出し、復旧アクションスロット）
  - [`BottomSheet.tsx`](components/ui/BottomSheet.tsx): ジェスチャーボトムシート（モーメンタム投射、ラバーバンディング抵抗、ドラッグ閉じる、ハプティクス）
  - [`VirtualList.tsx`](components/ui/VirtualList.tsx): TanStack Virtual 大容量仮想化リスト（`emptyState` スロット、`sessionStorage` スクロール位置復元）
  - [`CommandMenu.tsx`](components/ui/CommandMenu.tsx): グローバル `⌘K` / `Ctrl+K` パワーユーザーコマンドパレット
  - [`OfflineBanner.tsx`](components/ui/OfflineBanner.tsx): オフライン検知とバックグラウンドリクエストキュー自動フラッシュ
  - [`icons.tsx`](components/ui/icons.tsx): 37+ ベクターアイコン（Pure RSC）

### 3. クイックスタート (Quick Start)

#### 必要環境
- Node.js 20.x 以上
- npm 10.x 以上

#### インストールと起動
```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動 (http://localhost:3000)
npm run dev

# プロダクションビルド (Turbopack 最適化 & TypeScript 検証)
npm run build

# 本番サーバーの起動
npm run start
```

### 4. フレームワークのエクスポートと更新同期 (Export & Update CLI)

`pstui` は、他の Next.js プロジェクトへコンポーネントとデザイントークンを簡単に**エクスポート(Export)**し、将来の新バージョン公開時にも既存の改修を失わずに**安全に更新同期(Update & Sync)**できる双方向 CLI ツールとマニフェスト管理機能を搭載しています。

#### 4.1 既存 Next.js プロジェクトへのエクスポート (Export)
既存プロジェクトへ全 UI コンポーネント、適応型レイアウト (`AppShell`)、オーバーレイコンテキスト、触覚・オフラインユーティリティ、および独立型トークンスタイルシート (`styles/pstui-tokens.css`) をワンクリックで配備します:
```bash
# デザインシステム全体とコンポーネントのエクスポート
npm run export -- ../my-next-app

# UI コンポーネントのみを選択してエクスポート
node setup.mjs --export ../my-next-app --mode components
```
- 対象プロジェクト直下に `pstui.manifest.json` および `PSTUI_SETUP.md` が自動生成され、ファイルの SHA-256 ハッシュによる完全性管理が開始されます。

#### 4.2 新規ターンキープロジェクト作成 (Template Mode)
Next.js 16 App Router + Tailwind v4 + DaisyUI 5 構成が完結したスタンドアロンプロジェクトを即時作成します:
```bash
node setup.mjs --export ../my-new-app --mode template
cd ../my-new-app && npm install && npm run dev
```

#### 4.3 最新バージョンへの更新と安全同期 (Update & Sync)
pstui の新機能追加や改善がリリースされた際、既存プロジェクトを安全に最新化します:
```bash
# 対象プロジェクトの安全更新
npm run update -- ../my-next-app
# または
npm run sync -- ../my-next-app
```
- **ユーザーカスタマイズの保護**: 開発者が直接修正したコンポーネントは上書きされず、新バージョンの `.pstui-latest` を並行生成して安全に保持されます。
- **強制上書きモード (`--force`)**: `--force` フラグを指定すると、変更されたファイルを `<ファイル名>.bak.<タイムスタンプ>` として自動バックアップした上で最新版に更新します。

#### 4.4 変更点の事前差分確認 (Diff Inspection)
ファイルを変更することなく、対象プロジェクトと最新リリース間の差異を事前に確認します:
```bash
node setup.mjs --diff ../my-next-app
```

#### 4.5 サブパスパッケージインポート (Subpath Exports)
`package.json` の標準サブパスマッピングによるモジュール式インポートに対応しています:
```tsx
import { Button, Card, EmptyState } from "pstui/ui";
import { AppShell } from "pstui/layout/AppShell";
import { OverlayProvider, useModal } from "pstui/context/OverlayContext";
```
```css
/* グローバル CSS でトークンを直接読み込み */
@import "pstui/tokens";
```

### 5. 基本的な実装例 (Usage Example)
```tsx
import { Button, TextField, Card, EmptyState } from "@/components/ui";
import { useModal, useToast } from "@/context/OverlayContext";

export function SamplePage() {
  const { openModal } = useModal();
  const { showToast } = useToast();

  return (
    <Card title="pstui デザインシステム" subtitle="Liquid Glass マテリアル">
      <TextField
        label="ユーザー名"
        value={username}
        onChange={setUsername}
        helperText="アカウント識別名を入力してください。"
      />
      <div className="mt-4 flex gap-2">
        <Button variant="primary" opensModal onClick={() => openModal({ title: "設定を編集…", content: <Settings /> })}>
          設定を編集
        </Button>
      </div>
    </Card>
  );
}
```

### 6. エージェントスキル (Agent Skills)

本フレームワークは、AI エージェントがコードベースを理解・拡張する際に参照できる専用スキルを搭載しています。
- **スキル定義パス**: [`.agents/skills/pstui/SKILL.md`](.agents/skills/pstui/SKILL.md)
- **提供内容**: 人間中心の設計原則、Liquid Glass レイヤー分離規則、セマンティックトークン対応表、エクスポート/同期 CLI ワークフロー、コンポーネント実装レシピ、事前セルフチェックリスト。

---

<a id="license"></a>
## 라이선스 / License / ライセンス

본 프로젝트는 **Apache License, Version 2.0**에 따라 배포됩니다.
자세한 내용은 [LICENSE](LICENSE) 파일을 참조하십시오.

This project is licensed under the **Apache License, Version 2.0**.
See the [LICENSE](LICENSE) file for the full license text.

本プロジェクトは **Apache License, Version 2.0** の下で公開・配布されています。
詳細は [LICENSE](LICENSE) ファイルをご確認ください。

```
Copyright 2026 pstui Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

<a id="disclaimer"></a>
## 법적 고지 및 상표권 안내 / Legal Notice & Disclaimer / 法的免責事項

### 한국어
- **독립 프로젝트 안내**: **pstui**는 인간 중심 인터랙션 디자인 원칙에서 영감을 받아 독립적으로 구축된 오픈 소스 프런트엔드 UI 프레임워크입니다.
- **비제휴 명시**: 본 프로젝트는 Apple Inc.와 어떠한 제휴, 공식 후원, 승인 또는 연관 관계가 없습니다.
- **등록 상표 안내**: Apple, iOS, iPadOS, macOS, visionOS, SF Pro, SF Symbols는 미국 및 기타 국가에 등록된 Apple Inc.의 상표입니다. 본 프로젝트 및 문서에 언급된 모든 상표, 상호는 해당 소유자의 자산입니다.

### English
- **Independent Project Notice**: **pstui** is an independent open-source front-end UI framework inspired by human-centric design principles.
- **Non-Affiliation**: This project is NOT affiliated with, sponsored by, endorsed by, or connected to Apple Inc. in any manner.
- **Trademark Attribution**: Apple, iOS, iPadOS, macOS, visionOS, SF Pro, and SF Symbols are registered trademarks or trademarks of Apple Inc., registered in the U.S. and other countries and regions. All other trademarks, trade names, and logos belong to their respective holders.

### 日本語
- **独立プロジェクトに関する通知**: **pstui** は、人間中心のインターフェース設計思想から着想を得て独自に開発されたオープンソースのフロントエンド UI フレームワークです。
- **非提携の明示**: 本プロジェクトは Apple Inc. との提携、公認、スポンサーシップ、または公式な関連は一切ありません。
- **商標権の帰属**: Apple、iOS、iPadOS、macOS、visionOS、SF Pro、SF Symbols は米国およびその他の国における Apple Inc. の登録商標または商標です。本書に記載されているその他の商標および商号は各所有者に帰属します。

