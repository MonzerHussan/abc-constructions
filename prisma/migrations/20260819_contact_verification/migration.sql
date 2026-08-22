-- Contact verification (email + phone OTP before document upload)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerified" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "ContactVerificationCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactVerificationCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContactVerificationCode_userId_channel_idx" ON "ContactVerificationCode"("userId", "channel");
CREATE INDEX IF NOT EXISTS "ContactVerificationCode_expiresAt_idx" ON "ContactVerificationCode"("expiresAt");

DO $$ BEGIN
  ALTER TABLE "ContactVerificationCode" ADD CONSTRAINT "ContactVerificationCode_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
