import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { orderIndex: "asc" } },
        instructor: {
          select: { id: true, name: true, avatar: true, companyName: true },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "الدورة التدريبية غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الدورة التدريبية" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "الدورة التدريبية غير موجودة" },
        { status: 404 }
      );
    }

    if (existing.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية لتعديل هذه الدورة" },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};
    const fields = [
      "title", "titleEn", "titleUr", "description", "descriptionEn", "descriptionUr",
      "category", "level", "price", "originalPrice", "thumbnail", "duration",
      "instructorName", "instructorTitle", "tags", "isPublished", "isBestseller", "status",
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (data.price !== undefined) data.price = parseFloat(data.price as string);
    if (data.originalPrice !== undefined) data.originalPrice = parseFloat(data.originalPrice as string) || null;

    const course = await prisma.course.update({
      where: { id },
      data,
      include: {
        lessons: { orderBy: { orderIndex: "asc" } },
        instructor: {
          select: { id: true, name: true, avatar: true, companyName: true },
        },
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الدورة التدريبية" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "الدورة التدريبية غير موجودة" },
        { status: 404 }
      );
    }

    if (existing.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية لحذف هذه الدورة" },
        { status: 403 }
      );
    }

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ message: "تم حذف الدورة التدريبية بنجاح" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الدورة التدريبية" },
      { status: 500 }
    );
  }
}
