import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const purchaseOrderId = searchParams.get("purchaseOrderId") || "";
    const supplierId = searchParams.get("supplierId") || "";

    const where: Record<string, unknown> = {};

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const items = await prisma.goodsReceipt.findMany({
      where,
      include: {
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        receivedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching goods receipts:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب إيصالات الاستلام" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiptNumber, purchaseOrderId, poItemId, supplierId, notes, receivedDate } = body;

    if (!receiptNumber || !purchaseOrderId || !supplierId) {
      return NextResponse.json(
        { error: "رقم الإيصال ومعرف أمر الشراء ومعرف المورد مطلوبة" },
        { status: 400 }
      );
    }

    const goodsReceipt = await prisma.goodsReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId,
        poItemId,
        supplierId,
        receivedById: session.user.id,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        notes,
      },
      include: {
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        receivedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(goodsReceipt, { status: 201 });
  } catch (error) {
    console.error("Error creating goods receipt:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء إيصال الاستلام" },
      { status: 500 }
    );
  }
}
