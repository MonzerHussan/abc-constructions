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

    const rfq = await prisma.rFQ.findUnique({ where: { id } });

    if (!rfq) {
      return NextResponse.json(
        { error: "طلب العرض غير موجود" },
        { status: 404 }
      );
    }

    if (rfq.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بإرسال طلب العرض هذا" },
        { status: 403 }
      );
    }

    if (rfq.status !== "DRAFT") {
      return NextResponse.json(
        { error: "يمكن إرسال طلبات العروض ذات الحالة مسودة فقط" },
        { status: 400 }
      );
    }

    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        status: "SENT",
        issueDate: new Date(),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, companyName: true },
        },
        items: true,
        _count: {
          select: { quotations: true, suppliers: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error sending RFQ:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال طلب العرض" },
      { status: 500 }
    );
  }
}
