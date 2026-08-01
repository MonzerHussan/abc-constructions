import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId") || "";

    const where: Record<string, unknown> = {};

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    const items = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        paidBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المدفوعات" },
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
    const { paymentNumber, invoiceId, purchaseOrderId, amount, method, referenceNumber, notes } = body;

    if (!paymentNumber || !invoiceId || !amount) {
      return NextResponse.json(
        { error: "رقم الدفعة ومعرف الفاتورة والمبلغ مطلوبة" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) {
      return NextResponse.json(
        { error: "الفاتورة غير موجودة" },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        invoiceId,
        purchaseOrderId,
        paidById: session.user.id,
        amount,
        method: method || "CASH",
        referenceNumber,
        notes,
        paidAt: new Date(),
        status: "COMPLETED",
      },
      include: {
        invoice: {
          select: { id: true, invoiceNumber: true, totalAmount: true },
        },
        paidBy: {
          select: { id: true, name: true },
        },
      },
    });

    const totalPaid = (invoice.paidAmount || 0) + amount;
    const newBalance = invoice.totalAmount - totalPaid;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: totalPaid,
        balanceAmount: newBalance,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الدفعة" },
      { status: 500 }
    );
  }
}
