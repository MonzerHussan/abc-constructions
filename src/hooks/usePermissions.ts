"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function usePermissions() {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<string[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/permissions/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setPermissions(data.permissions)
          setOrgId(data.organizationId)
        }
      })
  }, [session])

  const can = (permission: string) => permissions.includes(permission)
  const canAny = (...keys: string[]) => keys.some((k) => permissions.includes(k))
  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "SUPER_ADMIN"

  return { permissions, can, canAny, isAdmin, orgId }
}
