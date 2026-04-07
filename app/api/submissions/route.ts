import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "latest";
  const whoSaidIt = searchParams.get("whoSaidIt");
  const whereSaid = searchParams.get("whereSaid");

  const where: Record<string, string> = {};
  if (whoSaidIt) where.whoSaidIt = whoSaidIt;
  if (whereSaid) where.whereSaid = whereSaid;

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      reactions: true,
    },
    orderBy: sort === "latest" ? { createdAt: "desc" } : undefined,
  });

  const mapped = submissions.map((s) => {
    const counts: Record<string, number> = {
      DID_NOT: 0,
      GOT_THIS_TOO: 0,
      AUDACITY: 0,
      SENDING_LOVE: 0,
    };
    s.reactions.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      id: s.id,
      text: s.text,
      whoSaidIt: s.whoSaidIt,
      whereSaid: s.whereSaid,
      submitterName: s.submitterName,
      createdAt: s.createdAt.toISOString(),
      reactions: counts,
      totalReactions,
    };
  });

  if (sort === "top") {
    mapped.sort((a, b) => b.reactions.GOT_THIS_TOO - a.reactions.GOT_THIS_TOO);
  }

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, whoSaidIt, whereSaid, submitterName } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      text: text.trim(),
      whoSaidIt: whoSaidIt || null,
      whereSaid: whereSaid || null,
      submitterName: submitterName?.trim() || null,
    },
  });

  return NextResponse.json({
    id: submission.id,
    text: submission.text,
    whoSaidIt: submission.whoSaidIt,
    whereSaid: submission.whereSaid,
    submitterName: submission.submitterName,
    createdAt: submission.createdAt.toISOString(),
    reactions: { DID_NOT: 0, GOT_THIS_TOO: 0, AUDACITY: 0, SENDING_LOVE: 0 },
    totalReactions: 0,
  }, { status: 201 });
}
