"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/projects/ABC?auth=login")
  }, [router])

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-secondary-500" />
    </div>
  )
}