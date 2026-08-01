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
    const supplierId = searchParams.get("supplierId") || session.user.id;

    const items = await prisma.supplierRating.findMany({
      where: { supplierId },
      include: {
        ratedBy: {
          select: { id: true, name: true, companyName: true },
        },
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب التقييمات" },
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
    const { supplierId, purchaseOrderId, rating, quality, delivery, communication, price, comment } = body;

    if (!supplierId || rating === undefined) {
      return NextResponse.json(
        { error: "معرف المورد والتقييم مطلوبان" },
        { status: 400 }
      );
    }

    const supplierRating = await prisma.supplierRating.create({
      data: {
        supplierId,
        purchaseOrderId,
        ratedById: session.user.id,
        rating,
        quality,
        delivery,
        communication,
        price,
        comment,
      },
      include: {
        ratedBy: {
          select: { id: true, name: true, companyName: true },
        },
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
      },
    });

    return NextResponse.json(supplierRating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء التقييم" },
      { status: 500 }
    );
  }
}
