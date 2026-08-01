import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

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
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const [tenders, total] = await Promise.all([
      prisma.projectTender.findMany({
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
      prisma.projectTender.count({ where }),
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
    console.error("Error fetching project tenders:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المناقصات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json();
    const {
      title,
      description,
      category,
      location,
      budgetMin,
      budgetMax,
      deadline,
      requirements,
    } = body;

    if (!title || !description || !category || !location) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    const tender = await prisma.projectTender.create({
      data: {
        title,
        description,
        category,
        location,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        deadline: new Date(deadline),
        requirements,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, companyName: true, role: true },
        },
      },
    });

    return NextResponse.json(tender, { status: 201 });
  } catch (error) {
    console.error("Error creating project tender:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء المناقصة" },
      { status: 500 }
    );
  }
}
