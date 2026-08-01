import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit({ key: `check-credentials:${ip}`, limit: LIMIT, windowMs: WINDOW_MS })
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    )
  }

  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) return NextResponse.json({ valid: false }, { status: 401 })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return NextResponse.json({ valid: false }, { status: 401 })

  return NextResponse.json({ valid: true, mfaRequired: user.mfaEnabled, email: user.email })
}
