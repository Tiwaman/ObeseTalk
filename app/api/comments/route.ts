import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { submissionId },
    orderBy: { createdAt: "asc" },
  });

  // Group into top-level comments with their replies
  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  const threaded = topLevel.map((comment) => ({
    id: comment.id,
    text: comment.text,
    authorName: comment.authorName,
    createdAt: comment.createdAt.toISOString(),
    replies: replies
      .filter((r) => r.parentId === comment.id)
      .map((r) => ({
        id: r.id,
        text: r.text,
        authorName: r.authorName,
        createdAt: r.createdAt.toISOString(),
      })),
  }));

  return NextResponse.json(threaded);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { submissionId, text, authorName, parentId } = body;

  if (!submissionId || !text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "submissionId and text are required" },
      { status: 400 }
    );
  }

  // Verify submission exists
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // If replying, verify parent comment exists and belongs to same submission
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
    });
    if (!parent || parent.submissionId !== submissionId) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      text: text.trim(),
      authorName: authorName?.trim() || null,
      submissionId,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(
    {
      id: comment.id,
      text: comment.text,
      authorName: comment.authorName,
      createdAt: comment.createdAt.toISOString(),
      replies: [],
    },
    { status: 201 }
  );
}
