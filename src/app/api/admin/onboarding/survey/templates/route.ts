import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onboardingSurveyService } from '@/modules/onboarding-survey';
import { ensureOnboardingSurveyTemplatesSeeded } from '@/modules/onboarding-survey/seed/seed-templates';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized', status: 401 } as const;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return { error: 'Forbidden', status: 403 } as const;
  }
  return { user };
}

export async function GET() {
  const guard = await requireAdmin();
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  await ensureOnboardingSurveyTemplatesSeeded();
  const templates = await onboardingSurveyService.listTemplatesForAdmin();
  return NextResponse.json(templates);
}
