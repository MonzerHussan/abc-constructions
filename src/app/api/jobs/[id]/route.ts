import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, companyName: true, role: true, avatar: true },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "الوظيفة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الوظيفة" },
      { status: 500 }
    );
  }
}

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

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json(
        { error: "الوظيفة غير موجودة" },
        { status: 404 }
      );
    }

    if (job.userId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل هذه الوظيفة" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      jobType,
      salaryMin,
      salaryMax,
      location,
      requirements,
      benefits,
      vacancies,
      isUrgent,
      isActive,
    } = body;

    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(jobType !== undefined && { jobType }),
        ...(salaryMin !== undefined && { salaryMin: salaryMin ? parseFloat(salaryMin) : null }),
        ...(salaryMax !== undefined && { salaryMax: salaryMax ? parseFloat(salaryMax) : null }),
        ...(location !== undefined && { location }),
        ...(requirements !== undefined && { requirements }),
        ...(benefits !== undefined && { benefits }),
        ...(vacancies !== undefined && { vacancies: parseInt(vacancies) }),
        ...(isUrgent !== undefined && { isUrgent }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, companyName: true, role: true, avatar: true },
        },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الوظيفة" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (job.userId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بحذف هذه الوظيفة" },
        { status: 403 }
      );
    }

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ message: "تم حذف الوظيفة بنجاح" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الوظيفة" },
      { status: 500 }
    );
  }
}
