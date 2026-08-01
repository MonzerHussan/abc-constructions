import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json(
        { error: "الدورة التدريبية غير موجودة" },
        { status: 404 }
      );
    }

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "أنت مسجل بالفعل في هذه الدورة" },
        { status: 409 }
      );
    }

    const [enrollment] = await Promise.all([
      prisma.courseEnrollment.create({
        data: { userId, courseId: id },
      }),
      prisma.course.update({
        where: { id },
        data: { studentsCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التسجيل في الدورة" },
      { status: 500 }
    );
  }
}
