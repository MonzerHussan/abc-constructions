import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { success, error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";
import { rateLimit } from "@/lib/rate-limit";
import {
  contactVerificationRateLimitKey,
  sendContactVerificationCode,
  SEND_LIMIT,
  SEND_WINDOW_MS,
} from "@/lib/contact-verification";

export const POST = withAuth(async (request: NextRequest, { sessionUserId }) => {
  const rl = rateLimit({
    key: contactVerificationRateLimitKey(sessionUserId, "phone"),
    limit: SEND_LIMIT,
    windowMs: SEND_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      error(ErrorCodes.RATE_LIMIT_EXCEEDED, "Too many requests. Try again later."),
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const result = await sendContactVerificationCode(sessionUserId, "phone");
  if (!result.ok) {
    return NextResponse.json(error(ErrorCodes.VALIDATION_ERROR, result.error), {
      status: result.status ?? 400,
    });
  }

  return NextResponse.json(
    success({
      message: "Verification code sent to your phone",
      devCode: result.devCode,
    }),
  );
});
