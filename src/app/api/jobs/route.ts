import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const jobType = searchParams.get("jobType") || "";
    const isUrgent = searchParams.get("isUrgent");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = { isActive: true };

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

    if (jobType) {
      where.jobType = jobType;
    }

    if (isUrgent === "true") {
      where.isUrgent = true;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, companyName: true, role: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الوظائف" },
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
      jobType,
      salaryMin,
      salaryMax,
      location,
      requirements,
      benefits,
      vacancies,
      isUrgent,
    } = body;

    if (!title || !description || !category || !jobType || !location) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        category,
        jobType,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        location,
        requirements,
        benefits,
        vacancies: vacancies ? parseInt(vacancies) : 1,
        isUrgent: isUrgent || false,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, companyName: true, role: true },
        },
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء نشر الوظيفة" },
      { status: 500 }
    );
  }
}
