import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { referenceNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, companyName: true },
          },
          items: true,
          _count: {
            select: {
              quotations: true,
              suppliers: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rFQ.count({ where }),
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
    console.error("Error fetching RFQs:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب طلبات العروض" },
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
      title,
      description,
      referenceNumber,
      purchaseRequestId,
      projectId,
      organizationId,
      issueDate,
      deadlineDate,
      deliveryDate,
      deliveryLocation,
      termsAndConditions,
      attachments,
      items,
      supplierIds,
    } = body;

    if (!title || !referenceNumber || !deadlineDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: "العنوان والرقم المرجعي وتاريخ الانتهاء والعناصر مطلوبة" },
        { status: 400 }
      );
    }

    const rfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        referenceNumber,
        purchaseRequestId,
        projectId,
        organizationId,
        issueDate: issueDate ? new Date(issueDate) : null,
        deadlineDate: new Date(deadlineDate),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryLocation,
        termsAndConditions,
        attachments: attachments || [],
        createdById: session.user.id,
        items: {
          create: items.map((item: { materialName: string; description?: string; quantity: number; unit: string; specifications?: string }) => ({
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            specifications: item.specifications,
          })),
        },
        suppliers: supplierIds?.length
          ? {
              create: supplierIds.map((supplierId: string) => ({
                supplierId,
                organizationId,
              })),
            }
          : undefined,
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
        _count: {
          select: {
            quotations: true,
            suppliers: true,
          },
        },
      },
    });

    return NextResponse.json(rfq, { status: 201 });
  } catch (error) {
    console.error("Error creating RFQ:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء طلب العرض" },
      { status: 500 }
    );
  }
}
