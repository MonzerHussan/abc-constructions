import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "OPEN";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { materialType: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.materialType = category;
    }

    if (status) {
      where.status = status;
    }

    const [tenders, total] = await Promise.all([
      prisma.materialTender.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, companyName: true, role: true },
          },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.materialTender.count({ where }),
    ]);

    return NextResponse.json({
      tenders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching material tenders:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المناقصات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      materialType,
      quantity,
      unit,
      specifications,
      deliveryDate,
      location,
      budgetMax,
      userId,
    } = body;

    if (!title || !description || !materialType || !quantity || !location || !userId) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    const tender = await prisma.materialTender.create({
      data: {
        title,
        description,
        materialType,
        quantity,
        unit,
        specifications,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        location,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, companyName: true, role: true },
        },
      },
    });

    return NextResponse.json(tender, { status: 201 });
  } catch (error) {
    console.error("Error creating material tender:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الطلب" },
      { status: 500 }
    );
  }
}
