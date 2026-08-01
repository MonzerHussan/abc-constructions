import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, companyName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب المنتجات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description, unit, category: categoryName, location, price, minQuantity, specifications } = await request.json();
    if (!name || !unit) return NextResponse.json({ error: "name and unit required" }, { status: 400 })

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        category: categoryName || "other",
        unit,
        location: location || "",
        price: price || 0,
        minQuantity: minQuantity || null,
        specifications: specifications || null,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, companyName: true } },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إضافة المنتج" }, { status: 500 })
  }
}
