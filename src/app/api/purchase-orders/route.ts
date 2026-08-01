import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const supplierId = searchParams.get("supplierId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, name: true, companyName: true },
          },
          project: {
            select: { id: true, title: true },
          },
          items: true,
          _count: {
            select: {
              goodsReceipts: true,
              invoices: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب أوامر الشراء" },
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
    const {
      poNumber,
      awardId,
      rfqId,
      quotationId,
      projectId,
      supplierId,
      organizationId,
      expectedDelivery,
      deliveryAddress,
      deliveryInstructions,
      paymentTerms,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      items,
    } = body;

    if (!poNumber || !supplierId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "رقم الأمر ومعرف المورد والعناصر مطلوبة" },
        { status: 400 }
      );
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        awardId,
        rfqId,
        quotationId,
        projectId,
        supplierId,
        organizationId,
        createdById: session.user.id,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        deliveryAddress,
        deliveryInstructions,
        paymentTerms,
        subtotal: subtotal || 0,
        taxAmount: taxAmount || 0,
        totalAmount: totalAmount || 0,
        notes,
        items: {
          create: items.map((item: { materialName: string; description?: string; quantity: number; unit: string; unitPrice: number; totalPrice: number }) => ({
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            balanceQuantity: item.quantity,
          })),
        },
      },
      include: {
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        project: {
          select: { id: true, title: true },
        },
        items: true,
        _count: {
          select: { goodsReceipts: true, invoices: true },
        },
      },
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء أمر الشراء" },
      { status: 500 }
    );
  }
}
