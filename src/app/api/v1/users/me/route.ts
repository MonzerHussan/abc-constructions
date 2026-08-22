import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";
import { withAuth } from "@/lib/auth-guard";
import { z } from "zod";

const updateMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional(),
  companyName: z.string().max(200).optional(),
  companyType: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  bio: z.string().max(2000).optional(),
  avatar: z.string().url().optional(),
  companyLogo: z.string().url().optional(),
  location: z.string().max(500).optional(),
});

export const GET = withAuth(async (_request: NextRequest, { sessionUserId }) => {
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      companyName: true,
      companyType: true,
      companyLogo: true,
      country: true,
      city: true,
      address: true,
      bio: true,
      avatar: true,
      location: true,
      roleConfirmed: true,
    },
  });

  if (!user) {
    return NextResponse.json(error(ErrorCodes.NOT_FOUND, "User not found"), { status: 404 });
  }

  return NextResponse.json(success(user));
});

export const PATCH = withAuth(async (request: NextRequest, { sessionUserId }) => {
  const body = await request.json().catch(() => ({}));
  const parsed = updateMeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ErrorCodes.VALIDATION_ERROR, parsed.error.issues[0]?.message ?? "Invalid input"),
      { status: 422 },
    );
  }

  const user = await prisma.user.update({
    where: { id: sessionUserId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      companyName: true,
      companyType: true,
      companyLogo: true,
      country: true,
      city: true,
      address: true,
      bio: true,
      avatar: true,
      location: true,
    },
  });

  return NextResponse.json(success(user));
});
