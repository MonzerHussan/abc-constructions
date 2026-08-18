import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { UserRole } from "@/generated/prisma/client";
import { isSelfRegistrationRole } from "@/lib/auth/role-selection";

const setRoleSchema = z.object({
  role: z.nativeEnum(UserRole).refine((r) => isSelfRegistrationRole(r), {
    message: "Invalid role for self-registration",
  }),
  companyName: z.string().min(2).max(200),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(30).optional(),
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }) => {
  try {
    const body = await request.json();
    const parsed = setRoleSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { role, companyName, name, phone } = parsed.data;

    const user = await prisma.user.update({
      where: { id: sessionUserId },
      data: {
        role,
        companyName,
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        roleConfirmed: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        roleConfirmed: true,
        phone: true,
      },
    });

    return NextResponse.json({ message: "تم تحديث نوع الحساب", user });
  } catch (error) {
    console.error("set-role error:", error);
    return NextResponse.json({ error: "تعذر تحديث نوع الحساب" }, { status: 500 });
  }
});
