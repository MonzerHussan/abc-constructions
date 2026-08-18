import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { selfRegisterSchema } from "@/modules/core/validators/user-schemas";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const REGISTER_LIMIT = 10
const REGISTER_WINDOW_MS = 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rl = rateLimit({ key: `register:${ip}`, limit: REGISTER_LIMIT, windowMs: REGISTER_WINDOW_MS })
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many registration attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = selfRegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password, name, phone, role, companyName } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        companyName,
        roleConfirmed: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code: string }).code
        : "UNKNOWN";

    if (code === "P2002") {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }
    if (code === "P2021" || code === "P2022") {
      return NextResponse.json(
        { error: "DB schema not migrated. Run: npx prisma migrate deploy", code },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب", code },
      { status: 500 },
    );
  }
}
