import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth-guard";
import { success, error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";
import { confirmContactVerificationCode } from "@/lib/contact-verification";

const schema = z.object({
  code: z.string().min(4).max(8),
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }) => {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ErrorCodes.VALIDATION_ERROR, parsed.error.issues[0]?.message ?? "Invalid input"),
      { status: 422 },
    );
  }

  const result = await confirmContactVerificationCode(
    sessionUserId,
    "email",
    parsed.data.code,
  );
  if (!result.ok) {
    return NextResponse.json(error(ErrorCodes.VALIDATION_ERROR, result.error), {
      status: result.status ?? 400,
    });
  }

  return NextResponse.json(success({ message: "Email verified", emailVerified: true }));
});
