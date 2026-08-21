import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  PLATFORM_STAFF_ROLES,
  isSuperAdminRole,
} from "@/lib/auth/platform-admin";
import { UserRole } from "@/generated/prisma/client";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id)
    return { error: "Unauthorized", status: 401 } as const;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isSuperAdminRole(user.role))
    return { error: "Forbidden", status: 403 } as const;
  return { user };
}

const CREATABLE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.CONTENT_ADMIN,
  UserRole.FINANCE_ADMIN,
];

export async function GET() {
  const guard = await requireSuperAdmin();
  if ("error" in guard)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  const staff = await prisma.user.findMany({
    where: { role: { in: [...PLATFORM_STAFF_ROLES] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ staff });
}

export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if ("error" in guard)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role;

  if (!name || !email || !password)
    return NextResponse.json({ error: "name, email, password required" }, { status: 400 });
  if (!CREATABLE_ROLES.includes(role as UserRole))
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "email already registered" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role as UserRole,
      isActive: true,
      roleConfirmed: true,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      userId: guard.user.id,
      details: { role: user.role, email: user.email },
    },
  });

  return NextResponse.json({ staff: user }, { status: 201 });
}