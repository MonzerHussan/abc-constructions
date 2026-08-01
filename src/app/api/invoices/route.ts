import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    const items = await prisma.invoice.findMany({
      where,
      include: {
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        items: true,
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الفواتير" },
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
      invoiceNumber,
      purchaseOrderId,
      supplierId,
      invoiceDate,
      dueDate,
      amount,
      taxAmount,
      totalAmount,
      notes,
    } = body;

    if (!invoiceNumber || !purchaseOrderId || !supplierId || !totalAmount) {
      return NextResponse.json(
        { error: "رقم الفاتورة ومعرف أمر الشراء ومعرف المورد والمبلغ الإجمالي مطلوبة" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        purchaseOrderId,
        supplierId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        amount: amount || totalAmount,
        taxAmount: taxAmount || 0,
        totalAmount,
        balanceAmount: totalAmount,
        notes,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      include: {
        purchaseOrder: {
          select: { id: true, poNumber: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الفاتورة" },
      { status: 500 }
    );
  }
}
