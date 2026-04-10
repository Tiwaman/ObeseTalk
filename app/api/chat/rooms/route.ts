import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rooms = await prisma.chatRoom.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });

  const mapped = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
    messageCount: r._count.messages,
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, createdBy } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  }

  if (name.trim().length > 50) {
    return NextResponse.json({ error: "Room name too long (max 50 chars)" }, { status: 400 });
  }

  const room = await prisma.chatRoom.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      createdBy: createdBy?.trim() || null,
    },
  });

  return NextResponse.json({
    id: room.id,
    name: room.name,
    description: room.description,
    createdBy: room.createdBy,
    createdAt: room.createdAt.toISOString(),
    messageCount: 0,
  }, { status: 201 });
}
