import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "رابط إعادة التعيين مطلوب"),
  newPassword: z.string().min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل").max(128),
});

const RESET_LIMIT = 5
const RESET_WINDOW_MS = 60 * 60 * 1000

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rl = rateLimit({ key: `reset-password:${ip}`, limit: RESET_LIMIT, windowMs: RESET_WINDOW_MS })
    if (!rl.ok) {
      return NextResponse.json(
        { message: "عدد كبير من المحاولات، حاول لاحقاً" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة"
      return NextResponse.json({ message }, { status: 400 })
    }

    const { newPassword, token } = parsed.data

    const tokenHash = hashToken(token)
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    })

    if (!resetToken || resetToken.usedAt) {
      return NextResponse.json({ message: "رابط إعادة التعيين غير صالح أو مستخدم" }, { status: 400 })
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ message: "انتهت صلاحية رابط إعادة التعيين" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json(
      { message: "تم تحديث كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن" },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Reset-password error:", error)

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