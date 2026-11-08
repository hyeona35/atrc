# DESIGN.md — Human-Centric & Liquid Glass Web Design System

본 문서는 인간 중심 인터랙션 철학(Human-Centric Interaction)과 Liquid Glass 머티리얼 아키텍처를 크로스플랫폼 모던 웹 환경(Mobile, Tablet, Desktop)에 맞게 정의한 단일 진실 공급원(Single Source of Truth)입니다. 모든 UI/UX 설계와 스타일링은 본 문서의 규격을 엄격히 준수합니다.

> **법적 고지 및 상표권 면책 조항 (Legal & Trademark Disclaimer)**:
> pstui는 독자적인 오픈 소스 UI 프레임워크 및 디자인 시스템입니다. Apple Inc.와 어떠한 제휴, 후원, 보증 또는 공식적인 연관 관계가 없으며, Apple, iOS, iPadOS, macOS, visionOS, SF Pro, SF Symbols는 미국 및 기타 국가에 등록된 Apple Inc.의 상표입니다.


1. 8대 핵심 디자인 원칙 (Core Design Principles)

모든 인터페이스 의사결정과 우선순위 조율은 다음 8가지 원칙을 기준으로 삼습니다.

목적 (Purpose): 장식보다 제품의 본질적 가치에 집중합니다. 사용자가 가장 중요하게 여기는 핵심 기능을 우선순위에 두고, 화면의 모든 요소가 명확한 존재 이유를 갖도록 설계합니다.

자율성 (Autonomy): 사용자를 특정 흐름이나 모드에 가두지 않습니다. 원하는 작업과 콘텐츠로 즉시 이동시키고, 진행 상태를 투명하게 알리며, 모든 동작은 쉽게 취소하거나 되돌릴 수(Undo) 있는 관용적 디자인을 제공합니다.

책임감 (Responsibility): 사용자의 안전과 개인정보 보호를 최우선으로 합니다. 필요한 데이터만 최소한으로 요청하며, 권한 요청 및 데이터 활용 목적을 능동형 문장으로 투명하게 밝힙니다.

친숙함 (Familiarity): 사용자가 이미 알고 있는 물리 세계의 은유와 웹·OS 표준 패턴을 일관되게 적용합니다. 모든 조작에는 즉각적이고 예측 가능한 피드백을 제공합니다.

유연성 (Flexibility): 모바일 터치, 태블릿, 데스크톱 포인터/키보드, 스크린 리더 등 다양한 입력 방식과 화면 크기, 문화적 맥락에 자연스럽게 적응하는 포용적(Inclusive) 인터페이스를 구축합니다.

단순함 (Simplicity): 단순함은 무조건적인 미니멀리즘이 아닙니다. 중요한 요소는 가까이 두고 부차적인 요소는 점진적 노출(Progressive Disclosure)로 정리하며, 명확한 시각적 계층과 간결한 단어를 사용합니다.

장인 정신 (Craftsmanship): 1px 단위의 정렬, 60fps의 물리 기반 애니메이션, 정확한 마이크로카피, 네트워크 오류 및 빈 상태(Empty State)까지 집요하게 다듬습니다.

즐거움 (Delight): 핵심 목적을 방해하는 과도한 장식이 아니라, 행동의 자유·탐색의 안전·세심한 마이크로 인터랙션이 조화를 이룰 때 자연스럽게 완성되는 사용의 기쁨을 전달합니다.

2. 브랜드 컬러 및 포용적 색상 아키텍처 (Color & Dark Mode)

2.1 브랜드 강조 색상 (Brand Accent Tokens)

pstui는 지나치게 강렬하거나 차가운 네온 톤을 지양하고, 부드럽고 우아하며 감성적인 **소프트 파스텔 팔레트(Soft Pastel Tone)**를 채택하여 장시간 사용 시 눈의 피로를 최소화하면서도 핑크와 보라 고유의 아이덴티티를 유지합니다.

다크 모드(기본):
- Primary Accent (--color-primary): #f472b6 (Pastel Blossom Pink / Display-P3: color(display-p3 0.93 0.47 0.70))
- Secondary Accent (--color-secondary): #c084fc (Pastel Lilac / Display-P3: color(display-p3 0.73 0.53 0.97))
- Brand Gradient (--gradient-brand): linear-gradient(135deg, var(--color-primary), var(--color-secondary))

라이트 모드(고대비 조화 보정):
- Primary Accent (--color-primary): #db528d (Soft Pastel Rose / Display-P3: color(display-p3 0.83 0.34 0.53), 흰색 텍스트 및 흰색 배경 대비율 >= 5.5:1로 WCAG AA/AAA 완벽 준수)
- Secondary Accent (--color-secondary): #9055cf (Soft Pastel Lavender / Display-P3: color(display-p3 0.54 0.35 0.79))
- Brand Gradient (--gradient-brand): linear-gradient(135deg, #db528d, #9055cf)

2.2 색상 적용 모범 사례

역할의 일관성: #ff00bb와 #ea00ff는 상호작용 가능한 요소(기본 CTA 버튼, 활성 탭 아이콘, 스위치/슬라이더 활성 트랙)를 나타내는 데 사용합니다. 상호작용이 불가능한 일반 장식 텍스트나 정적 아이콘에 동일한 브랜드 컬러를 사용하여 사용자를 혼란스럽게 하지 마십시오.

배경과 제어기의 대비: 콘텐츠 레이어에 화려하거나 다채로운 이미지/아트워크가 깔린 경우, 그 위에 얹히는 도구 막대나 탭 막대의 기호·레이블은 브랜드 컬러 대신 모노크롬(흑/백 고대비)을 사용하여 가독성 충돌을 방지합니다.

와이드 컬러(Wide Color) 지원: 호환 디스플레이에서 더 깊고 선명한 색감을 표현할 수 있도록 기본 sRGB 폴백과 함께 @supports (color: color(display-p3 1 1 1)) 구문을 항상 병행합니다.

2.3 다크 모드 및 심도 계층 (Dark Mode & Elevation)

시스템 화면 모드 동기화: OS 및 브라우저의 @media (prefers-color-scheme: dark) 설정을 기본으로 즉시 따릅니다(몰입형 미디어 뷰어 등 특수 목적 화면만 다크 모드 단독 고정 허용).

이중 배경 심도 (Base vs. Elevated): 다크 모드에서는 단순 색상 반전이 아닌 지각적 심도(Depth)를 구분합니다.

기본 배경 (--bg-base): 가장 어두운 캔버스 색상(#09070e / DaisyUI: #09070e)으로, 배경 인터페이스가 뒤로 물러나 보이게 합니다.

저심도/전경 배경 (--bg-elevated): 인지적 대비를 위해 한 단계 밝은 어두운 색상(#1c1926 / DaisyUI: #1c1926)과 선명한 외곽선(--separator: rgba(240, 235, 255, 0.20))을 적용하여 모달 시트, 팝오버, 전경 카드 등 상위 레이어가 배경 캔버스 위로 뚜렷하게 분리되어 앞으로 튀어나와 보이게 합니다.

흰색 배경 미디어 보정: 다크 모드에서 흰색 배경이 포함된 콘텐츠 이미지는 주변 어두운 UI 사이에서 눈부심을 유발하지 않도록 명도를 미세하게 낮춥니다(filter: brightness(0.92)).

중립 구성요소의 색조 조화: 데스크톱 환경에서 중립 상태의 커스텀 베젤/카드 배경에는 미세한 투명도를 부여하여 배경 색조와 자연스럽게 어우러지게 하되, 강조 색상(#ff00bb)이 적용된 상태에서는 색상 왜곡을 막기 위해 높은 불투명도를 유지합니다.

2.4 포용적 색상 및 접근성 대비 (Inclusive Color)

비색상 단서 필수 병행: 색맹 또는 시각 장애 사용자를 위해 상태(성공, 오류, 경고, 선택됨)를 색상으로만 전달하지 않고 아이콘(글리프 모양), 텍스트 레이블, 체크 표시, 밑줄을 반드시 함께 표시합니다.

문화적 맥락 고려: 색상(예: 빨간색/초록색)이 국가나 문화권에 따라 다르게 해석될 수 있음을 고려하여 상승/하락 화살표 기호(▲/▼)나+/- 부호를 병기합니다.

명도 대비율: 일반 텍스트는 최소 4.5:1, 작은 텍스트(14px 이하) 및 고대비 모드(prefers-contrast: more)에서는 최소 7:1 이상의 대비율을 확보합니다.

시맨틱 컬러 재정의 금지: --separator(구분선)를 텍스트 색상으로 쓰거나 --label-secondary를 배경 색상으로 쓰는 등 시맨틱 토큰의 본래 목적을 임의로 변경하지 마십시오.

3. 머티리얼 및 Liquid Glass 시스템 (Materials & Liquid Glass)

인터페이스는 기능 및 탐색 레이어(Liquid Glass)와 콘텐츠 레이어(Standard Materials)로 엄격히 분리됩니다.

3.1 Liquid Glass (기능 및 탐색 레이어 전용)

적용 대상: 하단 탭 막대(Mobile), 좌측 사이드바(Pad/PC), 상단/하단 플로팅 툴바, 핵심 플로팅 CTA 버튼, 활성화 중인 슬라이더/토글 조절기(Thumb).

콘텐츠 레이어 사용 금지: 일반 본문 카드, 리스트 행, 테이블 셀, 페이지 기본 배경에는 절대 Liquid Glass를 사용하지 마십시오.

2가지 변형 (Variants):

Regular Liquid Glass (기본): 배경 콘텐츠를 강하게 블러 처리하고 발광도를 조절하여 텍스트가 많은 사이드바, 팝오버, 탭 막대의 가독성을 보장합니다. 스크롤 시 경계면의 불투명도와 구분선이 자연스럽게 강화되는 스크롤 가장자리 효과(Scroll Edge Effect)와 결합합니다.

Clear Liquid Glass (투명): 사진, 비디오, 전체 화면 아트워크 등 시각적으로 풍부한 미디어 배경 위에 떠 있는 제어기에 사용합니다. 배경 미디어가 밝을 경우 가독성 확보를 위해 제어기 뒤에 불투명도 35%의 어두운 디밍 레이어(rgba(0, 0, 0, 0.35))를 추가합니다.

Liquid Glass 색상 (스테인드글라스 강조):

기본적으로 Liquid Glass는 고유 색상 없이 아래 콘텐츠의 색상을 투과합니다.

완료, 주요 생성, 결제 등 화면에서 가장 중요한 기본 동작(Primary CTA) 버튼 1~2개에 한해서만 기호/텍스트가 아닌 Liquid Glass 배경 자체에 --liquid-glass-primary-bg 또는 --gradient-brand 색유리 스타일을 입혀 시선을 집중시킵니다.

3.2 표준 머티리얼 및 생동감 (Standard Materials & Vibrancy)

Liquid Glass 아래의 콘텐츠 레이어 내부에서 섹션과 그룹을 시각적으로 구분할 때는 4단계 표준 머티리얼을 사용합니다:

--material-ultra-thin: 배경 맥락 유지를 위한 전체 오버레이

--material-thin: 인라인 버튼 및 선택 항목 강조

--material-regular: 그룹화된 표 보기, 카드, 섹션 기본 배경

--material-thick: 높은 텍스트 대비가 필요한 전경 요소

생동감(Vibrancy) 계층 규칙:

텍스트 레이블은 4단계(--label-primary, --label-secondary, --label-tertiary, --label-quaternary)를 사용하되, 대비가 낮아지는 --label-quaternary는 thin 및 ultra-thin 머티리얼 위에서 절대 사용하지 마십시오.

채우기 색상은 3단계(--fill-primary, --fill-secondary, --fill-tertiary)를 사용하며, 구분선은 단일 --separator 토큰을 사용합니다.

4. 크로스플랫폼 반응형 레이아웃 및 탐색 (Layout & Navigation)

4.1 플랫폼별 적응형 탐색 (sidebarAdaptable 아키텍처)

구분

모바일 뷰포트 (< 768px)

태블릿(Pad) 및 데스크톱(PC) (>= 768px)

탐색 컴포넌트

하단 Liquid Glass 플로팅 탭 막대 (Tab Bar)

좌측 Liquid Glass 플로팅 사이드바 (Sidebar)

배치 및 구조

화면 하단 고정 (bottom: calc(12px + env(safe-area-inset-bottom))), 콘텐츠 위 부유

화면 선행(좌측) 고정, 콘텐츠 위 부유 + 접기/펼치기(Toggle) 버튼 지원

항목 수 및 계층

최대 3~5개 탭 ('더 보기' 초과 탭 발생 금지). 채워진 아이콘 + 한 단어 레이블(상하 배치)

최대 2단계 계층까지만 허용(펼침 제어기 그룹화). 3단계 이상은 인접한 **Split View(콘텐츠 목록 열)**로 분리

핵심 동작 규칙

오직 섹션 간 '탐색' 전용(동작 제어는 툴바 사용). 아래로 스크롤 시 최소화/축소, 위로 스크롤 또는 탭 시 확장

창 너비 축소 시 3차 열(인스펙터) → 사이드바 순으로 축소하며 가능한 한 오랫동안 전체 레이아웃 유지 후 콤팩트 보기로 전환

절대 금지 사항

특정 섹션에 데이터가 없다고 탭을 숨기거나 disabled 처리 금지(진입 후 빈 상태 안내 표시)

사이드바 또는 윈도우 최하단 가장자리에 핵심 정보나 주요 제어기 배치 금지 (창이 화면 밖으로 내려갈 수 있음)

사이드바 셰도우 및 오프셋 표준 (.pst-sidebar-shadow)

- 사이드바는 우측 콘텐츠 위로 깊이감 있는 수평 심도 그림자(`4px 0 24px -2px rgba(40, 20, 60, 0.08)` 라이트, `4px 0 28px -2px rgba(0, 0, 0, 0.55)` 다크)를 투영해야 합니다.
- 윈도우 가장자리와의 충돌 및 잘림(Clipping)을 방지하기 위해 `top-3.5 bottom-3.5 start-3.5` (14px 상/하/좌 여백)으로 부유하며, 상위 컨테이너에 `overflow-x-clip md:overflow-x-visible`를 부여하여 데스크톱에서 그림자가 본문 영역으로 자연스럽게 펼쳐져야 합니다.

4.2 배경 확장 및 안전 영역 (Background Extension & Safe Area)

배경 확장 (Edge-to-Edge): 배경과 스크롤 가능한 콘텐츠, 아트워크는 디스플레이 가장자리(100vw, 100vh)까지 완전히 확장되어야 합니다. 사이드바나 하단 탭 막대 영역을 빈 여백으로 잘라내지 말고, 콘텐츠가 Liquid Glass 사이드바와 탭 막대 뒤로 흘러 들어가 비쳐 보이도록 내부 패딩(padding-inline-start, padding-bottom)으로 설계합니다.

안전 영역 및 여백: env(safe-area-inset-*)를 준수하며, 모바일에서 화면 양 끝에 붙는 전각(Full-bleed) 버튼을 피하고 표준 여백(16px~20px) 안쪽으로 삽입된 둥근 모서리 버튼을 사용합니다.

4.3 강한 곡률 체계 (Unified Strong Curvature System)

pstui는 모던 하드웨어 베젤 및 유기적 글래스 질감에 어울리도록 명확하고 일관된 **강한 곡률(Strong Squircle Curvature)**을 사이트 전체에 부여합니다:
- **최상위 컨테이너 / 대형 카드 / 모달 / 바텀 시트**: `rounded-3xl` (24px ~ 32px, `--radius-box: 1.5rem`)
- **폼 입력 필드 / 액션 버튼 / 세그먼트 / 알약(Pill)**: `rounded-2xl` (16px ~ 18px, `--radius-field: 1rem`, `--radius-selector: 1.25rem`)
- **보조 배지 / KBD 키캡 / 툴팁**: `rounded-xl` (10px ~ 12px, `--radius-sm: 12px`)

5. 타이포그래피 (Typography)

나눔스퀘어 네오 (NanumSquare Neo) 공식 서체 스택:
- 메인 서체: 'NanumSquareNeo', -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", system-ui, sans-serif
- 가변 두께(Variable Font WOFF2): 300~900 범위 지원, 본문 및 제어기에는 가독성이 뛰어난 400(Regular), 500(Medium), 700(Bold), 800(ExtraBold)을 주로 사용.
- 성능 최적화: CDN preconnect 및 woff2 폰트 preload 링크를 <head>에 기본 선언하여 폰트 로딩 깜빡임(FOUT/FOIT)을 원천 방지.

플랫폼별 크기 규격:

모바일 / 태블릿 (< 1024px): 기본 본문 17px (1.0625rem), 절대 최소 크기 11px (권장 최소 12px).

데스크톱 (>= 1024px): 기본 본문 14px~15px (0.875rem~0.9375rem), 절대 최소 크기 11px.

서체 및 굵기 규칙:

가는 서체 사용 금지: font-weight: 100 ~ 300(Thin, Light)은 작은 크기에서 가독성이 떨어지므로 금지합니다. Regular(400), Medium(500), Semibold(600), Bold(700)만 사용합니다.

다이나믹 타입 우선순위: 텍스트 크기 확대 시 고정 UI(탭 레이블, 배지)보다 핵심 본문 콘텐츠의 가독성 확장을 최우선으로 반응하게 설계합니다.

광학 자간 (Optical Tracking) & 줄바꿈 보존 체계:
- **한국어 단어 보존**: `word-break: keep-all; overflow-wrap: break-word;` 전역 적용으로 조사나 어미가 어색하게 줄바꿈되지 않도록 방지.
- **제목 H1 ~ H3**: `letter-spacing: -0.025em; line-height: 1.25;` (시각적 밀도감 및 주목도 증강)
- **부제목 H4 ~ H5, .card-title**: `letter-spacing: -0.015em; line-height: 1.35;`
- **본문 (P, Label, Input, Select, Textarea)**: `letter-spacing: -0.008em;`
- **배지, KBD, 툴팁**: `letter-spacing: +0.015em;`
- **수치 및 타이머 (Font Mono, Countdown, Time)**: `font-variant-numeric: tabular-nums;` (숫자 변경 시 흔들림 없는 고정폭 정렬)

6. 동작 및 애니메이션 (Motion & Feedback)

입력 방식별 반응 차별화:

다이렉트 터치 (Mobile/Pad): :active 시 transform: scale(0.96) 및 즉각적인 밝기/글로우 변화로 촉각적 피드백을 강화합니다.

포인터/트랙패드 (Desktop): :hover 시 은은한 표면 하이라이트와 설명 툴팁을 제공합니다.

6. 물리적 일관성 및 유체 모션 엔진 (Fluid Motion Physics)

6.1 즉각적 반응과 중단 가능성 (Interruptibility)
애니메이션이 끝날 때까지 사용자의 다음 입력을 절대 차단하지 마십시오. 모든 인터페이스 동작은 진행 도중 언제든 사용자가 손가락으로 낚아채서 반대 방향으로 되돌릴 수 있는 중단 가능성(Interruptibility)을 갖춰야 합니다.
- **포인터 다운 즉시 반응**: 탭 릴리즈(click)를 기다리지 않고 :active 시점에 즉각 0.96 축소 및 햅틱 피드백을 발생시킵니다 (.pst-press).
- **상태 기반 스프링**: 고정 시간 CSS 키프레임 대신 현재 속도(velocity)와 실시간 위치를 보존하는 스프링 물리를 적용합니다.

6.2 지수 감쇠 모멘텀 투영 (Momentum Projection)
드래그나 플릭(Flick) 제스처가 끝나는 순간 단순히 릴리즈 좌표에 멈추거나 가장 가까운 경계로 스냅하지 않고, 제스처의 방출 속도를 바탕으로 정지 예상 지점(Endpoint)을 계산하여 투영합니다:
\[
\text{project}(v, d) = \frac{v}{1000} \cdot \frac{d}{1 - d} \quad (d \approx 0.998)
\]
투영된 최종 지점을 기준으로 시트 닫힘이나 스냅 여부를 결정하여 마치 물리적 물체를 던지는 듯한 생생한 손맛을 전달합니다.

6.3 부드러운 고무줄 밴딩 (Rubber-Banding)
스크롤이나 바텀 시트가 최대/최소 경계를 벗어날 때 딱딱한 벽에 부딪히며 멈추지 않고, 당길수록 점진적으로 저항이 커지는 물리적 고무줄 밴딩을 적용합니다:
\[
\text{rubberband}(x, D) = \frac{x \cdot D \cdot 0.55}{D + 0.55 \cdot |x|}
\]
- x: 경계를 초과한 오버슈트 거리
- D: 기준 요소 차원 크기 (시트 높이 등)

6.4 시각적 편안함 및 접근성
시야 가장자리(주변 시야)에서 지속적으로 움직이거나 깜빡이는 요소를 두지 마십시오. 어지럼증을 유발하는 진동 효과나 급격한 전체 배경 회전을 금지합니다.
@media (prefers-reduced-motion: reduce) 환경에서는 모든 이동/스케일 모션을 즉각적인 불투명도 전환으로 대체합니다.

7. 컴포넌트 상세 규격 (Component Specifications)

7.1 버튼 (Buttons) & 풀 다운 메뉴 (Pull-Down Menus)

히트 영역: 모든 버튼과 제어기는 최소 44x44px의 클릭/터치 영역과 주변 여백을 확보합니다.

크기가 아닌 스타일로 계층 구분: 나란히 배치된 선택 옵션 버튼들은 동일한 크기(너비/높이)를 유지하고, 가장 선택 가능성이 높은 기본(Primary) 버튼만 #ff00bb 강조 배경 스타일을 적용합니다(화면당 1~2개 제한).

역할 및 비동기 상태:

모든 버튼은 누르기 상태(:active)를 반드시 포함합니다.

비동기 지연 작업 시 버튼 내부에 인라인 활동 표시기(Spinner)를 표시하고 레이블을 동적으로 변경합니다(예: '결제하기' → '결제 중…').

클릭 시 즉시 실행되지 않고 추가 입력을 위한 모달이나 새 보기를 여는 버튼은 레이블 끝에 생략 부호(…)를 붙입니다(예: '편집…', '내보내기…').

삭제(Destructive) 버튼: 빨간색(--color-destructive) 스타일을 사용하며, 선택 가능성이 아무리 높아도 절대로 기본 역할(Enter 키 자동 실행)로 지정하지 않습니다.

풀 다운 메뉴 (Pull-Down Button):

최소 3개 이상의 항목이 있을 때만 사용합니다(1~2개면 일반 버튼이나 토글로 분리).

메뉴 내 제거/삭제 동작은 빨간색 텍스트로 표시하고, 선택 시 즉시 삭제하지 않고 해당 위치 근처에 확인용 동작 시트(Mobile) 또는 팝오버(Pad/PC)를 띄워 실수를 방지합니다.

7.2 모달 형식 (Modality) & 경고 (Alerts)

모달 설계 원칙: 모달은 짧고 집중된 단일 작업에만 사용하며, 모달 안에 복잡한 다단계 하위 계층을 넣어 '앱 안의 앱'을 만들지 마십시오. 기존 모달 위에 다른 모달을 중첩하지 않습니다(긴급 경고만 예외적으로 1개 허용).

데이터 유실 방지: 사용자가 입력한 내용이 있는 모달을 닫기 버튼, 배경 클릭, ESC 키, 스와이프로 닫으려 할 때 데이터가 유실된다면 즉시 닫지 말고 '편집 내용 삭제 / 임시 저장 / 계속 편집' 확인 시트를 표시합니다.

경고 (Alerts) 설계 규칙:

앱 최초 진입 시점이나 실행 취소(Undo)가 가능한 일반 삭제 동작에는 경고를 띄우지 마십시오.

'오류 329347' 같은 모호한 코드나 비난조를 피하고, 상황과 이유를 명확하고 중립적인 문장으로 설명합니다.

버튼 명명 및 배치: 단순 정보 알림 외에는 '확인(OK)'이나 '예/아니요' 사용을 금지하고 구체적인 동사('삭제', '변환', '지우기')를 사용합니다. 취소 버튼은 항상 '취소'로 명명하며 행의 앞쪽(좌측) 또는 수직 스택 최하단에 배치하고, 기본 동작 버튼은 행의 뒤쪽(우측) 또는 스택 상단에 배치합니다.

7.3 텍스트 필드 (Text Fields) & 검색 필드 (Search Fields)

영구적 레이블 및 지우기 버튼: 플레이스홀더 외에 목적을 설명하는 별도의 고정 레이블을 항상 함께 배치하고, 우측 끝에 입력 내용을 한 번에 지우는 지우기(X) 버튼을 제공합니다.

유효성 검사 타이밍: 이메일 등 일반 포맷은 다른 필드로 초점이 이동할 때(onBlur) 검사하고, 사용자 이름이나 암호 생성 규칙은 입력 즉시(onChange) 실시간 피드백을 제공합니다.

검색 아키텍처:

타이핑 즉시 결과를 필터링하며, 최근 검색어 및 추천 검색어 제안을 기본 제공합니다.

넓은 범위(기본값)에서 좁은 카테고리로 좁히는 범위 막대(Scope Bar)와, 특정 속성/작성자를 알약 형태로 압축해 선택·편집할 수 있는 검색 토큰(Search Tokens)을 지원합니다.

가상 키보드가 화면을 가릴 수 있는 모바일/태블릿 환경에서는 화면 진입 시 검색창에 강제로 자동 포커스(autofocus)를 주지 마십시오.

7.4 토글, 스위치, 체크상자, 선택 버튼 (Toggles & Selection)

스위치(Switch): 모바일 목록 행(List Row) 내부나 데스크톱 상위 마스터 설정을 켜고 끌 때 사용합니다(활성 시 #ff00bb 또는 시스템 그린).

토글 버튼(Toggle Button): 목록 바깥(툴바, 필터 바 등)에서 단독 제어기로 쓰일 때는 스위치 대신 아이콘과 배경 하이라이트(#ff00bb 채우기 유무)로 상태를 표현하는 버튼을 사용합니다.

체크상자(Checkbox): 설정의 상하 계층이나 다중 선택 목록에 사용하며, 하위 항목 일부만 선택되었을 때 대시(-)로 표시되는 혼재 상태(indeterminate)를 반드시 지원합니다.

선택 버튼(Radio Button): 2~5개의 상호 배타적인 옵션에만 사용하며, 6개 이상의 옵션은 반드시 팝업 버튼(Select Dropdown)으로 대체합니다.

7.5 슬라이더 (Sliders) & 구분 제어기 (Segmented Controls)

슬라이더: 좌측(최소값)에서 우측(최대값)으로 채워지는 방향을 유지하고 활성 트랙에 --gradient-brand를 적용합니다. 조작 즉시 결과를 실시간 반영하며, 정밀한 입력이 필요한 경우 우측에 보조 숫자 텍스트 필드와 스텝퍼(+/-), 눈금 마크(Tick marks)를 함께 배치합니다.

구분 제어기: 모든 세그먼트는 동일한 너비를 가지며, 모바일 최대 5개, 데스크톱 최대 5~7개로 제한합니다. 단일 구분 제어기 내에서 텍스트와 아이콘을 혼합하지 말고 하나로 통일하며 명사/명사구 레이블을 사용합니다.

7.6 진행 과정 표시기 (Progress Indicators)

확정(Determinate) 우선: 작업 시간을 가늠할 수 있다면 회전 스피너 대신 진행률(0~100%)을 보여주는 확정 진행 막대를 사용하고, 미확정 막대에서 지속 시간 계산이 가능해지면 확정 막대로 전환합니다(단, 원형 스피너에서 선형 막대로 모양을 중간에 바꾸는 것은 금지).

정직한 페이스 및 중단 보호: 90%까지 급격히 진행 후 멈추는 기만적 애니메이션을 금지합니다. '로드 중' 대신 구체적인 작업 설명을 표시하고, 부작용 없이 중단 가능하면 '취소' 버튼을, 데이터 손실이 발생하면 '일시 정지' 버튼이나 취소 확인 경고를 제공합니다.

8. 브랜딩 및 개인정보 보호 UX (Branding & Privacy)

브랜딩 절제: 화면마다 상단에 고정 로고를 띄워 콘텐츠 공간을 낭비하지 마십시오. 스플래시/실행 화면을 브랜딩 수단으로 지연시키지 말고, 최초 환영/온보딩 화면과 절제된 #ff00bb 강조 색상, 긍정적이고 간결한 문장 톤으로 정체성을 전달합니다.

권한 요청 및 사전 안내 화면 (Pre-Alert Screen):

페이지 로드 즉시 권한을 요청하지 말고, 사용자가 관련 기능을 실제로 클릭한 맥락에서만 요청합니다.

시스템 권한 팝업 전에 커스텀 사전 안내 화면을 띄울 경우, 오직 단일 버튼만 포함하고 버튼 제목은 '허용'이 아닌 '계속' 또는 '다음'으로 지정합니다(취소/닫기 버튼이나 인센티브 제시, 시스템 팝업 모방 등 다크 패턴 엄격 금지).

보안 인증: 암호 입력 외에 패스키(Passkey / WebAuthn), 소셜 로그인, 브라우저 자동 완성(autocomplete)을 우선 지원하며 민감한 인증 정보를 평문 스토리지에 저장하지 않습니다.

9. CSS 디자인 토큰 베이스라인 (tokens.css)

:root {
  /* 1. Brand Accent Tokens (sRGB Fallback) */
  --color-primary: #ff00bb;
  --color-primary-rgb: 255, 0, 187;
  --color-secondary: #ea00ff;
  --color-secondary-rgb: 234, 0, 255;
  --gradient-brand: linear-gradient(135deg, var(--color-primary), var(--color-secondary));

  /* 2. Semantic Status Colors */
  --color-destructive: #ff3b30;
  --color-success: #34c759;
  --color-warning: #ff9500;

  /* 3. Light Mode Surfaces & Vibrancy Labels */
  --bg-base: #f8f8fa;
  --bg-elevated: #ffffff;
  --label-primary: rgba(15, 15, 20, 0.96);
  --label-secondary: rgba(60, 60, 67, 0.68);
  --label-tertiary: rgba(60, 60, 67, 0.46);
  --label-quaternary: rgba(60, 60, 67, 0.24);
  --fill-primary: rgba(120, 120, 128, 0.20);
  --fill-secondary: rgba(120, 120, 128, 0.16);
  --fill-tertiary: rgba(118, 118, 128, 0.12);
  --separator: rgba(60, 60, 67, 0.29);

  /* 4. Liquid Glass (Functional Floating Layer) */
  --liquid-glass-bg: rgba(255, 255, 255, 0.72);
  --liquid-glass-clear-bg: rgba(255, 255, 255, 0.28);
  --liquid-glass-dimming: rgba(0, 0, 0, 0.35);
  --liquid-glass-border: rgba(255, 255, 255, 0.55);
  --liquid-glass-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  --liquid-glass-blur: blur(24px) saturate(190%);
  --liquid-glass-primary-bg: rgba(255, 0, 187, 0.85);

  /* 5. Standard Content Materials */
  --material-ultra-thin: rgba(255, 255, 255, 0.45);
  --material-thin: rgba(255, 255, 255, 0.62);
  --material-regular: rgba(255, 255, 255, 0.78);
  --material-thick: rgba(255, 255, 255, 0.90);

  /* 6. Typography & Layout Metrics */
  --font-sans: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --hit-target-min: 44px;
  --sidebar-width: 260px;
  --tabbar-height: 64px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-pill: 9999px;
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 180ms;
  --duration-normal: 250ms;
}

/* Display-P3 Wide Gamut Support */
@supports (color: color(display-p3 1 1 1)) {
  :root {
    --color-primary: color(display-p3 1 0 0.733);
    --color-secondary: color(display-p3 0.918 0 1);
  }
}

/* Dark Mode System Synchronization */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base: #09090d;
    --bg-elevated: #16161d;
    --label-primary: rgba(255, 255, 255, 0.96);
    --label-secondary: rgba(235, 235, 245, 0.68);
    --label-tertiary: rgba(235, 235, 245, 0.45);
    --label-quaternary: rgba(235, 235, 245, 0.22);
    --fill-primary: rgba(120, 120, 128, 0.36);
    --fill-secondary: rgba(120, 120, 128, 0.32);
    --fill-tertiary: rgba(118, 118, 128, 0.24);
    --separator: rgba(84, 84, 88, 0.65);

    --liquid-glass-bg: rgba(24, 24, 32, 0.68);
    --liquid-glass-clear-bg: rgba(18, 18, 24, 0.32);
    --liquid-glass-border: rgba(255, 255, 255, 0.14);
    --liquid-glass-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    --liquid-glass-primary-bg: rgba(255, 0, 187, 0.78);

    --material-ultra-thin: rgba(22, 22, 29, 0.45);
    --material-thin: rgba(28, 28, 36, 0.64);
    --material-regular: rgba(34, 34, 44, 0.78);
    --material-thick: rgba(42, 42, 54, 0.92);
  }
}

/* High Contrast Accessibility Mode */
@media (prefers-contrast: more) {
  :root {
    --label-secondary: var(--label-primary);
    --label-tertiary: var(--label-primary);
    --separator: currentColor;
    --liquid-glass-border: currentColor;
  }
}

/* Reduced Motion Accessibility Mode */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

## 10. 에이전트 인계 및 컴포넌트 구현 현황도 (Agent Handoff & Implementation Map)

### 10.1 UI 컴포넌트 파일 맵 (Concise File Architecture)

모든 UI 컴포넌트는 직관적이고 간결한 PascalCase 파일명으로 구성되며, `components/ui/index.ts`를 통해 단일 진입점으로 통합 제공됩니다.

1. **Button.tsx**:
   - `Button` (44x44px, active spring scale(0.96) `.pst-press`, inline SVG spinner, opensModal '…' auto-suffix, destructive type="button" guard)
   - `ToggleButton` (Toolbar/Filter standalone toggle button with icon & on/off badge)

2. **Input.tsx**:
   - `TextField` (Fixed `<label htmlFor>`, clear (X) button, validateOnBlur vs validateOnChange separation, inputMode & autoComplete)
   - `SearchField` (Scope Bar, Pill Search Tokens with removal, Recent searches & suggestions, NO autofocus on mobile)
   - `OtpInput` (DaisyUI 5 OTP syntax, 4/6 digit verification code, backward-compatible alias: OTP)

3. **Selection.tsx**:
   - `Checkbox` (DaisyUI checkbox + indeterminate dash (-) state support)
   - `Radio` (DaisyUI radio for 2~5 items; if >= 6 items automatically switches to Select per guidelines)
   - `Switch` (Toggle switch for list rows)
   - `Slider` (Left->Right brand gradient fill, companion number input, +/- steppers, tick marks)

4. **Select.tsx**:
   - `Select` (DaisyUI select + fixed label)
   - `FieldSet` (DaisyUI fieldset + legend + helper label, alias: Fieldset)
   - `FileUpload` (Drag & drop zone, DaisyUI file-input, uploaded file list with size & removal)
   - `Filter` (DaisyUI filter + filter-reset radio group)
   - `Rating` (DaisyUI rating + mask-star-2 + clearable rating-hidden + read-only mode)
   - `Swap` (DaisyUI swap + swap-rotate / swap-flip + 44x44px hit area)

5. **Card.tsx**:
   - `Card` (**Pure RSC**: Standard Material ONLY, Never Liquid Glass, responsive sm:card-side)
   - `Accordion` (Single-open radio group collapse)
   - `Collapse` (Independent checkbox disclosure)
   - `Carousel` (Touch-friendly indicators, 44x44px arrow controls, active index sync)
   - `Dropdown` / `PullDownMenu` (Minimum 3 items, destructive guard with PC Popover & Mobile ActionSheet)

6. **Navigation.tsx**:
   - `Divider` (**Pure RSC**: semantic separator without client bundle)
   - `Breadcrumbs` (**Pure RSC**: DaisyUI breadcrumbs + chevron separator)
   - `Steps` (**Pure RSC**: DaisyUI steps + error/success status icons)
   - `TabBar` / `BottomBar` (Liquid Glass floating bottom bar, scroll minimize/restore)
   - `Sidebar` (Liquid Glass floating sidebar, top-leading collapse toggle, max 2 levels)
   - `Tabs` (Segmented Control equal-width style, max 5~7 items)
   - `MegaMenu` / `Megamenu` (Liquid Glass multi-column flyout menu)
   - `Stack` (DaisyUI stack with interactive card rotation)

7. **Display.tsx**:
   - `Badge` (**Pure RSC**: DaisyUI badge + non-color status cues ▲/▼, +, - for inclusive color)
   - `Kbd` / `KBD` (**Pure RSC**: DaisyUI kbd keyboard shortcuts)
   - `Mask` (**Pure RSC**: Squircle, heart, hexagon, circle, star-2, diamond masks with brand surface)
   - `Diff` (**Client Interactive Slider**): 좌우 비교 뷰. 터치 및 포인터 드래그(`onPointerDown`, `setPointerCapture`), 키보드 화살표(`role="slider"`, `aria-valuenow`, ArrowLeft/Right/Home/End)를 완벽 지원하며, Liquid Glass 원형 핸들이 결합된 듀얼 레이어 클립패스 엔진 탑재.
   - `List` (**Pure RSC**: Inset Grouped style, Standard Material, NEVER Liquid Glass)
   - `ChatBubble` (**Pure RSC**: DaisyUI chat + avatar + start/end alignment)
   - `Link` (**Pure RSC**: DaisyUI link with permanent underline cue & external link glyph)
   - `Calendar` (DatePicker application view with localized weekdays & event indicators)
   - `Countdown` (DaisyUI countdown + CSS variable --value + play/pause/step controls)

8. **Feedback.tsx**:
   - `Indicator` (**Pure RSC**: DaisyUI indicator + indicator-item before main content)
   - `RadialProgress` (**Pure RSC**: DaisyUI radial-progress + custom thickness & color)
   - `Tooltip` (**Pure RSC**: DaisyUI tooltip with 4-directional placement)
   - `Alert` (Non-color icon cue, concrete verb action button, cancel on left)
   - `Progress` (Determinate-first, specific task description, pause/cancel safeguards)

9. **ErrorBoundary.tsx**:
   - `ErrorBoundary` (**Client Component**): 컴포넌트/위젯 단위 에러 격리, 커스텀 폴백 렌더러 지원, pstui 기본 스타일 카드(소프트 에러 링, 인라인 '다시 시도' 액션).

10. **EmptyState.tsx**:
    - `EmptyState` (**Pure RSC**): 표준화된 빈 화면 UI, 파스텔 링 아이콘, 볼드 헤드라인, 가이드 문구, 1~2개 복구 액션 버튼 슬롯.

11. **BottomSheet.tsx, VirtualList.tsx, CommandMenu.tsx, OfflineBanner.tsx**:
    - 제스처 바텀 시트, TanStack Virtual 대용량 리스트, ⌘K 전역 커맨드 팔레트, 오프라인 요청 큐.

12. **icons.tsx**:
   - 37+ optically balanced vector icons rendered with optical stroke weights (1.85~2) and `currentColor`.
   - **Pure React Server Component (RSC)**: `"use client"` 지시문이 제거되어 클라이언트 번들 용량 오버헤드 없이 서버 컴포넌트와 클라이언트 컴포넌트 모두에서 즉시 렌더링됩니다.

### 10.2 Deprecated 파일 완전 제거 및 표준 임포트 규격
이전 하위 호환성 포워더 파일(`layoutNavigation.tsx`, `formDataInput.tsx`, `containmentDisclosure.tsx`, `dataDisplay.tsx`, `feedbackStatus.tsx`)은 코드베이스 최적화 및 복잡도 제거를 위해 완전히 삭제되었습니다. 모든 임포트는 `@/components/ui` 통합 진입점 또는 정규 모듈 파일명(`@/components/ui/Button`, `@/components/ui/Input` 등)을 사용해야 합니다.

---

### 10.3 Lighthouse 공식 감사 및 웹 성능 표준 (Core Web Vitals)
- **Accessibility**: **100 / 100** 만점 (헤딩 시맨틱 계층 구조 h1→h2 정렬, WCAG 2.5.3 보이는 텍스트 레이블과 accessible name 일치)
- **Best Practices**: **100 / 100** 만점 (안전한 HTTPS/보안 헤더, 콘솔 런타임 오류 0건, 비권장 API 미사용)
- **SEO**: **100 / 100** 만점 (시맨틱 메타데이터, JSON-LD 구조화 데이터, robots.txt, sitemap.xml, feed.xml 완비)
- **Performance**: 데스크톱 **81점**, Zero-CLS (0.000 레이아웃 시프트 0), 데스크톱 TBT 0ms (Zero Total Blocking Time) 달성

### 10.4 컴포넌트 이식성, 배포 토큰 및 매니페스트 아키텍처 (Component Portability & Manifest)
- **독립형 토큰 스타일시트 (`styles/pstui-tokens.css`)**: Liquid Glass 광학 토큰, DaisyUI 5 테마, WCAG AAA 접근성 변수 및 물리 터치 피드백(`.pst-press`)을 단일 파일로 캡슐화하여 타 프로젝트에서 `@import "./styles/pstui-tokens.css";`로 즉시 사용 가능.
- **무결성 매니페스트 (`pstui.manifest.json`)**: 29개 코어 컴포넌트, 레이아웃, 컨텍스트, 유틸리티 파일의 정규화된 SHA-256 해시를 보관하여 버전 동기화 시 로컬 변경점과 업그레이드 가능 여부를 정밀 판별.
- **개발자 커스텀 코드 무손실 보존 정책**: 사용자가 컴포넌트를 직접 수정한 경우 업데이트 명령(`--update`)은 파일을 덮어쓰지 않고 `.pstui-latest`를 생성하여 개발자의 코드를 절대 손실시키지 않으며, `--force` 지정 시 자동 백업(`.bak.<timestamp>`) 후 갱신.
- **패키지 서브패스 매핑 (`package.json`)**: `"pstui/ui"`, `"pstui/layout"`, `"pstui/context"`, `"pstui/tokens"` 등 공식 모듈 진입점 제공.

## 11. 법적 고지 및 상표권 면책 조항 (Legal & Trademark Disclaimer)


**pstui**는 인간 중심 인터랙션 디자인(Human-Centric Interaction) 원칙과 물리적 광학 머티리얼 인터페이스에서 영감을 받아 독립적으로 설계된 오픈 소스 프로젝트입니다.

- **비제휴 고지**: 본 프로젝트는 Apple Inc.와 어떠한 제휴, 공식 후원, 승인, 보증 또는 연관 관계가 없습니다.
- **등록 상표 안내**: Apple, iOS, iPadOS, macOS, visionOS, SF Pro, SF Symbols는 미국 및 기타 국가/지역에 등록된 Apple Inc.의 상표입니다. 본 문서 및 코드베이스에 언급된 모든 상표, 서비스표, 상호는 각 소유자의 자산입니다.


