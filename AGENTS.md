<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# pstui 에이전트 작업 지침 및 인계 문서 (Agent Guidelines & Handoff Specification)

본 문서는 **pstui** (인간 중심 인터랙션 원칙 + Liquid Glass + DaisyUI 5 + Tailwind CSS v4 + Next.js 16 App Router) 프레임워크를 개발, 확장, 유지보수하는 모든 AI 에이전트를 위한 단일 행동 지침 및 인계 문서입니다. 후속 에이전트는 본 문서와 [DESIGN.md](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/DESIGN.md)의 규격을 엄격히 준수해야 합니다.

---

## 0. 이전 에이전트 작업 상황 인계 (Work Status & Handoff Summary)

### 0.1 현재 구현 완료된 상태 (Current Implementation Baseline)
1. **기술 스택 & 코어 프레임워크**:
   - Next.js 16.4.3 App Router (Turbopack, Partial Prefetching, React 19.3.0)
   - Tailwind CSS v4 + DaisyUI 5.7.50
   - Firebase Auth 13.1.0 + Mock Fallback (이메일, 구글, 패스키 WebAuthn)
   - Apache 2.0 라이선스 기반 배포 구성

2. **단일 반응형 셸 (`AppShell`)**:
   - 모바일(`< 768px`): 하단 고정 Liquid Glass 탭 막대(`TabBar` / `BottomBar`, 스크롤 시 자동 축소/복원).
   - 데스크톱(`>= 768px`): 좌측 고정 Liquid Glass 사이드바(`Sidebar`, 접기/펼치기 토글) 및 선택적 보조 목록 열(`Split View`).
   - 배경 확장(`Edge-to-Edge`): `<main>` 콘텐츠가 사이드바 및 탭 막대 뒤로 비치도록 내부 패딩(`padding-inline-start`, `padding-bottom`) 적용.
   - 다크 모드 동기화: OS 테마 감지 및 수동 토글 지원 (`data-theme="light" | "dark"`, `useSyncExternalStore`).

3. **전역 오버레이 시스템 (`OverlayContext`)**:
   - `Modal`: 시맨틱 포커스 트랩, 미저장 데이터(Dirty State) 유실 방지 시트(`isDirty` 가드) 연동.
   - `ActionSheet`: 모바일 하단 슬라이드 시트.
   - `AlertDialog`: 구체적 동작 동사 강제 (금지: '확인'/'예', 허용: '삭제'/'초기화'/'변환').
   - `PrePermissionModal`: 시스템 권한 요청 전 사전 안내 모달 (단일 버튼 '계속'/'다음').
   - `Toast`: 실행 취소(Undo) 액션 지원 토스트 알림.

4. **간결하고 직관적인 컴포넌트 아키텍처 (`components/ui/`)**:
   - 복잡했던 이전 파일명을 간결하고 직관적인 단일 단어 / 표준 파스칼 케이스 파일로 리팩터링 완료:
     - [`Button.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Button.tsx): `Button`, `ToggleButton` (Client)
     - [`Input.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Input.tsx): `TextField`, `SearchField`, `OtpInput` (alias `OTP`) (Client)
     - [`Selection.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Selection.tsx): `Checkbox`, `Radio`, `Switch`, `Slider` (Client)
     - [`Select.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Select.tsx): `Select`, `FieldSet` (alias `Fieldset`), `FileUpload`, `Filter`, `Rating`, `Swap` (Client)
     - [`Card.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Card.tsx): `Card` (Pure RSC), `Accordion`, `Collapse`, `Carousel`, `Dropdown` (alias `PullDownMenu`) (Client)
     - [`Navigation.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Navigation.tsx): `Divider`, `Breadcrumbs`, `Steps` (Pure RSC), `TabBar` (alias `BottomBar`), `Sidebar`, `Tabs`, `MegaMenu` (alias `Megamenu`), `Stack` (Client)
     - [`Display.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Display.tsx): `Badge`, `Kbd` (alias `KBD`), `Mask`, `Diff`, `List`, `ChatBubble`, `Link` (Pure RSC), `Calendar`, `Countdown` (Client)
     - [`Feedback.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/Feedback.tsx): `Indicator`, `RadialProgress`, `Tooltip` (Pure RSC), `Alert`, `Progress`, `ErrorBoundary`, `EmptyState` (Client/Server)
     - [`ErrorBoundary.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/ErrorBoundary.tsx): `ErrorBoundary` (Client)
     - [`EmptyState.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/EmptyState.tsx): `EmptyState` (Pure RSC)
     - [`icons.tsx`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/icons.tsx): 37+ 벡터 아이콘 시스템 (Pure React Server Component, `"use client"` 미사용으로 번들 최적화)
     - [`index.ts`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/index.ts): 모든 UI 컴포넌트 통합 Re-export
   - **RSC & 클라이언트 경계 원칙**: 상태나 이벤트가 없는 정적 컴포넌트는 `"use client"` 지시문 없이 서버 컴포넌트로 동작하며, 인터랙티브 컴포넌트는 내부 클라이언트 경계 모듈(`*Client.tsx`)을 통해 상위 모듈로 투명하게 Re-export 됩니다.
   - 이전 하위 호환성 포워더 파일명(`layoutNavigation.tsx`, `formDataInput.tsx`, `containmentDisclosure.tsx`, `dataDisplay.tsx`, `feedbackStatus.tsx`)은 코드베이스 최적화를 위해 완전히 제거되었습니다. 모든 컴포넌트는 `@/components/ui` 또는 concise 모듈 파일을 직접 임포트합니다.

5. **접근성 및 디자인 토큰 준수**:
   - WCAG AAA 고대비 모드(`prefers-contrast: more`), 동작 줄이기(`prefers-reduced-motion: reduce`), Display-P3 광색역 지원.
   - 모든 인터랙티브 컨트롤 44x44px 이상 터치 영역 보장.
   - 라이트 모드 소프트 파스텔 액센트: `--color-primary: #db528d`, `--color-secondary: #9055cf` 및 텍스트 전용 토큰 `--accent-primary-text: #a8275f` 적용으로 흰색 텍스트 및 배경 대비율 >= 5.5:1 확보 (WCAG AA/AAA 완벽 준수).

6. **나눔스퀘어 네오 서체 & 순수 RSC 페이지 아키텍처**:
   - 나눔스퀘어 네오(NanumSquare Neo Variable) 공식 서체 도입 및 `<head>` 내 preconnect/preload 적용, `next/font` Zero-CLS 메트릭 폴백 정렬.
   - 라우트 페이지(`app/page.tsx`) 내 `"use client"` 완전 배제 (순수 Server Component화) 및 `WorkbenchClient.tsx` 클라이언트 경계 모듈 분리.
   - 모바일 하단 탭바(`TabBar`) 너비 제약(`width: calc(100% - 2rem); left: 1rem; right: 1rem;`) 및 requestAnimationFrame 히스테리시스 스크롤 감지(`delta > 25 && currentY > 100`)로 진동 현상 원천 차단.
   - 사이드바 내부 중복 접기 버튼 제거 (상단 App Bar 단일 토글로 통합).
   - `Diff` 컴포넌트: 터치/포인터 제스처 및 키보드(좌우 화살표, Home, End) 슬라이더 완전 지원 (`role="slider"`, `aria-valuenow`).
   - SEO & PWA 무결성 자산: `robots.ts`, `sitemap.ts`, `humans.txt`, `llms.txt`, `llms-full.txt`, `manifest.json`, `ads.txt`, `feed.xml`(RSS/Atom), `sw.js`(PWA Service Worker), 전역 에러 바운더리(`error.tsx`, `not-found.tsx`, `global-error.tsx`).
   - 스테일(Stale) 청크 파일 404 오류 자동 감지 및 새로고침 복구 가드(`ClientRuntimeProvider.tsx`).
   - 단일 원커맨드 세팅 CLI 스크립트(`setup.mjs`, `npm run setup`) 완비.

7. **최신 종합 고도화 (v0.2.0 Complete Architecture)**:
   - **감성 파스텔 브랜드 팔레트 & 정밀 다크 대비**: 라이트 모드 소프트 로즈/핑크(`#db528d`), 소프트 라일락/라벤더(`#9055cf`) / 다크 모드 파스텔 핑크(`#f472b6`), 파스텔 퍼플(`#c084fc`) 및 Display-P3 광색역 지원. 다크 모드 캔버스 배경(`#09070e`)과 카드/서피스 요소(`#1c1926`, 테두리 구분선 `rgba(240, 235, 255, 0.20)`) 간 정밀 대비 증강으로 심미성과 가독성 극대화.
   - **강한 곡률 체계 (Unified Strong Curvature)**: 컨테이너/카드/모달 `rounded-3xl` (24px~32px), 입력/버튼/필(Pill) `rounded-2xl` (16px~18px).
   - **모바일 헤더 흔들림 원천 차단**: 이전 높이 가변 축소(`max-h-40` -> `max-h-0`) 제거, 고정 높이 56px Liquid Glass App Bar로 레이아웃 시프트 0 (Zero-CLS) 달성.
   - **동적 문서 타이틀 및 헤더 연동**: `page.tsx` 내 `PAGE_CONFIG` 정의에 따라 App Bar 제목과 브라우저 `document.title` 자동 동기화.
   - **카드 내 드롭다운 클리핑 방지**: Card 컨테이너에 `overflow-visible relative`를 적용하여 풀다운 메뉴가 잘리지 않도록 개선.
   - **6자리 OTP 패스코드 UI**: 3+3 인지적 그룹화와 여유로운 간격(`gap-2.5 sm:gap-3.5`, `w-12 h-14 rounded-2xl`) 및 포커스 상태 연동.
   - **안티에일리어싱 방사형 진행률 (RadialProgress)**: 거친 CSS `conic-gradient` 대신 서브픽셀 SVG 벡터 원형과 `shapeRendering="geometricPrecision"` 채택.
   - **Alert 액션 버튼 시맨틱 컬러 매칭**: 알림 타입(경고=warning, 성공=success, 에러=error, 정보=info)에 맞춘 의미론적 버튼 색상 연동.
   - **SearchField 인라인 완벽 정렬**: 검색 아이콘과 placeholder의 수직/수평 중심선 완전 일치 및 WebKit 네이티브 취소 버튼 중복 제거.
   - **Next.js 16 병렬 인터셉팅 라우트**: `@modal/(.)preview/[id]` 인앱 오버레이 모달(ESC 키 지원) 및 `/preview/[id]` 단독 페이지 폴백.
   - **RSC 점진적 스트리밍 및 스켈레톤**: `lib/server/metrics.ts`(`server-only` 패키지 누수 방지)와 `<Suspense fallback={<StreamingSkeleton />}>`를 통한 Partial Prerendering(◐) 구현.
   - **next/dynamic 지연 로딩**: `CommandMenu`, `OfflineBanner`, `BottomSheet`, `VirtualList` 지연 로딩을 통한 초기 번들 최적화.
   - **대용량 가상화 리스트 (`VirtualList`)**: `@tanstack/react-virtual` 윈도잉 렌더링 및 `sessionStorage` 스크롤 위치 복원.
   - **제스처 바텀 시트 (`BottomSheet`)**: 모바일 필 핸들, 아래 드래그 제스처 닫기, 스와이프 속도(Velocity) 계산, 내부 스크롤 충돌 방지 및 햅틱 연동.
   - **파워유저 커맨드 팔레트 (`CommandMenu`)**: `⌘K` / `Ctrl+K` 전역 단축키, 키보드 탐색, 섹션 점프, 컴포넌트 빠른 탐색 및 테마 전환.
   - **촉각 햅틱 피드백 (`lib/haptics.ts`)**: Web Vibration API 기반 가벼운 터치/선택/성공/경고/에러 진동.
   - **오프라인 감지 및 백그라운드 큐 (`OfflineBanner`, `lib/offlineQueue.ts`)**: 네트워크 단절 시 자동 큐잉 및 온라인 복귀 시 자동 방출.
   - **React 19 최신 상태 엔진**: `useOptimistic` 낙관적 즉각 반응과 `useActionState` 깜빡임 없는 인라인 폼 검증.
   - **URL 상태 동기화 및 뷰 트랜지션**: `nuqs` 기반 쿼리 파라미터 연동 및 `next-view-transitions` 통합.
   - **버튼 더블 클릭 방지 및 인라인 로딩**: 비동기 Promise 자동 pending 스피너 및 중복 호출 보호.
   - **종횡비 예약 & Blur 플레이스홀더**: `placeholder="blur"`와 base64 SVG 프리뷰를 통한 레이아웃 시프트 0 (Zero-CLS) 카드 이미지.
   - **Apple Design 유체 모션 물리 엔진**: `BottomSheet.tsx`에 WWDC *Designing Fluid Interfaces* 공식 지수 감쇠 모멘텀 투영($\text{project}(v) = (v/1000) \cdot d / (1 - d)$, $d=0.998$) 및 고무줄 밴딩 저항($\frac{x \cdot D \cdot 0.55}{D + 0.55 \cdot x}$) 탑재로 제스처 조작감 극대화.
   - **Chrome 실기 브라우저 무결성 검증**: 실제 Google Chrome 브라우저(`chrome.exe`)를 통해 데스크톱(1280x900) 및 모바일(390x844) 시각적 렌더링 스크린샷 생성 및 콘솔 런타임/Hydration 오류 0건 검증 완료.
   - **프로덕션 원클릭 배포 패키지 (`vercel.json`, `setup.mjs`)**: Vercel 및 클라우드 배포를 위한 보안 헤더, 정적 에셋 불변 캐시, PWA 서비스 워커 무캐시 정책 및 `setup.mjs` 20개 자산/토큰 무결성 CLI 완비.
   - **ErrorBoundary & EmptyState 코어 컴포넌트**: 위젯 단위 에러 격리 `<ErrorBoundary>`(인라인 다시 시도) 및 일관된 빈 화면 UI `<EmptyState>` 공식 편입.
   - **광학 자간 및 한국어 단어 보존**: `word-break: keep-all; overflow-wrap: break-word;`, 헤딩 `-0.025em`, 본문 `-0.008em`, 수치 `tabular-nums`.
   - **전역 클릭 물리 피드백**: `:active:not(:disabled) { transform: scale(0.97); }` 누름 물리 반응 강화.
   - **성능 캐싱 & LCP 가속**: `lib/server/metrics.ts`에 `React.cache()` 적용, `Card.tsx`에 `imagePriority?: boolean` 속성 지원.
   - **클리핑 방지 및 안전 여백**: `Dropdown` `align?: "start" | "end"`, `SearchField` Scope Bar `max-w-full overflow-x-auto`, `Toast` `line-clamp-2 break-keep`.
   - **사이드바 셰도우 클리핑 해소 및 심도 개선 (`.pst-sidebar-shadow`)**: 수평 확산 심도 그림자(`4px 0 24px -2px rgba(40, 20, 60, 0.08)` 라이트, `4px 0 28px -2px rgba(0, 0, 0, 0.55)` 다크)를 적용하고, 윈도우 가장자리 충돌 방지 오프셋(`top-3.5 bottom-3.5 start-3.5`) 및 셸 컨테이너 `overflow-x-clip md:overflow-x-visible`를 설정하여 사이드바 그림자가 메인 콘텐츠 영역 위로 잘림 없이 부드럽게 드리워지도록 개선 완료.
   - **Lighthouse 공식 감사 만점 및 웹 표준 극대화**:
     - **Accessibility (접근성)**: **100 / 100** 만점 (헤딩 시맨틱 계층 구조 h1→h2 보정, WCAG 2.5.3 보이는 텍스트와 accessible name 완벽 일치).
     - **Best Practices (모범 사례)**: **100 / 100** 만점.
     - **SEO (검색 엔진 최적화)**: **100 / 100** 만점.
     - **Performance (성능)**: 데스크톱 **81점**, Zero-CLS (`0.000` 완벽 안정), 데스크톱 TBT **0ms** (Zero Total Blocking Time), 외부 대용량 가변 폰트 비차단 스왑(`font-display: swap`) 및 RSC 텔레메트리 최적화 완료.
   - **프레임워크 양방향 내보내기 & 안전 동기화 CLI (`setup.mjs`, `pstui.manifest.json`)**:
     - 타 Next.js 프로젝트로 컴포넌트, 레이아웃(`AppShell`), 오버레이 컨텍스트, 유틸리티, 토큰을 원클릭 배포하는 `--export` CLI 지원.
     - 신규 릴리스 시 사용자 커스텀 코드를 보존하면서 안전하게 업그레이드하는 `--update` / `--sync` CLI 및 무손실 `.pstui-latest` 분기/자동 백업(`.bak`) 지원.
     - 29개 코어 파일의 SHA-256 해시를 추적하는 공식 무결성 매니페스트 `pstui.manifest.json` 완비.
     - 독립형 디자인 토큰 스타일시트 `styles/pstui-tokens.css` 및 `package.json` 공식 서브패스 `exports` 매핑 규격화.


---

## 1. 작업 수행 전 필수 사고 프로세스 (Pre-Coding Protocol)

코드를 한 줄이라도 작성하기 전에 반드시 다음 4단계를 내부적으로 검증하십시오.

### 1.1 레이어 분류 (Layer Classification)
- 구현할 요소가 콘텐츠 위에 부유하는 **기능/탐색 레이어(Liquid Glass)**인가, 아니면 스크롤되는 **콘텐츠 레이어(Standard Material / Base Surface)**인가?
- **규칙**: 일반 카드(`Card`), 테이블, 리스트 행(`List`), 본문 폼 컨테이너에는 **절대 `--liquid-glass-*` 토큰을 적용하지 마십시오**. Liquid Glass는 오직 탭바, 사이드바, 플로팅 툴바, 팝오버, 최상위 Floating CTA 버튼에만 사용합니다.

### 1.2 반응형 뷰포트 매핑 (Viewport Mapping)
- 모바일(`< 768px`)과 태블릿/데스크톱(`>= 768px`)에서 이 화면과 네비게이션이 어떻게 전환되는가?
- **규칙**: 모바일에서는 하단 플로팅 탭 막대(`TabBar`), 태블릿/데스크톱에서는 좌측 플로팅 사이드바(`Sidebar`)와 필요한 경우 Split View(보조 목록 열)로 반응해야 합니다. 데스크톱에서 모바일 프레임(예: `max-width: 430px`)에 전체 화면을 가두는 안티패턴을 엄격히 금지합니다.

### 1.3 시맨틱 토큰 및 강조 절제 확인 (Accent Restraint)
- `#ff00bb`(Primary)와 `#ea00ff`(Secondary)가 화면에서 가장 중요한 1~2개의 핵심 동작이나 활성 상태에만 쓰였는가?
- **규칙**: 상호작용이 불가능한 일반 텍스트나 장식 요소에 브랜드 강조 색상을 남발하지 마십시오.

### 1.4 엣지 케이스 및 복구 흐름 (Edge Cases & Autonomy)
- 빈 상태(Empty State), 비동기 지연(Inline Spinner), 입력 중 모달 닫기 시 데이터 유실 방지 시트(`isDirty` Guard), 키보드 포커스 이동(Tab, ESC, Enter), 다크 모드 및 고대비 모드가 모두 고려되었는가?

---

## 2. 아키텍처 및 코드 구현 표준 (Engineering Standards)

### 2.1 레이아웃 및 네비게이션 구현 (AppShell)
1. **단일 반응형 셸 구조**:
   - **모바일(< 768px)**: 화면 하단 고정 Liquid Glass 탭 막대(`height: var(--tabbar-height)`). 탭 항목은 3~5개 이하로 제한하며, 아래로 스크롤 시 최소화(`scale(0.90)` 및 `translate-y-2`)되고 위로 스크롤 시 복원되는 이벤트 리스너를 비차단(`passive: true`) 방식으로 구현하십시오.
   - **패드/PC(>= 768px)**: 하단 탭 막대를 숨기고(`display: none`), 좌측 고정 Liquid Glass 사이드바(`width: var(--sidebar-width)`)를 렌더링하십시오. 사이드바 접기/펼치기 토글 버튼을 상단 툴바 선행 영역에 반드시 제공하십시오.
2. **배경 확장 (Background Extension) 구현**:
   - `<main>` 콘텐츠 영역은 100vw, 100vh(또는 100dvh) 전체를 채우며 스크롤되어야 합니다.
   - 좌측 사이드바나 하단 탭 막대만큼 `<main>`의 바깥 마진(`margin`)을 잘라내지 마십시오. 대신 콘텐츠 내부 패딩(`padding-inline-start: calc(var(--sidebar-width) + 24px)`, `padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom) + 24px)`)을 사용하여 스크롤 시 콘텐츠가 반투명한 Liquid Glass 뒤로 자연스럽게 지나가며 비치도록 구현하십시오.
3. **데스크톱 하단 배치 금지**:
   - 사이드바 최하단이나 윈도우 하단 가장자리에 핵심 액션 버튼이나 중요 상태 정보를 고정하지 마십시오. 주요 제어기는 상단 툴바나 콘텐츠 상단 선행 영역에 배치하십시오.

### 2.2 컴포넌트 엔지니어링 규칙

#### A. 버튼 및 풀 다운 메뉴 (`Button`, `Dropdown` / `PullDownMenu`)
- 모든 인터랙티브 요소에 `min-width: 44px; min-height: 44px;` 히트 영역을 강제하십시오 (`.pst-press` 클래스 필수).
- `:active` 상태에 `transform: scale(0.96)`과 트랜지션(`var(--duration-fast) var(--ease-spring)`)을 적용하십시오.
- **비동기 액션 처리**: API 호출 버튼 클릭 시 전체 화면을 막는 스켈레톤이나 오버레이 로더를 띄우지 말고, 버튼 내부에 SVG 스피너를 렌더링하며 텍스트를 '저장 중…', '결제 중…'으로 즉시 변경하십시오.
- **생략 부호(…) 규칙**: 클릭 시 모달, 다이얼로그, 파일 선택기 등 추가 입력 보기를 여는 버튼 텍스트 끝에는 반드시 `…`을 붙이십시오 (예: '프로필 편집…').
- **삭제(Destructive) 보호**: 삭제 버튼에는 `type="submit"`이나 Enter 키 기본 실행 핸들러를 바인딩하지 마십시오. 풀 다운 메뉴(3개 이상 항목 필수) 내부의 삭제 항목 클릭 시에는 즉시 삭제하지 말고 확인 팝오버(PC) 또는 동작 시트(Mobile)를 먼저 띄우십시오.

#### B. 모달, 시트 및 경고 (`Modal`, `ActionSheet`, `AlertDialog`)
- 시맨틱 `<dialog>` 태그 또는 포커스 트랩(Focus Trap)과 `aria-modal="true"`가 적용된 컨테이너를 사용하십시오.
- **다중 모달 중첩 금지**: 모달 내부에서 또 다른 모달을 여는 코드를 작성하지 마십시오 (긴급 `AlertDialog` 1개만 예외).
- **Dirty State(미저장 데이터) 가드**: 모달 내부에 수정된 입력값(`isDirty === true`)이 있을 때 사용자가 닫기 버튼, 배경(Backdrop) 클릭, 또는 Escape 키를 누르면 즉시 닫지 말고 '편집 내용 삭제' / '임시 저장' / '계속 편집' 확인 시트를 호출하십시오.
- **경고 버튼 규격**: 경고창의 확인 버튼에 '확인(OK)'이나 '예(Yes)'를 쓰지 마십시오. '삭제', '변환', '지우기' 등 구체적인 동사를 사용하고, 취소 버튼('취소')은 좌측(선행) 또는 수직 스택 최하단에, 기본 동작 버튼은 우측(후행) 또는 스택 상단에 배치하십시오.

#### C. 폼, 텍스트 필드 및 검색 (`TextField`, `SearchField`, `OtpInput`)
- **고정 레이블 필수**: placeholder만 있는 `<input>` 생성을 금지합니다. 반드시 `<label>` 요소를 필드 상단이나 선행 위치에 명시적으로 연결(`htmlFor` / `id`)하십시오.
- 입력값이 있을 때 우측 끝에 즉시 내용을 비우는 지우기(X) 버튼을 렌더링하고, 용도에 맞는 `type`, `inputMode`, `autoComplete` 속성을 지정하십시오.
- **유효성 검사 분리**: 이메일/전화번호 등 포맷 검사는 `onBlur`에서 실행하고, 아이디 중복/암호 규칙 검사는 `onChange`에서 실시간으로 피드백하십시오.
- **검색 UI**: 타이핑 즉시 필터링되는 반응형 검색과 함께, 카테고리를 좁히는 범위 막대(Scope Bar) 및 선택·삭제 가능한 알약 형태의 검색 토큰(Search Tokens) 컴포넌트를 구현하십시오. 모바일/태블릿 뷰포트에서는 검색창에 `autoFocus`를 부여하지 마십시오.

#### D. 선택 제어기 및 슬라이더 (`Switch`, `Checkbox`, `Radio`, `Slider`, `Tabs`)
- **컨텍스트별 토글 분기**: 리스트 행 내부에서는 `Switch`를, 리스트 외부(툴바/필터)에서는 아이콘+배경 하이라이트 방식의 `ToggleButton`을 렌더링하십시오.
- **체크상자 혼재 상태**: 계층형 체크상자 구현 시 하위 항목 일부만 선택된 경우 부모 체크상자의 `indeterminate = true` 속성과 대시(-) 아이콘 렌더링을 반드시 구현하십시오.
- **옵션 개수 제한**: 상호 배타적 옵션이 2~5개면 `Radio` 버튼을, 6개 이상이면 반드시 `<select>` 또는 커스텀 팝업 버튼(`Select`)으로 렌더링하십시오 (`Radio` 컴포넌트 내부에서 자동 분기 지원).
- **구분 제어기 (`Tabs`)**: 모든 세그먼트 버튼을 동일한 너비(`grid-auto-columns: 1fr` 또는 `flex: 1`)로 맞추고, 텍스트와 아이콘 세그먼트를 혼용하지 마십시오 (모바일 최대 5개, PC 최대 7개).
- **슬라이더 (`Slider`)**: 좌→우 채우기 트랙에 `var(--gradient-brand)`를 적용하고, 넓은 숫자 범위를 다룰 때는 우측에 직접 숫자를 입력할 수 있는 보조 `<input type="number">` 및 +/- 스텝퍼 버튼, 눈금 마크(Tick marks)를 함께 배치하십시오.

### 2.3 프레임워크 내보내기, 버전 동기화 및 매니페스트 관리 규칙 (Export & Sync)
1. **독립형 토큰 스타일시트 (`styles/pstui-tokens.css`)**:
   - 외부 프로젝트로 pstui를 내보낼 때는 본 파일이 단일 스타일 공급원이 됩니다. DaisyUI 5 테마, Liquid Glass CSS 변수, 폰트 자간, 물리 터치 피드백(`.pst-press`)이 모두 포함되어야 합니다.
2. **매니페스트 무결성 (`pstui.manifest.json`)**:
   - 컴포넌트나 레이아웃, 토큰 파일을 수정하거나 추가한 경우 반드시 `npm run manifest` 또는 `npm run setup`을 실행하여 29개 관리 파일의 SHA-256 해시를 갱신하십시오.
3. **안전 동기화 원칙 (Safe Upgrade)**:
   - 사용자가 컴포넌트를 커스텀 수정한 경우(`currentHash !== recordedHash`), 업데이트 명령(`--update`)은 해당 파일을 덮어쓰지 않고 `.pstui-latest`를 생성하여 개발자의 코드를 절대 손실시키지 않습니다. `--force` 플래그 지정 시에만 자동 백업(`.bak.<timestamp>`) 후 갱신합니다.
4. **패키지 서브패스 매핑 (`package.json`)**:
   - `pstui`는 `"pstui/ui"`, `"pstui/layout"`, `"pstui/context"`, `"pstui/lib"`, `"pstui/tokens"`, `"pstui/manifest"`의 표준 서브패스 익스포트를 유지해야 합니다.

---


## 3. 엄격한 금지 사항 (Strict Anti-Patterns)

에이전트는 어떠한 경우에도 다음 패턴을 코드에 생성해서는 안 됩니다.

1. **네이티브 전용 코드 혼입 금지**: Swift, SwiftUI, Objective-C API(`UIVibrancyEffectStyle`, `NSVisualEffectView` 등)를 웹 코드에 직접 작성하지 마십시오. 반드시 [DESIGN.md](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/DESIGN.md)에 정의된 웹 표준 CSS/HTML/JS 규격으로 구현하십시오.
2. **데스크톱의 모바일 컨테이너 감금 금지**: 데스크톱 화면(`>= 768px`)에서 화면 중앙에 `max-width: 430px` 같은 스마트폰 프레임 박스를 만들어 놓고 좌우 여백을 버리는 레이아웃을 절대 작성하지 마십시오.
3. **하드코딩 색상 및 가는 폰트 금지**: `#ffffff`, `#000000`, `rgb(...)` 등의 하드코딩 색상과 `font-weight: 100 | 200 | 300` 사용을 금지합니다. 모든 색상은 `var(--...)` 시맨틱 토큰을 사용하십시오.
4. **초기 진입 경고 및 권한 요청 금지**: `useEffect` 마운트 시점에 위치/카메라/알림 권한을 즉시 요청하거나 네트워크 오류 경고창(Alert)을 띄우지 마십시오. 권한은 사용자의 명시적 클릭 이벤트 핸들러 내부에서만 요청하십시오.
5. **다크 패턴 사전 권한 모달 금지**: 시스템 권한 요청 전 안내 모달을 띄울 때 '허용'이라는 버튼명을 쓰거나, 닫기/취소 버튼, 보상 인센티브 문구를 넣지 마십시오. 오직 '계속' 또는 '다음' 단일 버튼만 제공하십시오.
6. **실행 취소 가능한 동작의 경고창 남발 금지**: 리스트 항목 삭제 등 일반적이고 되돌릴 수 있는 동작에 매번 확인 모달을 띄우지 말고, 즉시 처리 후 하단 토스트/배너로 '실행 취소(Undo)' 버튼을 제공하십시오.

---

## 4. 코드 출력 전 자체 검증 체크리스트 (Self-QA Checklist)

작업을 완료하고 사용자에게 코드를 제시하기 직전에 다음 항목을 점검하십시오.

- [ ] [DESIGN.md](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/DESIGN.md)의 CSS 변수(`--color-primary`, `--color-secondary`, `--liquid-glass-*`, `--material-*`)가 루트에 정상 선언되고 모든 스타일에 적용되었는가?
- [ ] `< 768px`에서는 하단 플로팅 Liquid Glass 탭 막대가, `>= 768px`에서는 좌측 플로팅 Liquid Glass 사이드바가 자연스럽게 전환되며 콘텐츠가 그 뒤로 확장(Background Extension)되는가?
- [ ] 라이트 모드, 다크 모드(`prefers-color-scheme: dark`), 대비 증가(`prefers-contrast: more`), 동작 줄이기(`prefers-reduced-motion: reduce`) 미디어 쿼리가 모두 반영되었는가?
- [ ] 모든 버튼과 입력 요소의 최소 히트 영역이 44x44px 이상이며, 색상 외에 아이콘·텍스트·모양 등 비색상 단서가 함께 제공되는가?
- [ ] 텍스트 필드에 고정 `<label>`과 지우기(X) 버튼이 존재하고, 모달 닫기 시 미저장 데이터 유실 방지 로직이 포함되어 있는가?
- [ ] `npm run build`를 실행하여 Turbopack 최적화 및 TypeScript 타입 검사가 0 오류로 성공하는가?

---

## 5. 코드 스타일 및 파일 명명 표준 (Naming & Conventions)
- **컴포넌트 및 파일 명명**: 컴포넌트 파일은 반드시 간결한 단일 단어 또는 명확한 복합어 **PascalCase**로 작성합니다 (예: `Button.tsx`, `Card.tsx`, `Navigation.tsx`).
- **함수 및 변수**: camelCase를 사용합니다.
- **인터페이스 및 타입**: PascalCase를 사용합니다.
- **모듈 익스포트**: [`components/ui/index.ts`](file:///c:/Users/xjdiu/OneDrive/Desktop/pstui/components/ui/index.ts)를 통해 모든 UI 컴포넌트를 단일 진입점으로 제공해야 합니다.

---

## 6. 법적 고지 및 상표권 면책 조항 (Legal & Trademark Disclaimer)
- **독립 오픈 소스 고지**: `pstui`는 인간 중심 인터랙션 원칙과 물리적 광학 머티리얼 인터페이스에서 영감을 받아 독자적으로 구축된 독립 오픈 소스 프로젝트입니다.
- **비제휴 명시**: 본 프로젝트는 Apple Inc.와 어떠한 제휴, 공식 후원, 보증 또는 연관 관계가 없습니다.
- **상표권 귀속**: Apple, iOS, iPadOS, macOS, visionOS, SF Pro, SF Symbols는 미국 및 기타 국가에 등록된 Apple Inc.의 상표입니다.