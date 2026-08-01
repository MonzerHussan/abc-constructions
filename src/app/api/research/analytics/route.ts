import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const [totalCampaigns, activeCampaigns, totalParticipants, totalResponses, totalFoundingMembers, totalFeatureRequests, totalFeedback, totalNpsScores, npsAgg] = await Promise.all([
      prisma.researchCampaign.count(),
      prisma.researchCampaign.count({ where: { status: "ACTIVE" } }),
      prisma.researchParticipant.count(),
      prisma.surveyResponse.count(),
      prisma.foundingMember.count(),
      prisma.featureRequest.count(),
      prisma.feedback.count(),
      prisma.npsScore.count(),
      prisma.npsScore.aggregate({ _avg: { score: true } }),
    ])
    return NextResponse.json({
      totalCampaigns, activeCampaigns, totalParticipants, totalResponses,
      totalFoundingMembers, totalFeatureRequests, totalFeedback, totalNpsScores,
      npsScore: npsAgg._avg.score ? Math.round(npsAgg._avg.score) : null,
      totalInterviews: await prisma.interview.count(),
      totalFocusGroups: await prisma.focusGroup.count(),
      totalAiInsights: await prisma.aiInsight.count(),
      campaignsByType: [],
      campaignsByStatus: [],
      participantsBySegment: [],
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}
