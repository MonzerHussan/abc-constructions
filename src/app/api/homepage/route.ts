import { NextResponse } from "next/server";
import { getHomepageData } from "@/lib/homepage";

export async function GET() {
  try {
    const data = await getHomepageData();
    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/homepage failed", e);
    return NextResponse.json({ error: "Failed to load homepage content" }, { status: 500 });
  }
}