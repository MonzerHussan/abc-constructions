import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reseedAllSurveyTemplates, reseedSurveyTemplate } from '@/modules/onboarding-survey/seed/seed-templates';
import { isPlatformAccountType } from '@/lib/account-types';
import type { PlatformAccountType } from '@/lib/account-types';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized', status: 401 } as const;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return { error: 'Forbidden', status: 403 } as const;
  }
  return { user };
}

/** POST /api/admin/onboarding/survey/reseed — body: { accountType?: string } */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));
  const accountType = body.accountType as string | undefined;

  if (accountType) {
    if (!isPlatformAccountType(accountType)) {
      return NextResponse.json({ error: 'Invalid accountType' }, { status: 400 });
    }
    await reseedSurveyTemplate(accountType as PlatformAccountType);
    return NextResponse.json({ ok: true, reseeded: accountType });
  }

  await reseedAllSurveyTemplates();
  return NextResponse.json({ ok: true, reseeded: 'all' });
}
