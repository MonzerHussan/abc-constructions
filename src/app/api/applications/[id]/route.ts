import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: { select: { userId: true } } },
    });

    if (!application) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    if (application.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتحديث هذا الطلب" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "حالة الطلب مطلوبة" },
        { status: 400 }
      );
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, companyName: true, role: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الطلب" },
      { status: 500 }
    );
  }
}
