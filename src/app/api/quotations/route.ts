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
    const rfqId = searchParams.get("rfqId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { supplierId: session.user.id };

    if (rfqId) {
      where.rfqId = rfqId;
    }

    if (status) {
      where.status = status;
    }

    const items = await prisma.quotation.findMany({
      where,
      include: {
        rfq: {
          select: { id: true, title: true, referenceNumber: true, deadlineDate: true },
        },
        items: true,
        _count: { select: { awards: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب عروض الأسعار" },
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
      rfqId,
      referenceNumber,
      coverLetter,
      deliveryTime,
      validUntil,
      totalAmount,
      taxAmount,
      grandTotal,
      currency,
      notes,
      organizationId,
      items,
    } = body;

    if (!rfqId || !referenceNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: "طلب العرض والرقم المرجعي والعناصر مطلوبة" },
        { status: 400 }
      );
    }

    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        supplierId: session.user.id,
        organizationId,
        referenceNumber,
        coverLetter,
        deliveryTime,
        validUntil: validUntil ? new Date(validUntil) : null,
        totalAmount,
        taxAmount: taxAmount || 0,
        grandTotal: grandTotal || totalAmount,
        currency: currency || "SAR",
        notes,
        status: "SUBMITTED",
        submittedAt: new Date(),
        items: {
          create: items.map((item: { rfqItemId?: string; materialName: string; description?: string; quantity: number; unit: string; unitPrice: number; totalPrice: number }) => ({
            rfqItemId: item.rfqItemId,
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        rfq: {
          select: { id: true, title: true, referenceNumber: true },
        },
        items: true,
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء عرض السعر" },
      { status: 500 }
    );
  }
}
