import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [weeklyCount, allTimeGotThisToo, mostReactedGroup] = await Promise.all([
    prisma.submission.count({
      where: { createdAt: { gte: oneWeekAgo } },
    }),
    prisma.reaction.count({
      where: { type: "GOT_THIS_TOO" },
    }),
    prisma.reaction.groupBy({
      by: ["submissionId"],
      where: {
        submission: { createdAt: { gte: oneWeekAgo } },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ]);

  let mostReactedThisWeek = null;
  if (mostReactedGroup.length > 0) {
    const submission = await prisma.submission.findUnique({
      where: { id: mostReactedGroup[0].submissionId },
    });
    if (submission) {
      mostReactedThisWeek = {
        text:
          submission.text.length > 60
            ? submission.text.slice(0, 60) + "..."
            : submission.text,
        count: mostReactedGroup[0]._count.id,
      };
    }
  }

  return NextResponse.json({
    weeklyCount,
    allTimeGotThisToo,
    mostReactedThisWeek,
  });
}
