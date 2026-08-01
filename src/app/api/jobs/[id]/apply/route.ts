import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json(
        { error: "الوظيفة غير موجودة" },
        { status: 404 }
      );
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: "هذه الوظيفة غير متاحة حالياً" },
        { status: 400 }
      );
    }

    const existing = await prisma.jobApplication.findFirst({
      where: { userId: session.user.id, jobId: id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "لقد تقدمت لهذه الوظيفة مسبقاً" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { coverLetter, cv } = body;

    const application = await prisma.jobApplication.create({
      data: {
        coverLetter,
        cv,
        userId: session.user.id,
        jobId: id,
      },
      include: {
        job: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error applying to job:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التقديم على الوظيفة" },
      { status: 500 }
    );
  }
}
