-- AlterTable: roleConfirmed for Google OAuth account-type gating
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- Email/password registrations are already confirmed at signup
UPDATE "User" SET "roleConfirmed" = true WHERE "password" IS NOT NULL;

-- OAuth users who already completed entity-registry onboarding
UPDATE "User" u
SET "roleConfirmed" = true
WHERE u."password" IS NULL
  AND EXISTS (
    SELECT 1 FROM "Profile" p WHERE p."userId" = u."id"
  );
