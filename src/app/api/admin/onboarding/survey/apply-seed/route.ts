import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  applyAllSurveySeeds,
  applySurveySeed,
} from "@/modules/onboarding-survey/seed/apply-survey-seed";
import { reseedAllSurveyTemplates } from "@/modules/onboarding-survey/seed/seed-templates";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 } as const;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { user };
}

/** POST /api/admin/onboarding/survey/apply-seed — merges survey seed JSON deltas */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));
  const reseedFirst = body.reseedFirst !== false;

  if (reseedFirst) {
    await reseedAllSurveyTemplates();
  }

  if (body.all === true) {
    const results = await applyAllSurveySeeds();
    return NextResponse.json({ ok: true, reseedFirst, results });
  }

  const result = await applySurveySeed(body.path);
  return NextResponse.json({ ok: true, reseedFirst, ...result });
}
