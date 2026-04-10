import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;
  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const where: Record<string, unknown> = { roomId };
  if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      text: m.text,
      authorName: m.authorName,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;
  const body = await req.json();
  const { text, authorName } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }

  if (text.trim().length > 500) {
    return NextResponse.json({ error: "Message too long (max 500 chars)" }, { status: 400 });
  }

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      text: text.trim(),
      authorName: authorName?.trim() || "Anonymous",
      roomId,
    },
  });

  return NextResponse.json({
    id: message.id,
    text: message.text,
    authorName: message.authorName,
    createdAt: message.createdAt.toISOString(),
  }, { status: 201 });
}
