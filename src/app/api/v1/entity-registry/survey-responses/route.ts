import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { entityRegistryService } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { z } from 'zod';

const createSurveyResponseSchema = z.object({
  surveyId: z.string().min(1, 'surveyId is required'),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.string().optional().nullable(),
      values: z.array(z.string()).optional(),
      valueNumber: z.number().optional().nullable(),
      valueJson: z.record(z.string(), z.unknown()).optional().nullable(),
      timeSpent: z.number().optional().nullable(),
    }),
  ),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timeStarted: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createSurveyResponseSchema.safeParse(body);
    if (!parsed.success) {
      const details: Record<string, unknown> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.');
        details[path] = issue.message;
      }
      return Response.json(error(ErrorCodes.VALIDATION_ERROR, 'Validation failed', details), { status: 422 });
    }

    const survey = await prisma.survey.findUnique({ where: { id: parsed.data.surveyId } });
    if (!survey) return Response.json(error(ErrorCodes.NOT_FOUND, 'Survey not found'), { status: 404 });

    const response = await prisma.surveyResponse.create({
      data: {
        campaignId: survey.campaignId,
        surveyId: parsed.data.surveyId,
        linkedUserId: session.user.id,
        status: 'COMPLETED',
        isComplete: true,
        source: 'onboarding',
        timeStarted: parsed.data.timeStarted ? new Date(parsed.data.timeStarted) : undefined,
        timeCompleted: new Date(),
        duration: parsed.data.timeStarted
          ? Math.floor((Date.now() - new Date(parsed.data.timeStarted).getTime()) / 1000)
          : undefined,
        metadata: (parsed.data.metadata as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
        answers: {
          create: parsed.data.answers.map((a) => ({
            questionId: a.questionId,
            value: a.value ?? null,
            values: a.values ?? [],
            valueNumber: a.valueNumber ?? null,
            valueJson: (a.valueJson as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
            timeSpent: a.timeSpent ?? null,
          })),
        },
      },
      include: { answers: true },
    });

    // Bridge: try to link the user's entity (if one exists) — non-fatal on failure
    try {
      const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } });
      if (profile) {
        await entityRegistryService.createInteraction({
          entityId: profile.entityId,
          type: 'SURVEY',
          channel: 'PLATFORM',
          owner: 'onboarding',
          outcome: `Completed survey ${survey.id}`,
        });
      }
    } catch {
      // non-blocking: survey response is the primary write
    }

    return Response.json(success({ id: response.id, status: response.status, surveyId: response.surveyId }), { status: 201 });
  } catch (err) {
    logger.error('submit-survey-response failed', { error: err instanceof Error ? err.message : String(err) });
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to submit survey response'), { status: 500 });
  }
}
