import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        rfq: {
          select: { id: true, title: true, referenceNumber: true, deadlineDate: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true, email: true },
        },
        items: true,
        awards: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "عرض السعر غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب عرض السعر" },
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

    const existing = await prisma.quotation.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "عرض السعر غير موجود" },
        { status: 404 }
      );
    }

    if (existing.supplierId !== session.user.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل عرض السعر هذا" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, coverLetter, deliveryTime, validUntil, totalAmount, taxAmount, grandTotal, notes } = body;

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(coverLetter !== undefined && { coverLetter }),
        ...(deliveryTime !== undefined && { deliveryTime }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(taxAmount !== undefined && { taxAmount }),
        ...(grandTotal !== undefined && { grandTotal }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        rfq: {
          select: { id: true, title: true, referenceNumber: true },
        },
        items: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث عرض السعر" },
      { status: 500 }
    );
  }
}
