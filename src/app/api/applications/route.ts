import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const jobId = searchParams.get("jobId");

    let where: Record<string, unknown> = {};

    if (userId) {
      if (userId !== session.user.id) {
        return NextResponse.json(
          { error: "غير مصرح لك بمشاهدة هذه الطلبات" },
          { status: 403 }
        );
      }
      where.userId = userId;
    } else if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { userId: true },
      });

      if (!job) {
        return NextResponse.json(
          { error: "الوظيفة غير موجودة" },
          { status: 404 }
        );
      }

      if (job.userId !== session.user.id) {
        return NextResponse.json(
          { error: "غير مصرح لك بمشاهدة طلبات هذه الوظيفة" },
          { status: 403 }
        );
      }

      where.jobId = jobId;
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, companyName: true, role: true, avatar: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الطلبات" },
      { status: 500 }
    );
  }
}
