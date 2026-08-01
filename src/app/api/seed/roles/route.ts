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

// Permission groups by access level
const LEVELS = {
  read: [
    "project.view", "tender.view", "material.view",
    "marketplace.view", "job.view", "report.view",
    "finance.view", "procurement.rfq",
  ],
  operate: [
    "tender.bid", "material.bid", "job.review",
    "marketplace.create",
  ],
  manage: [
    "project.create", "project.edit",
    "tender.create", "tender.edit",
    "material.create",
    "job.create", "job.edit",
    "member.invite",
    "procurement.order",
    "marketplace.edit",
    "finance.invoice",
  ],
  direct: [
    "project.delete", "project.approve", "project.budget",
    "tender.delete", "tender.award",
    "member.remove", "member.role",
    "role.create", "role.edit",
    "report.export", "org.edit",
    "marketplace.delete",
    "job.delete",
    "material.edit", "material.delete",
    "procurement.approve",
    "finance.payment",
    "org.verification",
  ],
  own: [
    "role.delete", "org.delete",
    "finance.approve",
  ],
}

function perms(...items: (keyof typeof LEVELS | string)[]) {
  return items.flatMap((item) => {
    if (item === "read" || item === "operate" || item === "manage" || item === "direct" || item === "own") {
      return LEVELS[item]
    }
    return [item]
  })
}

interface RoleDef {
  name: string
  nameAr: string
  permissions: string[]
}

const ROLES_BY_TYPE: Record<string, RoleDef[]> = {
  PROJECT_OWNER: [
    { name: "Owner", nameAr: "المالك", permissions: perms("read", "operate", "manage", "direct", "own") },
    { name: "CEO / General Manager", nameAr: "الرئيس التنفيذي", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Project Director", nameAr: "مدير المشاريع", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Project Manager", nameAr: "مدير مشروع", permissions: perms("read", "operate", "manage") },
    { name: "Financial Manager", nameAr: "مدير مالي", permissions: perms("read", "finance.view", "finance.payment", "finance.invoice") },
    { name: "Procurement Director", nameAr: "مدير المشتريات", permissions: perms("read", "procurement.rfq", "procurement.order", "procurement.approve") },
    { name: "Procurement Officer", nameAr: "مسؤول مشتريات", permissions: perms("read", "procurement.rfq", "procurement.order") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
  CONSULTANT: [
    { name: "Managing Director", nameAr: "المدير العام", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Technical Director", nameAr: "مدير فني", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Design Manager", nameAr: "مدير التصميم", permissions: perms("read", "operate", "manage") },
    { name: "Discipline Lead", nameAr: "قائد تخصص", permissions: perms("read", "operate", "manage") },
    { name: "Architect", nameAr: "مهندس معماري", permissions: perms("read", "operate") },
    { name: "Structural Engineer", nameAr: "مهندس إنشائي", permissions: perms("read", "operate") },
    { name: "MEP Engineer", nameAr: "مهندس ميكانيكا/كهرباء", permissions: perms("read", "operate") },
    { name: "Site Engineer", nameAr: "مهندس موقع", permissions: perms("read", "operate") },
    { name: "Quantity Surveyor", nameAr: "مساح كميات", permissions: perms("read", "operate") },
    { name: "Tender Engineer", nameAr: "مهندس مناقصات", permissions: perms("read", "operate", "manage") },
    { name: "Document Controller", nameAr: "مسؤول مستندات", permissions: perms("read") },
    { name: "Inspector", nameAr: "مفتش", permissions: perms("read") },
    { name: "BIM Coordinator", nameAr: "منسق BIM", permissions: perms("read", "operate") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
  MAIN_CONTRACTOR: [
    { name: "General Manager", nameAr: "المدير العام", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Operations Manager", nameAr: "مدير العمليات", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Project Manager", nameAr: "مدير مشروع", permissions: perms("read", "operate", "manage") },
    { name: "Procurement Manager", nameAr: "مدير مشتريات", permissions: perms("read", "procurement.rfq", "procurement.order", "procurement.approve") },
    { name: "Procurement Engineer", nameAr: "مهندس مشتريات", permissions: perms("read", "procurement.rfq", "procurement.order") },
    { name: "Planning Engineer", nameAr: "مهندس تخطيط", permissions: perms("read", "operate") },
    { name: "Site Engineer", nameAr: "مهندس موقع", permissions: perms("read", "operate") },
    { name: "Quantity Surveyor", nameAr: "مساح كميات", permissions: perms("read", "operate") },
    { name: "Cost Control Engineer", nameAr: "مهندس مراقبة تكاليف", permissions: perms("read", "finance.view", "finance.invoice") },
    { name: "Finance Manager", nameAr: "مدير مالي", permissions: perms("read", "finance.view", "finance.payment", "finance.invoice", "finance.approve") },
    { name: "Accountant", nameAr: "محاسب", permissions: perms("read", "finance.view", "finance.invoice") },
    { name: "Store Manager", nameAr: "مدير مخزن", permissions: perms("read", "marketplace.view", "marketplace.create") },
    { name: "Warehouse Keeper", nameAr: "أمين مخزن", permissions: perms("read", "marketplace.view") },
    { name: "Equipment Manager", nameAr: "مدير معدات", permissions: perms("read") },
    { name: "HR Manager", nameAr: "مدير موارد بشرية", permissions: perms("read", "job.create", "job.edit", "job.review") },
    { name: "Document Controller", nameAr: "مسؤول مستندات", permissions: perms("read") },
    { name: "Safety Officer", nameAr: "مسؤول سلامة", permissions: perms("read") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
  SUBCONTRACTOR: [
    { name: "Owner", nameAr: "المالك", permissions: perms("read", "operate", "manage", "direct", "own") },
    { name: "Operations Manager", nameAr: "مدير عمليات", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Project Manager", nameAr: "مدير مشروع", permissions: perms("read", "operate", "manage") },
    { name: "Site Engineer", nameAr: "مهندس موقع", permissions: perms("read", "operate") },
    { name: "Supervisor", nameAr: "مشرف", permissions: perms("read") },
    { name: "Foreman", nameAr: "رئيس عمال", permissions: perms("read") },
    { name: "Accountant", nameAr: "محاسب", permissions: perms("read", "finance.view", "finance.invoice") },
    { name: "Procurement Officer", nameAr: "مسؤول مشتريات", permissions: perms("read", "procurement.rfq", "procurement.order") },
    { name: "Store Manager", nameAr: "مدير مخزن", permissions: perms("read", "marketplace.view") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
  WORKSHOP: [
    { name: "Owner", nameAr: "المالك", permissions: perms("read", "operate", "manage", "direct", "own") },
    { name: "Factory Manager", nameAr: "مدير مصنع", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Production Manager", nameAr: "مدير إنتاج", permissions: perms("read", "operate", "manage") },
    { name: "Workshop Supervisor", nameAr: "مشرف ورشة", permissions: perms("read", "operate") },
    { name: "Estimator", nameAr: "مقدّر تكاليف", permissions: perms("read", "operate", "manage") },
    { name: "Sales Manager", nameAr: "مدير مبيعات", permissions: perms("read", "marketplace.create", "marketplace.edit") },
    { name: "Accountant", nameAr: "محاسب", permissions: perms("read", "finance.view", "finance.invoice") },
    { name: "Store Manager", nameAr: "مدير مخزن", permissions: perms("read", "marketplace.view") },
    { name: "Logistics Coordinator", nameAr: "منسق لوجستي", permissions: perms("read") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
  FREELANCER: [
    { name: "Freelancer", nameAr: "مستقل", permissions: perms("read", "operate") },
  ],
  SUPPLIER: [
    { name: "Owner", nameAr: "المالك", permissions: perms("read", "operate", "manage", "direct", "own") },
    { name: "General Manager", nameAr: "المدير العام", permissions: perms("read", "operate", "manage", "direct") },
    { name: "Sales Manager", nameAr: "مدير مبيعات", permissions: perms("read", "marketplace.create", "marketplace.edit", "marketplace.delete") },
    { name: "Sales Representative", nameAr: "مندوب مبيعات", permissions: perms("read", "marketplace.create") },
    { name: "Tender Officer", nameAr: "مسؤول مناقصات", permissions: perms("read", "tender.view", "tender.bid", "material.view", "material.bid") },
    { name: "Warehouse Manager", nameAr: "مدير مستودع", permissions: perms("read", "marketplace.view") },
    { name: "Inventory Controller", nameAr: "مراقب مخزون", permissions: perms("read", "marketplace.view") },
    { name: "Logistics Manager", nameAr: "مدير لوجستي", permissions: perms("read") },
    { name: "Delivery Coordinator", nameAr: "منسق توصيل", permissions: perms("read") },
    { name: "Accountant", nameAr: "محاسب", permissions: perms("read", "finance.view", "finance.invoice") },
    { name: "Finance Manager", nameAr: "مدير مالي", permissions: perms("read", "finance.view", "finance.payment", "finance.invoice", "finance.approve") },
    { name: "Customer Support", nameAr: "دعم العملاء", permissions: perms("read") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
  PLATFORM_ADMIN: [
    { name: "Super Administrator", nameAr: "مدير عام المنصة", permissions: [...new Set(Object.values(LEVELS).flat())] },
    { name: "Operations Director", nameAr: "مدير العمليات", permissions: perms("read", "operate", "manage") },
    { name: "User Admin Manager", nameAr: "مدير حسابات", permissions: ["member.invite", "member.remove", "member.role", ...perms("read")] },
    { name: "Account Compliance Officer", nameAr: "مسؤول الامتثال", permissions: ["org.verification", ...perms("read")] },
    { name: "Finance Director", nameAr: "مدير مالي", permissions: perms("read", "finance.view", "finance.payment", "finance.invoice", "finance.approve") },
    { name: "Tender Manager", nameAr: "مدير مناقصات", permissions: perms("read", "operate", "manage") },
    { name: "Content Manager", nameAr: "مدير محتوى", permissions: perms("read") },
    { name: "Customer Support Agent", nameAr: "دعم العملاء", permissions: perms("read") },
    { name: "Security Officer", nameAr: "مسؤول أمن", permissions: perms("read") },
    { name: "Viewer", nameAr: "مشاهد", permissions: perms("read") },
  ],
}

export async function POST() {
  const denied = await assertSeedAllowed()
  if (denied) return denied

  let created = 0
  const results: { type: string; roles: number }[] = []

  for (const [orgType, roles] of Object.entries(ROLES_BY_TYPE)) {
    let typeCount = 0
    for (const role of roles) {
      const existing = await prisma.role.findFirst({
        where: { name: role.name, organizationType: orgType as any, organizationId: null, isSystem: true },
      })
      if (existing) continue

      const permissionRecords = await prisma.permission.findMany({
        where: { key: { in: role.permissions } },
      })

      await prisma.role.create({
        data: {
          name: role.name,
          nameAr: role.nameAr,
          description: `Default ${role.name} role for ${orgType}`,
          organizationType: orgType as any,
          isSystem: true,
          permissions: {
            create: permissionRecords.map((p) => ({ permissionId: p.id })),
          },
        },
      })
      created++
      typeCount++
    }
    results.push({ type: orgType, roles: typeCount })
  }

  return NextResponse.json({ created, details: results })
}
