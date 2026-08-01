import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true, email: true },
        },
        items: true,
        payments: {
          include: {
            paidBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "الفاتورة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الفاتورة" },
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

    const existing = await prisma.invoice.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "الفاتورة غير موجودة" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === "VERIFIED") {
      updateData.verifiedAt = new Date();
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        items: true,
        payments: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الفاتورة" },
      { status: 500 }
    );
  }
}
