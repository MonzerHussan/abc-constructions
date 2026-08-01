import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, companyName: true },
        },
        project: true,
        purchaseRequest: true,
        items: true,
        suppliers: {
          include: {
            supplier: {
              select: { id: true, name: true, companyName: true, email: true },
            },
          },
        },
        quotations: {
          include: {
            supplier: {
              select: { id: true, name: true, companyName: true },
            },
            items: true,
          },
        },
        evaluations: {
          include: {
            evaluator: {
              select: { id: true, name: true },
            },
          },
        },
        awards: {
          include: {
            supplier: {
              select: { id: true, name: true, companyName: true },
            },
            quotation: true,
          },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: "طلب العرض غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.error("Error fetching RFQ:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب طلب العرض" },
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

    const existing = await prisma.rFQ.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "طلب العرض غير موجود" },
        { status: 404 }
      );
    }

    if (existing.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل طلب العرض هذا" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      referenceNumber,
      projectId,
      issueDate,
      deadlineDate,
      deliveryDate,
      deliveryLocation,
      termsAndConditions,
      attachments,
    } = body;

    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(referenceNumber !== undefined && { referenceNumber }),
        ...(projectId !== undefined && { projectId }),
        ...(issueDate !== undefined && { issueDate: issueDate ? new Date(issueDate) : null }),
        ...(deadlineDate !== undefined && { deadlineDate: new Date(deadlineDate) }),
        ...(deliveryDate !== undefined && { deliveryDate: deliveryDate ? new Date(deliveryDate) : null }),
        ...(deliveryLocation !== undefined && { deliveryLocation }),
        ...(termsAndConditions !== undefined && { termsAndConditions }),
        ...(attachments !== undefined && { attachments }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, companyName: true },
        },
        items: true,
        suppliers: {
          include: {
            supplier: {
              select: { id: true, name: true, companyName: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating RFQ:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث طلب العرض" },
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

    const existing = await prisma.rFQ.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "طلب العرض غير موجود" },
        { status: 404 }
      );
    }

    if (existing.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بحذف طلب العرض هذا" },
        { status: 403 }
      );
    }

    await prisma.rFQ.delete({ where: { id } });

    return NextResponse.json({ message: "تم حذف طلب العرض بنجاح" });
  } catch (error) {
    console.error("Error deleting RFQ:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف طلب العرض" },
      { status: 500 }
    );
  }
}
