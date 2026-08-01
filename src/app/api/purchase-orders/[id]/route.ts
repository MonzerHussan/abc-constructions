import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, name: true, companyName: true, email: true },
        },
        project: {
          select: { id: true, title: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        rfq: {
          select: { id: true, title: true, referenceNumber: true },
        },
        quotation: {
          select: { id: true, referenceNumber: true },
        },
        award: {
          select: { id: true, notes: true },
        },
        items: {
          include: {
            goodsReceipts: true,
          },
        },
        goodsReceipts: {
          include: {
            receivedBy: {
              select: { id: true, name: true },
            },
          },
        },
        invoices: true,
        payments: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "أمر الشراء غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب أمر الشراء" },
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

    const existing = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "أمر الشراء غير موجود" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status,
      expectedDelivery,
      deliveryDate,
      deliveryAddress,
      deliveryInstructions,
      paymentTerms,
      notes,
    } = body;

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(expectedDelivery !== undefined && { expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null }),
        ...(deliveryDate !== undefined && { deliveryDate: deliveryDate ? new Date(deliveryDate) : null }),
        ...(deliveryAddress !== undefined && { deliveryAddress }),
        ...(deliveryInstructions !== undefined && { deliveryInstructions }),
        ...(paymentTerms !== undefined && { paymentTerms }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        items: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث أمر الشراء" },
      { status: 500 }
    );
  }
}
