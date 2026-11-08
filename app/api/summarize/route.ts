import { NextResponse } from "next/server";
import { summarizeTextServerSide } from "@/lib/server/liveIntel";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string; text?: string };
    const title = String(body.title ?? "").slice(0, 300);
    const text = String(body.text ?? "").slice(0, 2400);

    if (!title && !text) {
      return NextResponse.json(
        { error: "요약할 원문이 비어 있습니다." },
        { status: 400 }
      );
    }

    const result = await summarizeTextServerSide(title, text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "요약 요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
