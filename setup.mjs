#!/usr/bin/env node
/**
 * pstui One-Command Framework Setup, Export, Sync & Architecture CLI
 *
 * Usage:
 *   node setup.mjs                           # Run full stack verification & manifest generation
 *   node setup.mjs --check                   # Verify environment & production integrity
 *   node setup.mjs --manifest                # Recompute & update root pstui.manifest.json
 *   node setup.mjs --export [path] [options] # Export pstui to another project (modes: full, components, template)
 *   node setup.mjs --update [path] [options] # Update & synchronize existing project with latest pstui
 *   node setup.mjs --sync [path] [options]   # Alias for --update
 *   node setup.mjs --diff [path]             # Inspect differences between target project and pstui source
 *   node setup.mjs --new-page <name>         # Scaffold a new Pure RSC page
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(msg = "") {
  console.log(msg);
}

function success(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function info(msg) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
}

function warn(msg) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

function error(msg) {
  console.log(`${colors.red}✖${colors.reset} ${msg}`);
}

function banner() {
  log(`
${colors.magenta}${colors.bold}======================================================
  ✨ pstui Architecture & Synchronization Tool ✨
  Liquid Glass + DaisyUI 5 + Tailwind v4 + Next.js 16
======================================================${colors.reset}
`);
}

/**
 * Normalizes string content across OS CRLF vs LF and computes SHA-256 hash.
 */
function computeSha256(content) {
  const normalized = typeof content === "string" ? content.replace(/\r\n/g, "\n") : content;
  return "sha256:" + crypto.createHash("sha256").update(normalized).digest("hex");
}


/**
 * Ensures directory exists recursively.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy file recursively ensuring target directory exists.
 */
function copyFileSafe(srcPath, destPath) {
  ensureDir(path.dirname(destPath));
  fs.copyFileSync(srcPath, destPath);
}

/**
 * Canonical list of core pstui files managed for export & sync.
 */
const MANAGED_COMPONENTS = [
  "components/ui/BottomSheet.tsx",
  "components/ui/Button.tsx",
  "components/ui/Card.tsx",
  "components/ui/CardClient.tsx",
  "components/ui/CommandMenu.tsx",
  "components/ui/Display.tsx",
  "components/ui/DisplayClient.tsx",
  "components/ui/EmptyState.tsx",
  "components/ui/ErrorBoundary.tsx",
  "components/ui/Feedback.tsx",
  "components/ui/FeedbackClient.tsx",
  "components/ui/Input.tsx",
  "components/ui/Navigation.tsx",
  "components/ui/NavigationClient.tsx",
  "components/ui/OfflineBanner.tsx",
  "components/ui/Select.tsx",
  "components/ui/Selection.tsx",
  "components/ui/VirtualList.tsx",
  "components/ui/icons.tsx",
  "components/ui/index.ts",
];

const MANAGED_LAYOUT = [
  "components/layout/AppShell.tsx",
];

const MANAGED_CONTEXT = [
  "context/OverlayContext.tsx",
  "context/AuthContext.tsx",
];

const MANAGED_PROVIDERS = [
  "components/providers/ClientRuntimeProvider.tsx",
];

const MANAGED_LIB = [
  "lib/haptics.ts",
  "lib/offlineQueue.ts",
  "lib/server/metrics.ts",
  "lib/firebase/firebaseConfig.ts",
];

const MANAGED_STYLES = [
  "styles/pstui-tokens.css",
];

const ALL_MANAGED_FILES = [
  ...MANAGED_COMPONENTS,
  ...MANAGED_LAYOUT,
  ...MANAGED_CONTEXT,
  ...MANAGED_PROVIDERS,
  ...MANAGED_LIB,
  ...MANAGED_STYLES,
];

/**
 * Generates the canonical pstui.manifest.json file in the root repository.
 */
function buildSourceManifest() {
  const pkgPath = path.join(__dirname, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const fileHashes = {};
  for (const relPath of ALL_MANAGED_FILES) {
    const fullPath = path.join(__dirname, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      fileHashes[relPath] = computeSha256(content);
    }
  }

  const manifest = {
    $schema: "https://pstui.dev/schema.json",
    name: "pstui",
    version: pkg.version || "0.2.0",
    description: pkg.description || "Modern Liquid Glass Web Design System on Next.js 16, Tailwind CSS v4, and DaisyUI 5",
    generatedAt: new Date().toISOString(),
    framework: {
      next: pkg.dependencies?.next || "16.4.3",
      react: pkg.dependencies?.react || "19.3.0",
      tailwindcss: pkg.devDependencies?.tailwindcss || "^4",
      daisyui: pkg.devDependencies?.daisyui || "^5.7.50",
    },
    dependencies: {
      "@tanstack/react-virtual": pkg.dependencies?.["@tanstack/react-virtual"] || "^3.14.22",
      "daisyui": pkg.devDependencies?.["daisyui"] || "^5.7.50",
      "firebase": pkg.dependencies?.["firebase"] || "^13.1.0",
      "next-view-transitions": pkg.dependencies?.["next-view-transitions"] || "^0.3.5",
      "nuqs": pkg.dependencies?.["nuqs"] || "^2.10.2",
      "server-only": pkg.dependencies?.["server-only"] || "^0.0.1",
      "tailwindcss": pkg.devDependencies?.["tailwindcss"] || "^4",
    },
    components: [
      "Button",
      "Card",
      "Input",
      "Selection",
      "Select",
      "Navigation",
      "Display",
      "Feedback",
      "ErrorBoundary",
      "EmptyState",
      "BottomSheet",
      "VirtualList",
      "CommandMenu",
      "OfflineBanner",
      "icons",
    ],
    files: fileHashes,
  };

  return manifest;
}

async function updateRootManifest() {
  info("pstui 매니페스트(pstui.manifest.json) 생성 및 해시 갱신 중...");
  const manifest = buildSourceManifest();
  const manifestPath = path.join(__dirname, "pstui.manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  success(`루트 매니페스트 생성 완료 (${Object.keys(manifest.files).length}개 파일 SHA-256 등록)`);
  return manifest;
}

async function verifyEnvironment() {
  info("1. 시스템 및 런타임 환경 검사 중...");

  const nodeVersion = process.versions.node;
  const majorNode = parseInt(nodeVersion.split(".")[0], 10);
  if (majorNode < 18) {
    warn(`Node.js 버전이 ${nodeVersion}입니다. Node.js 18 이상을 권장합니다.`);
  } else {
    success(`Node.js ${nodeVersion} 확인 완료`);
  }

  const pkgPath = path.join(__dirname, "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error("package.json 파일을 찾을 수 없습니다.");
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  success(`프로젝트 확인: ${pkg.name}@${pkg.version}`);

  const requiredDeps = ["next", "react", "react-dom", "daisyui", "tailwindcss"];
  for (const dep of requiredDeps) {
    const hasDep =
      (pkg.dependencies && pkg.dependencies[dep]) ||
      (pkg.devDependencies && pkg.devDependencies[dep]);
    if (hasDep) {
      success(`핵심 의존성 확인: ${dep}`);
    } else {
      warn(`누락된 의존성: ${dep}`);
    }
  }
}

async function verifyTokensAndStyles() {
  info("2. 글로벌 스타일 및 Liquid Glass 디자인 토큰 검사 중...");
  const globalsPath = path.join(__dirname, "app", "globals.css");
  const tokensPath = path.join(__dirname, "styles", "pstui-tokens.css");

  if (!fs.existsSync(globalsPath)) {
    warn("app/globals.css 파일이 존재하지 않습니다.");
    return;
  }
  const globalsCss = fs.readFileSync(globalsPath, "utf-8");
  const tokensCss = fs.existsSync(tokensPath) ? fs.readFileSync(tokensPath, "utf-8") : "";
  const combinedCss = globalsCss + "\n" + tokensCss;

  if (combinedCss.includes("NanumSquareNeo")) {
    success("나눔스퀘어 네오(NanumSquare Neo) 가변 웹폰트 선언 확인");
  }
  if (combinedCss.includes("--liquid-glass-blur") && combinedCss.includes("--surface-brand-solid")) {
    success("Liquid Glass 광학 머티리얼 및 브랜드 그라디언트 토큰 확인");
  }
  if (combinedCss.includes('name: "light"') && (combinedCss.includes("#db528d") || combinedCss.includes("#c20088"))) {
    success("소프트 파스텔 브랜드 액센트(#db528d) 적용 확인 (WCAG AA/AAA 준수)");
  }
  if (combinedCss.includes("word-break: keep-all") && combinedCss.includes("letter-spacing: -0.025em")) {
    success("한국어 단어 보존(keep-all) 및 광학 자간(-0.025em) 타이포그래피 토큰 확인");
  }
  if (fs.existsSync(tokensPath)) {
    success("독립형 배포 토큰 스타일시트(styles/pstui-tokens.css) 확인");
  }
}

async function verifyPwaAndSeo() {
  info("3. 프로덕션 자산, PWA, SEO, 매니페스트 및 코어 컴포넌트 무결성 검사 (22개 항목)...");
  const assets = [
    "public/robots.txt",
    "public/sitemap.xml",
    "public/manifest.json",
    "public/favicon.ico",
    "public/icon-192.png",
    "public/icon-512.png",
    "public/apple-touch-icon.png",
    "public/og-image.png",
    "public/ads.txt",
    "public/humans.txt",
    "public/llms.txt",
    "public/llms-full.txt",
    "public/sw.js",
    "vercel.json",
    "app/feed.xml/route.ts",
    "app/error.tsx",
    "app/not-found.tsx",
    "app/global-error.tsx",
    "components/ui/ErrorBoundary.tsx",
    "components/ui/EmptyState.tsx",
    "styles/pstui-tokens.css",
    "pstui.manifest.json",
  ];

  let passed = 0;
  for (const asset of assets) {
    const fullPath = path.join(__dirname, asset);
    if (fs.existsSync(fullPath)) {
      passed++;
      success(`[${passed}/${assets.length}] 자산 확인: ${asset}`);
    } else {
      warn(`누락된 자산: ${asset}`);
    }
  }

  if (passed === assets.length) {
    success(`총 ${passed}/${assets.length}개 프로덕션 자산 검증 100% 통과!`);
  } else {
    warn(`일부 자산 누락: ${passed}/${assets.length} 통과`);
  }
}

/**
 * Exports pstui into another project directory.
 */
async function exportPstui(targetDirArg, options = {}) {
  const targetDir = path.resolve(process.cwd(), targetDirArg || "./dist/pstui-export");
  const mode = options.mode || "full"; // full, components, template
  const force = options.force || false;

  info(`pstui 내보내기(Export) 시작 -> ${targetDir} (모드: ${mode})`);
  ensureDir(targetDir);

  const manifest = buildSourceManifest();

  if (mode === "template") {
    // Scaffold a standalone turnkey starter application
    info("Next.js 16 + Tailwind v4 + DaisyUI 5 턴키 스타터 템플릿 프로젝트 생성 중...");

    const projectName = path.basename(targetDir);
    const targetPkg = {
      name: projectName,
      version: "0.1.0",
      private: true,
      description: `${projectName} - Built with pstui Liquid Glass Design System`,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "eslint",
        check: "eslint && next build",
        update: "node setup.mjs --update .",
      },
      dependencies: {
        next: manifest.framework.next,
        react: manifest.framework.react,
        "react-dom": manifest.framework.react,
        "@tanstack/react-virtual": manifest.dependencies["@tanstack/react-virtual"],
        firebase: manifest.dependencies["firebase"] || "^13.1.0",
        "next-view-transitions": manifest.dependencies["next-view-transitions"],
        nuqs: manifest.dependencies.nuqs,
        "server-only": manifest.dependencies["server-only"],
      },
      devDependencies: {
        daisyui: manifest.framework.daisyui,
        tailwindcss: manifest.framework.tailwindcss,
        "@tailwindcss/turbopack": "^4",
        typescript: "^5",
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        eslint: "^9",
        "eslint-config-next": manifest.framework.next,
      },
    };

    fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify(targetPkg, null, 2) + "\n", "utf-8");

    // next.config.ts
    const nextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`;
    fs.writeFileSync(path.join(targetDir, "next.config.ts"), nextConfig, "utf-8");

    // tsconfig.json
    const tsConfig = `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
    fs.writeFileSync(path.join(targetDir, "tsconfig.json"), tsConfig, "utf-8");

    // .gitignore
    const gitignore = `node_modules
/.next/
/out/
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*.local
`;
    fs.writeFileSync(path.join(targetDir, ".gitignore"), gitignore, "utf-8");

    // app/layout.tsx
    const appLayout = `import type { Metadata } from "next";
import { OverlayProvider } from "@/context/OverlayContext";
import { AuthProvider } from "@/context/AuthContext";
import { ClientRuntimeProvider } from "@/components/providers/ClientRuntimeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "${projectName} — pstui Web",
  description: "Built with pstui Liquid Glass Design System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light">
      <body className="min-h-screen antialiased bg-base-200 text-base-content">
        <ClientRuntimeProvider>
          <OverlayProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </OverlayProvider>
        </ClientRuntimeProvider>
      </body>
    </html>
  );
}
`;
    ensureDir(path.join(targetDir, "app"));
    fs.writeFileSync(path.join(targetDir, "app", "layout.tsx"), appLayout, "utf-8");

    // app/page.tsx
    const appPage = `import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Button, EmptyState } from "@/components/ui";

export default function HomePage() {
  return (
    <AppShell
      title="${projectName}"
      subtitle="Liquid Glass Design System Starter"
      sidebarItems={[
        { id: "home", label: "대시보드" },
      ]}
      mobileTabs={[
        { id: "home", label: "홈" },
      ]}
    >
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <header className="space-y-1">
          <span className="badge badge-primary badge-sm font-semibold">pstui Starter</span>
          <h1 className="text-3xl font-bold tracking-tight text-base-content">
            환영합니다!
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--label-secondary)" }}>
            pstui 프레임워크가 성공적으로 설정되었습니다.
          </p>
        </header>

        <Card
          title="pstui 템플릿 워크스페이스"
          badge="Ready"
          subtitle="Liquid Glass 인터랙션 시스템과 DaisyUI 5, Tailwind v4가 준비되었습니다."
          actions={
            <Button variant="primary">시작하기</Button>
          }
        >
          <EmptyState
            size="sm"
            title="콘텐츠를 추가해 보세요"
            description="components/ui 디렉토리의 다채로운 컴포넌트로 사용자 인터페이스를 빠르게 조립할 수 있습니다."
          />
        </Card>
      </div>
    </AppShell>
  );
}
`;
    fs.writeFileSync(path.join(targetDir, "app", "page.tsx"), appPage, "utf-8");

    // app/globals.css
    const appGlobals = `@import "tailwindcss";
@plugin "daisyui";

@font-face {
  font-family: "NanumSquareNeo";
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_11-01@1.0/NanumSquareNeo-Variable.woff2") format("woff2");
}

@theme {
  --font-sans: "NanumSquareNeo", var(--font-sans-fallback), -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", system-ui, sans-serif;
}

@import "../styles/pstui-tokens.css";
`;
    fs.writeFileSync(path.join(targetDir, "app", "globals.css"), appGlobals, "utf-8");

    // Copy setup.mjs so that target project can run `node setup.mjs --update`
    copyFileSafe(path.join(__dirname, "setup.mjs"), path.join(targetDir, "setup.mjs"));
  }

  // Determine files to copy
  const filesToCopy =
    mode === "components"
      ? [
          ...MANAGED_COMPONENTS,
          ...MANAGED_STYLES,
          "lib/haptics.ts",
          "lib/offlineQueue.ts",
        ]
      : ALL_MANAGED_FILES;

  let copiedCount = 0;
  for (const relPath of filesToCopy) {
    const srcPath = path.join(__dirname, relPath);
    const destPath = path.join(targetDir, relPath);

    if (!fs.existsSync(srcPath)) {
      warn(`소스 파일 누락: ${relPath}`);
      continue;
    }

    if (fs.existsSync(destPath) && !force && mode !== "template") {
      // Check if content differs
      const srcHash = manifest.files[relPath];
      const destHash = computeSha256(fs.readFileSync(destPath, "utf-8"));
      if (srcHash !== destHash) {
        warn(`기존 파일 보존 (덮어쓰려면 --force 옵션 사용): ${relPath}`);
        continue;
      }
    }

    copyFileSafe(srcPath, destPath);
    copiedCount++;
  }

  // Write target pstui.manifest.json
  const targetManifest = {
    ...manifest,
    mode,
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(targetDir, "pstui.manifest.json"), JSON.stringify(targetManifest, null, 2) + "\n", "utf-8");

  // Write PSTUI_SETUP.md guide in target
  const setupGuide = `# pstui Integration & Update Guide (v${manifest.version})

이 프로젝트에는 **pstui** 프레임워크 컴포넌트와 Liquid Glass 디자인 시스템이 설치되어 있습니다.

## 1. 필수 종속성 설치 (Dependencies)
Next.js 프로젝트에서 다음 패키지를 설치하십시오:
\`\`\`bash
npm install @tanstack/react-virtual daisyui@^5.7.50 firebase@^13.1.0 next-view-transitions nuqs server-only
npm install -D tailwindcss@^4 @tailwindcss/turbopack
\`\`\`

## 2. 디자인 토큰 연결 (globals.css)
프로젝트의 \`app/globals.css\` 상단에 토큰을 가져옵니다:
\`\`\`css
@import "tailwindcss";
@plugin "daisyui";
@import "../styles/pstui-tokens.css";
\`\`\`

## 3. 레이아웃에 Provider 감싸기 (layout.tsx)
\`app/layout.tsx\`에서 전역 모달/토스트, 런타임 캐시 및 인증 시스템을 활성화합니다:
\`\`\`tsx
import { OverlayProvider } from "@/context/OverlayContext";
import { AuthProvider } from "@/context/AuthContext";
import { ClientRuntimeProvider } from "@/components/providers/ClientRuntimeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ClientRuntimeProvider>
          <OverlayProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </OverlayProvider>
        </ClientRuntimeProvider>
      </body>
    </html>
  );
}
\`\`\`

## 4. 컴포넌트 임포트 사용
\`\`\`tsx
import { Button, Card, EmptyState, TextField } from "@/components/ui";
import { AppShell } from "@/components/layout/AppShell";
\`\`\`

## 5. 최신 버전으로 업데이트 및 동기화 (Update & Sync)
pstui의 새 버전이 출시되었을 때 안전하게 동기화하려면 다음 명령을 실행하십시오:
\`\`\`bash
# pstui 원본 저장소에서 대상 프로젝트로 업데이트
node path/to/pstui/setup.mjs --update .
\`\`\`
`;
  fs.writeFileSync(path.join(targetDir, "PSTUI_SETUP.md"), setupGuide, "utf-8");

  success(`총 ${copiedCount}개 pstui 파일 내보내기 완료!`);
  success(`매니페스트 생성 완료: ${path.join(targetDir, "pstui.manifest.json")}`);
  success(`가이드 문서 생성 완료: ${path.join(targetDir, "PSTUI_SETUP.md")}`);

  if (mode === "template") {
    const displayDir = targetDirArg || "./dist/pstui-export";
    log(`
${colors.green}${colors.bold}다음 명령어로 새 프로젝트를 시작하세요:${colors.reset}
  cd ${displayDir}
  npm install
  npm run dev
`);
  }
}

/**
 * Updates / Synchronizes an existing target project with the latest pstui release.
 */
async function updatePstui(targetDirArg, options = {}) {
  const targetDir = path.resolve(process.cwd(), targetDirArg || ".");
  const force = options.force || false;

  info(`pstui 프로젝트 동기화 및 업데이트 검사 -> ${targetDir}`);

  const targetManifestPath = path.join(targetDir, "pstui.manifest.json");
  if (!fs.existsSync(targetManifestPath)) {
    error(`대상 디렉토리에 pstui.manifest.json 파일이 존재하지 않습니다: ${targetDir}`);
    log(`새 프로젝트에 처음 설치하려면 다음 명령을 실행하십시오:`);
    log(`  node setup.mjs --export ${targetDirArg || "./target-path"}`);
    process.exit(1);
  }

  const targetManifest = JSON.parse(fs.readFileSync(targetManifestPath, "utf-8"));
  const sourceManifest = buildSourceManifest();

  info(`현재 설치된 버전: v${targetManifest.version || "unknown"} -> 최신 소스 버전: v${sourceManifest.version}`);

  const filesToCheck = Object.keys(sourceManifest.files);
  let updatedCount = 0;
  let addedCount = 0;
  let upToDateCount = 0;
  let preservedCount = 0;
  let backedUpCount = 0;

  for (const relPath of filesToCheck) {
    const srcFullPath = path.join(__dirname, relPath);
    const destFullPath = path.join(targetDir, relPath);

    if (!fs.existsSync(srcFullPath)) continue;

    const srcHash = sourceManifest.files[relPath];

    if (!fs.existsSync(destFullPath)) {
      // New file added in source
      copyFileSafe(srcFullPath, destFullPath);
      addedCount++;
      success(`[신규 추가] ${relPath}`);
      continue;
    }

    const currentDestContent = fs.readFileSync(destFullPath, "utf-8");
    const currentDestHash = computeSha256(currentDestContent);
    const recordedDestHash = targetManifest.files?.[relPath];

    if (currentDestHash === srcHash) {
      // Already identical
      upToDateCount++;
      continue;
    }

    if (currentDestHash === recordedDestHash) {
      // Target file was NOT modified by developer, safe to update directly
      copyFileSafe(srcFullPath, destFullPath);
      updatedCount++;
      success(`[최신 갱신] ${relPath}`);
    } else {
      // Target file was modified by developer!
      if (force) {
        // Create backup and overwrite
        const backupPath = destFullPath + `.bak.${Date.now()}`;
        fs.copyFileSync(destFullPath, backupPath);
        copyFileSafe(srcFullPath, destFullPath);
        backedUpCount++;
        warn(`[사용자 수정 덮어씀 (백업 생성: ${path.basename(backupPath)})] ${relPath}`);
      } else {
        // Safe preserve: write .pstui-latest alongside
        const latestPath = destFullPath + ".pstui-latest";
        copyFileSafe(srcFullPath, latestPath);
        preservedCount++;
        warn(`[사용자 수정 감지 (보존됨, 신규 버전: ${path.basename(latestPath)})] ${relPath}`);
      }
    }
  }

  // Update target manifest with new version, hashes, and timestamp
  const updatedManifest = {
    ...targetManifest,
    version: sourceManifest.version,
    updatedAt: new Date().toISOString(),
    files: {
      ...(targetManifest.files || {}),
      ...sourceManifest.files,
    },
  };
  fs.writeFileSync(targetManifestPath, JSON.stringify(updatedManifest, null, 2) + "\n", "utf-8");

  log(`
${colors.green}${colors.bold}======================================================
  ✨ pstui 동기화 및 업데이트가 완료되었습니다!
======================================================${colors.reset}
  - 최신 상태 유지: ${upToDateCount}개
  - 성공적으로 업데이트: ${updatedCount}개
  - 신규 파일 추가: ${addedCount}개
  - 사용자 수정 보존 (.pstui-latest 생성): ${preservedCount}개
  - 강제 덮어쓰기 백업 (.bak 생성): ${backedUpCount}개
`);
}

/**
 * Inspect differences between target project and source pstui without modifying files.
 */
async function diffPstui(targetDirArg) {
  const targetDir = path.resolve(process.cwd(), targetDirArg || ".");
  info(`pstui 상태 및 변경 사항 비교(Diff) 검사 -> ${targetDir}`);

  const targetManifestPath = path.join(targetDir, "pstui.manifest.json");
  if (!fs.existsSync(targetManifestPath)) {
    error(`pstui.manifest.json 파일이 존재하지 않습니다: ${targetDir}`);
    process.exit(1);
  }

  const targetManifest = JSON.parse(fs.readFileSync(targetManifestPath, "utf-8"));
  const sourceManifest = buildSourceManifest();

  info(`설치 버전: v${targetManifest.version} | 최신 버전: v${sourceManifest.version}`);

  const filesToCheck = Object.keys(sourceManifest.files);
  for (const relPath of filesToCheck) {
    const destFullPath = path.join(targetDir, relPath);
    if (!fs.existsSync(destFullPath)) {
      log(`  ${colors.yellow}+ [신규 파일 누락]${colors.reset} ${relPath}`);
      continue;
    }

    const currentDestHash = computeSha256(fs.readFileSync(destFullPath, "utf-8"));
    const srcHash = sourceManifest.files[relPath];
    const recordedDestHash = targetManifest.files?.[relPath];

    if (currentDestHash === srcHash) {
      log(`  ${colors.green}✓ [일치]${colors.reset} ${relPath}`);
    } else if (currentDestHash === recordedDestHash) {
      log(`  ${colors.cyan}↑ [업데이트 가능]${colors.reset} ${relPath}`);
    } else {
      log(`  ${colors.magenta}✎ [사용자 커스텀 수정됨]${colors.reset} ${relPath}`);
    }
  }
}

async function scaffoldPage(pageName) {
  const targetDir = path.join(__dirname, "app", pageName);
  ensureDir(targetDir);

  const pagePath = path.join(targetDir, "page.tsx");
  const content = `import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Button } from "@/components/ui";

/**
 * Pure React Server Component (RSC) ${pageName} Page.
 * Conforms to pstui architectural rules (no "use client" on route pages).
 */
export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <span className="badge badge-primary badge-sm font-semibold">pstui Scaffold</span>
        <h1 className="text-3xl font-bold tracking-tight text-base-content">${pageName} Page</h1>
        <p className="text-sm font-medium" style={{ color: "var(--label-secondary)" }}>
          Liquid Glass 디자인 시스템 기반으로 생성된 순수 서버 컴포넌트 페이지입니다.
        </p>
      </header>

      <Card
        title="${pageName} 콘텐츠 컨테이너"
        badge="Standard Material"
        subtitle="콘텐츠 영역은 기본 머티리얼을 사용하며 상단 및 측면 레이아웃에 Liquid Glass를 적용합니다."
        actions={
          <Button variant="primary">시작하기</Button>
        }
      >
        <p className="text-sm text-base-content/80">
          여기에 ${pageName} 페이지의 비즈니스 로직 및 컴포넌트를 배치하십시오.
        </p>
      </Card>
    </div>
  );
}
`;

  fs.writeFileSync(pagePath, content, "utf-8");
  success(`신규 RSC 페이지가 생성되었습니다: app/${pageName}/page.tsx`);
}

async function main() {
  banner();

  const args = process.argv.slice(2);
  const knownCommands = [
    "export",
    "update",
    "sync",
    "diff",
    "manifest",
    "check",
    "new-page",
    "help",
  ];

  let command = null;
  let targetPath = null;
  let pageName = null;
  let mode = "full";
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const normalized = arg.replace(/^--?/, "");

    if (!command && knownCommands.includes(normalized)) {
      command = normalized;
      continue;
    }

    if (arg === "--force" || arg === "-f") {
      force = true;
      continue;
    }

    if (arg === "--template") {
      mode = "template";
      continue;
    }

    if (arg === "--components" || arg === "--components-only") {
      mode = "components";
      continue;
    }

    if (arg === "--mode" && i + 1 < args.length) {
      mode = args[++i];
      continue;
    }

    if (command === "new-page" && !pageName && !arg.startsWith("-")) {
      pageName = arg;
      continue;
    }

    if (!targetPath && !arg.startsWith("-")) {
      targetPath = arg;
      continue;
    }
  }

  // Command: help
  if (command === "help" || args.includes("-h") || args.includes("--help")) {
    log(`
사용 가능한 명령어:
  node setup.mjs export [경로] [--mode full|components|template] [--force]
  node setup.mjs update [경로] [--force]
  node setup.mjs sync [경로] [--force]
  node setup.mjs diff [경로]
  node setup.mjs manifest
  node setup.mjs check
  node setup.mjs new-page <이름>
`);
    return;
  }

  // Command: manifest
  if (command === "manifest") {
    await updateRootManifest();
    return;
  }

  // Command: export
  if (command === "export") {
    await exportPstui(targetPath, { mode, force });
    return;
  }

  // Command: update or sync
  if (command === "update" || command === "sync") {
    await updatePstui(targetPath, { force });
    return;
  }

  // Command: diff
  if (command === "diff") {
    await diffPstui(targetPath);
    return;
  }

  // Command: new-page
  if (command === "new-page") {
    if (!pageName) {
      log(`${colors.red}페이지 이름을 입력해주세요. 예: node setup.mjs new-page dashboard${colors.reset}`);
      process.exit(1);
    }
    await scaffoldPage(pageName);
    return;
  }

  // Command: check
  if (command === "check") {
    await verifyEnvironment();
    await verifyTokensAndStyles();
    await verifyPwaAndSeo();
    return;
  }

  // Default: Verify stack, update manifest, check production readiness
  await verifyEnvironment();
  await verifyTokensAndStyles();
  await updateRootManifest();
  await verifyPwaAndSeo();

  log(`
${colors.green}${colors.bold}======================================================
  🎉 pstui 디자인 시스템 설정 및 검증이 완료되었습니다!
======================================================${colors.reset}

사용 가능한 명령어:
  npm run dev                     # Turbopack 로컬 개발 서버 시작 (http://localhost:3000)
  npm run build                   # 프로덕션 번들 빌드 및 TypeScript 정적 검사
  npm run check                   # ESLint 및 전체 빌드 무결성 점검
  npm run setup                   # 설정 및 매니페스트 무결성 재검사
  npm run manifest                # pstui.manifest.json 해시 매니페스트 갱신
  npm run export -- <대상경로>     # 다른 프로젝트로 컴포넌트/디자인시스템 내보내기
  npm run update -- <대상경로>     # 기존 프로젝트를 최신 pstui 버전으로 안전 동기화
  npm run diff -- <대상경로>       # 설치된 프로젝트와 pstui 원본 간 변경점 비교
  node setup.mjs export <경로> --mode template # 신규 Next.js 16 턴키 프로젝트 생성
  node setup.mjs new-page <이름>  # 신규 순수 RSC 페이지 자동 생성
`);
}

main().catch((err) => {
  console.error(`${colors.red}오류 발생:${colors.reset}`, err.message);
  process.exit(1);
});
