import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onboardingSurveyService } from '@/modules/onboarding-survey';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized', status: 401 } as const;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return { error: 'Forbidden', status: 403 } as const;
  }
  return { user };
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const sectionId = body.sectionId as string;
  if (!sectionId) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
  }

  const section = await prisma.onboardingSurveySection.findUnique({ where: { id: sectionId } });
  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  const row = await onboardingSurveyService.upsertSectionContent(sectionId, {
    titleEn: body.titleEn ?? null,
    titleAr: body.titleAr ?? null,
    titleUr: body.titleUr ?? null,
    bodyEn: body.bodyEn ?? null,
    bodyAr: body.bodyAr ?? null,
    bodyUr: body.bodyUr ?? null,
    imageUrl: body.imageUrl ?? null,
    videoUrl: body.videoUrl ?? null,
    posterUrl: body.posterUrl ?? null,
    linkUrl: body.linkUrl ?? null,
    isActive: body.isActive ?? true,
  });

  return NextResponse.json(row);
}
