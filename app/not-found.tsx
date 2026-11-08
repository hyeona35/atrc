import Link from "next/link";
import { IconCompass } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-base-200">
      <div className="liquid-glass max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/14 text-primary border border-primary/25">
          <IconCompass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="badge badge-sm badge-neutral font-semibold">
            404 Not Found
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">
            페이지를 찾을 수 없습니다
          </h1>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "var(--label-secondary)" }}
          >
            요청하신 경로가 존재하지 않거나 다른 화면으로 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="btn btn-primary w-full rounded-2xl pst-press font-bold shadow-md"
          >
            관측 요약 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
