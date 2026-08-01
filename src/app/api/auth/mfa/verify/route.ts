import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifySync } from "otplib"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const LIMIT = 10
const WINDOW_MS = 15 * 60 * 1000

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ip = getClientIp(req.headers)
  const rl = rateLimit({ key: `mfa-verify:${session.user.id}:${ip}`, limit: LIMIT, windowMs: WINDOW_MS })
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    )
  }

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.mfaSecret) return NextResponse.json({ error: "MFA not set up" }, { status: 400 })

  try {
    const verified = verifySync({ token, secret: user.mfaSecret })
    if (!verified) return NextResponse.json({ verified: false }, { status: 400 })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaEnabled: true },
    })

    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }
}
