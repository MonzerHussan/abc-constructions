import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const { progress, completedLessons } = await request.json();

    if (progress === undefined || completedLessons === undefined) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "التسجيل غير موجود" },
        { status: 404 }
      );
    }

    if (enrollment.userId !== userId) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية لتحديث هذا التسجيل" },
        { status: 403 }
      );
    }

    const isCompleted = progress >= 100;
    const completedAt = isCompleted ? new Date() : null;

    const updated = await prisma.courseEnrollment.update({
      where: { id },
      data: {
        progress,
        completedLessons,
        isCompleted,
        completedAt,
      },
    });

    if (isCompleted && !enrollment.isCompleted) {
      const existingCert = await prisma.certificate.findUnique({
        where: { enrollmentId: id },
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            title: `شهادة إتمام - ${enrollment.course.title}`,
            userId,
            courseId: enrollment.courseId,
            enrollmentId: id,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث التقدم" },
      { status: 500 }
    );
  }
}
