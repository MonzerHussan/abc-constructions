-- Platform staff roles for scoped admin access (content / finance managers)

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CONTENT_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FINANCE_ADMIN';
