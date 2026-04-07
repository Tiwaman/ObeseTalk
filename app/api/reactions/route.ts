import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["DID_NOT", "GOT_THIS_TOO", "AUDACITY", "SENDING_LOVE"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { submissionId, type } = body;

  if (!submissionId || !type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Valid submissionId and type are required" },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const reaction = await prisma.reaction.create({
    data: { submissionId, type },
  });

  return NextResponse.json({ id: reaction.id, type: reaction.type }, { status: 201 });
}
