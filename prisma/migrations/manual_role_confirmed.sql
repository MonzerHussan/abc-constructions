-- Add roleConfirmed for Google OAuth gating
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- Existing password users are treated as confirmed
UPDATE "User" SET "roleConfirmed" = true WHERE "password" IS NOT NULL;
