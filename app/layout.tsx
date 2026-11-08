import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { OverlayProvider } from "@/context/OverlayContext";
import { AuthProvider } from "@/context/AuthContext";
import { ClientRuntimeProvider } from "@/components/providers/ClientRuntimeProvider";

const fontSansFallback = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-fallback",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://atrc.hyeona3.com";
const SITE_TITLE =
  "Event Horizon — 실시간 AI 시그널 · 특이점 관측소";
const SITE_DESCRIPTION =
  "실시간 글로벌 AI 시그널 자동 수집·온디바이스 LLM 요약, 주요 인물 X 타임라인 모아보기, Seed RSI·AGI·ASI 도달 예측 시계 및 거시 전환 지표를 통합 관측합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Event Horizon",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Event Horizon",
  authors: [{ name: "Event Horizon Observatory", url: SITE_URL }],
  generator: "Next.js 16",
  keywords: [
    "Event Horizon",
    "이벤트 호라이즌",
    "특이점 트래커",
    "AGI 시계",
    "Seed RSI",
    "ASI",
    "AI 시그널",
    "온디바이스 LLM",
    "프론티어 모델",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
      "application/atom+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Event Horizon",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Event Horizon — 실시간 AI 시그널 · 특이점 관측소",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Event Horizon",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#09070e" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Event Horizon",
      description: SITE_DESCRIPTION,
      inLanguage: "ko-KR",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Event Horizon Observatory",
      applicationCategory: "NewsApplication",
      operatingSystem: "Web, iOS, Android, Windows, macOS",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
    },
  ],
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme="light"
      className={`${fontSansFallback.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/fonts-archive/NanumSquareNeo/NanumSquareNeo.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh flex flex-col selection:bg-primary/20 selection:text-primary">
        <Suspense fallback={null}>
          <ViewTransitions>
            <ClientRuntimeProvider>
              <NuqsAdapter>
                <OverlayProvider>
                  <AuthProvider>
                    <Suspense fallback={null}>{children}</Suspense>
                    <Suspense fallback={null}>{modal}</Suspense>
                  </AuthProvider>
                </OverlayProvider>
              </NuqsAdapter>
            </ClientRuntimeProvider>
          </ViewTransitions>
        </Suspense>
      </body>
    </html>
  );
}
