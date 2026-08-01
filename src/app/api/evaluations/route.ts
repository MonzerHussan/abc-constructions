import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get("rfqId") || "";

    const where: Record<string, unknown> = {};

    if (rfqId) {
      where.rfqId = rfqId;
    }

    const items = await prisma.evaluation.findMany({
      where,
      include: {
        rfq: {
          select: { id: true, title: true, referenceNumber: true },
        },
        evaluator: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
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
    const { rfqId, criteria, totalScore, notes } = body;

    if (!rfqId) {
      return NextResponse.json(
        { error: "معرف طلب العرض مطلوب" },
        { status: 400 }
      );
    }

    const existing = await prisma.evaluation.findFirst({
      where: { rfqId, evaluatorId: session.user.id },
    });

    let evaluation;

    if (existing) {
      evaluation = await prisma.evaluation.update({
        where: { id: existing.id },
        data: {
          criteria: criteria || existing.criteria,
          totalScore: totalScore !== undefined ? totalScore : existing.totalScore,
          notes: notes !== undefined ? notes : existing.notes,
          status: totalScore !== undefined ? "COMPLETED" : "IN_PROGRESS",
        },
        include: {
          rfq: {
            select: { id: true, title: true, referenceNumber: true },
          },
          evaluator: {
            select: { id: true, name: true },
          },
        },
      });
    } else {
      evaluation = await prisma.evaluation.create({
        data: {
          rfqId,
          evaluatorId: session.user.id,
          criteria,
          totalScore,
          notes,
          status: totalScore !== undefined ? "COMPLETED" : "IN_PROGRESS",
        },
        include: {
          rfq: {
            select: { id: true, title: true, referenceNumber: true },
          },
          evaluator: {
            select: { id: true, name: true },
          },
        },
      });
    }

    return NextResponse.json(evaluation, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ التقييم" },
      { status: 500 }
    );
  }
}
