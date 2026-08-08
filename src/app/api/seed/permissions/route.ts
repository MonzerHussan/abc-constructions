import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function assertSeedAllowed(): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seeding is disabled in production" }, { status: 403 })
  }
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}

const PERMISSIONS = [
  // Project Management
  { key: "project.create", name: "Create Projects", nameAr: "إنشاء مشاريع", module: "projects" },
  { key: "project.view", name: "View Projects", nameAr: "عرض المشاريع", module: "projects" },
  { key: "project.edit", name: "Edit Projects", nameAr: "تعديل المشاريع", module: "projects" },
  { key: "project.delete", name: "Delete Projects", nameAr: "حذف المشاريع", module: "projects" },
  { key: "project.approve", name: "Approve Projects", nameAr: "اعتماد المشاريع", module: "projects" },
  { key: "project.budget", name: "Manage Budget", nameAr: "إدارة الميزانية", module: "projects" },

  // Tenders
  { key: "tender.create", name: "Create Tenders", nameAr: "إنشاء مناقصات", module: "tenders" },
  { key: "tender.view", name: "View Tenders", nameAr: "عرض المناقصات", module: "tenders" },
  { key: "tender.edit", name: "Edit Tenders", nameAr: "تعديل المناقصات", module: "tenders" },
  { key: "tender.delete", name: "Delete Tenders", nameAr: "حذف المناقصات", module: "tenders" },
  { key: "tender.award", name: "Award Tenders", nameAr: "منح العطاءات", module: "tenders" },
  { key: "tender.bid", name: "Submit Bids", nameAr: "تقديم عروض", module: "tenders" },

  // Materials
  { key: "material.create", name: "Create Material Tenders", nameAr: "إنشاء مناقصات مواد", module: "materials" },
  { key: "material.edit", name: "Edit Material Tenders", nameAr: "تعديل مناقصات المواد", module: "materials" },
  { key: "material.delete", name: "Delete Material Tenders", nameAr: "حذف مناقصات المواد", module: "materials" },
  { key: "material.view", name: "View Material Tenders", nameAr: "عرض مناقصات المواد", module: "materials" },
  { key: "material.bid", name: "Submit Material Bids", nameAr: "تقديم عروض مواد", module: "materials" },

  // Procurement
  { key: "procurement.rfq", name: "Issue RFQ", nameAr: "إصدار طلب عرض سعر", module: "procurement" },
  { key: "procurement.approve", name: "Approve Purchase", nameAr: "اعتماد الشراء", module: "procurement" },
  { key: "procurement.order", name: "Create Purchase Orders", nameAr: "إنشاء أوامر شراء", module: "procurement" },

  // Members
  { key: "member.invite", name: "Invite Members", nameAr: "دعوة أعضاء", module: "members" },
  { key: "member.remove", name: "Remove Members", nameAr: "إزالة أعضاء", module: "members" },
  { key: "member.role", name: "Assign Roles", nameAr: "تعيين أدوار", module: "members" },

  // Roles
  { key: "role.create", name: "Create Roles", nameAr: "إنشاء أدوار", module: "roles" },
  { key: "role.edit", name: "Edit Roles", nameAr: "تعديل الأدوار", module: "roles" },
  { key: "role.delete", name: "Delete Roles", nameAr: "حذف الأدوار", module: "roles" },

  // Marketplace
  { key: "marketplace.create", name: "List Products", nameAr: "إضافة منتجات", module: "marketplace" },
  { key: "marketplace.edit", name: "Edit Products", nameAr: "تعديل المنتجات", module: "marketplace" },
  { key: "marketplace.delete", name: "Delete Products", nameAr: "حذف المنتجات", module: "marketplace" },

  // Jobs
  { key: "job.create", name: "Post Jobs", nameAr: "نشر وظائف", module: "jobs" },
  { key: "job.edit", name: "Edit Jobs", nameAr: "تعديل الوظائف", module: "jobs" },
  { key: "job.delete", name: "Delete Jobs", nameAr: "حذف الوظائف", module: "jobs" },
  { key: "job.review", name: "Review Applications", nameAr: "مراجعة الطلبات", module: "jobs" },

  // Finance
  { key: "finance.view", name: "View Finances", nameAr: "عرض المالية", module: "finance" },
  { key: "finance.payment", name: "Process Payments", nameAr: "إجراء المدفوعات", module: "finance" },
  { key: "finance.approve", name: "Approve Payments", nameAr: "اعتماد الدفعات", module: "finance" },
  { key: "finance.invoice", name: "Manage Invoices", nameAr: "إدارة الفواتير", module: "finance" },

  // Reports
  { key: "report.view", name: "View Reports", nameAr: "عرض التقارير", module: "reports" },
  { key: "report.export", name: "Export Reports", nameAr: "تصدير التقارير", module: "reports" },

  // Organization Settings
  { key: "org.edit", name: "Edit Organization", nameAr: "تعديل المنظمة", module: "organization" },
  { key: "org.delete", name: "Delete Organization", nameAr: "حذف المنظمة", module: "organization" },
  { key: "org.verification", name: "Manage Verification", nameAr: "إدارة التوثيق", module: "organization" },

  // Research Lab
  { key: "research.campaign.create", name: "Create Campaigns", nameAr: "إنشاء حملات", module: "research" },
  { key: "research.campaign.view", name: "View Campaigns", nameAr: "عرض الحملات", module: "research" },
  { key: "research.campaign.edit", name: "Edit Campaigns", nameAr: "تعديل الحملات", module: "research" },
  { key: "research.campaign.delete", name: "Delete Campaigns", nameAr: "حذف الحملات", module: "research" },
  { key: "research.campaign.launch", name: "Launch Campaigns", nameAr: "إطلاق الحملات", module: "research" },
  { key: "research.campaign.close", name: "Close Campaigns", nameAr: "إغلاق الحملات", module: "research" },
  { key: "research.survey.create", name: "Create Surveys", nameAr: "إنشاء استبيانات", module: "research" },
  { key: "research.survey.view", name: "View Surveys", nameAr: "عرض الاستبيانات", module: "research" },
  { key: "research.survey.edit", name: "Edit Surveys", nameAr: "تعديل الاستبيانات", module: "research" },
  { key: "research.survey.delete", name: "Delete Surveys", nameAr: "حذف الاستبيانات", module: "research" },
  { key: "research.participant.view", name: "View Participants", nameAr: "عرض المشاركين", module: "research" },
  { key: "research.participant.manage", name: "Manage Participants", nameAr: "إدارة المشاركين", module: "research" },
  { key: "research.segment.manage", name: "Manage Segments", nameAr: "إدارة الشرائح", module: "research" },
  { key: "research.founding.manage", name: "Manage Founding Members", nameAr: "إدارة الأعضاء المؤسسين", module: "research" },
  { key: "research.feature.view", name: "View Feature Requests", nameAr: "عرض طلبات الميزات", module: "research" },
  { key: "research.feature.manage", name: "Manage Feature Requests", nameAr: "إدارة طلبات الميزات", module: "research" },
  { key: "research.insight.view", name: "View AI Insights", nameAr: "عرض تحليلات AI", module: "research" },
  { key: "research.insight.generate", name: "Generate AI Insights", nameAr: "توليد تحليلات AI", module: "research" },
  { key: "research.analytics", name: "View Analytics", nameAr: "عرض التحليلات", module: "research" },
  { key: "research.export", name: "Export Research Data", nameAr: "تصدير بيانات الأبحاث", module: "research" },
]

export async function POST() {
  const denied = await assertSeedAllowed()
  if (denied) return denied

  let created = 0
  for (const p of PERMISSIONS) {
    const existing = await prisma.permission.findUnique({ where: { key: p.key } })
    if (!existing) {
      await prisma.permission.create({ data: p })
      created++
    }
  }
  return NextResponse.json({ created, total: PERMISSIONS.length })
}
