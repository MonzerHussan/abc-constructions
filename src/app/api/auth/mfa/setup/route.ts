import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSecret, generateURI } from "otplib"
import * as QRCode from "qrcode"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const secret = generateSecret()
  const uri = generateURI({ issuer: "ABC Constructions", label: session.user.email!, secret })

  const qrCode = await QRCode.toDataURL(uri)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaSecret: secret, mfaEnabled: false },
  })

  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomUUID().slice(0, 8).toUpperCase()
  )

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaBackupCodes: JSON.stringify(backupCodes) },
  })

  return NextResponse.json({ secret, qrCode, backupCodes })
}
