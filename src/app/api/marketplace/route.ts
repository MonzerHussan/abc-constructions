import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const inStock = searchParams.get("inStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (inStock !== null && inStock !== undefined) {
      where.inStock = inStock === "true";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, companyName: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المنتجات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      unit,
      minQuantity,
      specifications,
      location,
      userId,
    } = body;

    if (!name || !description || !category || !price || !unit || !location || !userId) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        unit,
        minQuantity: minQuantity ? parseInt(minQuantity) : null,
        specifications,
        location,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, companyName: true, role: true },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة المنتج" },
      { status: 500 }
    );
  }
}
