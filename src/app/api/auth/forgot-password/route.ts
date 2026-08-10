import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const REQUEST_LIMIT = 5
const REQUEST_WINDOW_MS = 60 * 60 * 1000
const TOKEN_TTL_MS = 60 * 60 * 1000
const RESET_BASE_URL = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rl = rateLimit({ key: `forgot-password:${ip}`, limit: REQUEST_LIMIT, windowMs: REQUEST_WINDOW_MS })
    if (!rl.ok) {
      return NextResponse.json(
        { message: "عدد كبير من المحاولات، حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // ابحث عن المستخدم — سواء وُجد أم لا نُفذ نفس المسار لنمنع كشف الحسابات (user enumeration)
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "إذا كان البريد الإلكتروني مسجلاً، ستصل رسالة إعادة التعيين" },
        { status: 200 }
      )
    }

    // إبطال أي توكنات سابقة غير مستخدمة للمستخدم
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    })

    const token = crypto.randomBytes(32).toString("hex")
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })

    const resetUrl = `${RESET_BASE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`

    // HTTPS NOTES:
    //   - في بيئة إنتاج يجب إرسال resetUrl عبر البريد الإلكتروني.
    //   - يُرجع resetUrl هنا فقط لبيئة التطوير/الاختبار حتى يتم تفعيل مزود بريد فعلي.
    const isProd = process.env.NODE_ENV === "production"
    const payload: Record<string, unknown> = {
      message: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني",
    }
    if (!isProd) {
      payload.resetUrl = resetUrl
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error: unknown) {
    console.error("Forgot-password error:", error)

    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code: string }).code
        : "UNKNOWN"

    if (code === "P2021" || code === "P2022") {
      return NextResponse.json(
        { message: "DB schema not migrated. Run: npx prisma migrate deploy", code },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 },
    )
  }
}