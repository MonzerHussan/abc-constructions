import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const verification = await prisma.verification.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!verification) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { docType, fileName, fileUrl, expiresAt } = await req.json()
  if (!docType || !fileUrl) return NextResponse.json({ error: "docType and fileUrl required" }, { status: 400 })

  const doc = await prisma.verificationDocument.create({
    data: {
      verificationId: id,
      docType,
      fileName: fileName || fileUrl.split("/").pop() || "document",
      fileUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
