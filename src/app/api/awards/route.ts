import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [items, total] = await Promise.all([
      prisma.award.findMany({
        include: {
          rfq: {
            select: { id: true, title: true, referenceNumber: true },
          },
          quotation: {
            select: { id: true, referenceNumber: true, totalAmount: true },
          },
          supplier: {
            select: { id: true, name: true, companyName: true },
          },
          awardedBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.award.count(),
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
    console.error("Error fetching awards:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الترسيات" },
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
    const { rfqId, quotationId, supplierId, notes } = body;

    if (!rfqId || !quotationId || !supplierId) {
      return NextResponse.json(
        { error: "معرف طلب العرض ومعرف عرض السعر ومعرف المورد مطلوبة" },
        { status: 400 }
      );
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      select: { grandTotal: true },
    });

    const award = await prisma.award.create({
      data: {
        rfqId,
        quotationId,
        supplierId,
        awardedById: session.user.id,
        totalAmount: quotation?.grandTotal || 0,
        notes,
      },
      include: {
        rfq: {
          select: { id: true, title: true, referenceNumber: true },
        },
        quotation: {
          select: { id: true, referenceNumber: true, totalAmount: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        awardedBy: {
          select: { id: true, name: true },
        },
      },
    });

    await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: "AWARDED" },
    });

    return NextResponse.json(award, { status: 201 });
  } catch (error) {
    console.error("Error creating award:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الترسية" },
      { status: 500 }
    );
  }
}
