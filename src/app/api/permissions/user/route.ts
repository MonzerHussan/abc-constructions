import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserPermissions, getEffectiveOrgId } from "@/lib/rbac"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [permissions, organizationId] = await Promise.all([
    getUserPermissions(session.user.id),
    getEffectiveOrgId(session.user.id),
  ])

  return NextResponse.json({ permissions, organizationId })
}
