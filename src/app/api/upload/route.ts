import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { detectType } from "@/modules/shared/utils/file-type"
import { isContactVerified } from "@/lib/contact-verification"

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const purpose = formData.get("purpose") as string | null
  if (!file) return NextResponse.json({ error: "File required" }, { status: 400 })

  if (purpose === "verification") {
    const verified = await isContactVerified(session.user.id)
    if (!verified) {
      return NextResponse.json(
        { error: "Email and phone must be verified before uploading documents" },
        { status: 403 },
      )
    }
  }

  let subdir = "verifications"
  if (purpose === "homepage") {
    const { prisma } = await import("@/lib/prisma")
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    subdir = "homepage"
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = detectType(buffer)
  if (!detected) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, and PDF files are allowed" }, { status: 400 })
  }

  // The declared MIME type must match the detected signature
  if (file.type && file.type !== detected.mime) {
    return NextResponse.json({ error: "File content does not match its declared type" }, { status: 400 })
  }

  const filename = `${session.user.id}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${detected.ext}`
  const dir = path.join(process.cwd(), "public", "uploads", subdir)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)

  return NextResponse.json({
    url: `/uploads/${subdir}/${filename}`,
    fileName: file.name,
    size: file.size,
    type: detected.mime,
  })
}
