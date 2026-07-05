import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const adminId = process.env.ADMIN_ID;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminId || !adminPasswordHash) {
    return NextResponse.json(
      { error: "サーバー設定エラーです" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const idMatches = id === adminId;
  const passwordMatches = await bcrypt.compare(password, adminPasswordHash);

  if (!idMatches || !passwordMatches) {
    return NextResponse.json(
      { error: "IDまたはパスワードが正しくありません" },
      { status: 401 },
    );
  }

  await createSessionCookie();
  return NextResponse.json({ ok: true });
}
