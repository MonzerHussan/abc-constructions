import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { success, error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";
import { getContactVerificationStatus } from "@/lib/contact-verification";

export const GET = withAuth(async (_request: NextRequest, { sessionUserId }) => {
  const status = await getContactVerificationStatus(sessionUserId);
  if (!status) {
    return NextResponse.json(error(ErrorCodes.NOT_FOUND, "User not found"), { status: 404 });
  }
  return NextResponse.json(success(status));
});
