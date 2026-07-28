import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999).toString().padStart(3, "0");
  return `DLV-${year}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const trackingCode = searchParams.get("trackingCode") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (trackingCode) {
      where.trackingCode = trackingCode;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { materialType: { contains: search, mode: "insensitive" } },
        { pickupAddress: { contains: search, mode: "insensitive" } },
        { deliveryAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.deliveryOrder.findMany({
        where,
        include: {
          sender: {
            select: { id: true, name: true, phone: true, companyName: true },
          },
          receiver: {
            select: { id: true, name: true, phone: true },
          },
          driver: {
            select: {
              id: true,
              vehicleType: true,
              plateNumber: true,
              avgRating: true,
              user: { select: { name: true, phone: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deliveryOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب طلبات التوصيل" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      senderId,
      pickupName,
      pickupPhone,
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupNotes,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      deliveryNotes,
      materialType,
      description,
      weight,
      dimensions,
      quantity,
      fragile,
      needsCrane,
      vehicleType,
      priority,
      paymentMethod,
      scheduledDate,
      scheduledTime,
    } = body;

    if (!senderId || !pickupName || !pickupPhone || !pickupAddress || !deliveryName || !deliveryPhone || !deliveryAddress || !materialType) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    let basePrice = 50;
    const weightNum = weight ? parseFloat(weight) : 0;
    let weightFee = 0;
    if (weightNum > 5000) weightFee = 200;
    else if (weightNum > 1000) weightFee = 100;
    else if (weightNum > 500) weightFee = 50;

    const urgentFee = priority === "URGENT" ? 100 : 0;
    const totalPrice = basePrice + weightFee + urgentFee;

    const order = await prisma.deliveryOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        senderId,
        pickupName,
        pickupPhone,
        pickupAddress,
        pickupLat: pickupLat ? parseFloat(pickupLat) : null,
        pickupLng: pickupLng ? parseFloat(pickupLng) : null,
        pickupNotes,
        deliveryName,
        deliveryPhone,
        deliveryAddress,
        deliveryLat: deliveryLat ? parseFloat(deliveryLat) : null,
        deliveryLng: deliveryLng ? parseFloat(deliveryLng) : null,
        deliveryNotes,
        materialType,
        description: description || "",
        weight: weightNum,
        dimensions,
        quantity: quantity ? parseInt(quantity) : 1,
        fragile: fragile || false,
        needsCrane: needsCrane || false,
        preferredVehicleType: vehicleType || "TRUCK_SMALL",
        priority: priority || "NORMAL",
        paymentMethod: paymentMethod || "CASH",
        basePrice,
        distanceFee: 0,
        weightFee,
        urgentFee,
        totalPrice,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime,
      },
      include: {
        sender: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery order:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء طلب التوصيل" },
      { status: 500 }
    );
  }
}
