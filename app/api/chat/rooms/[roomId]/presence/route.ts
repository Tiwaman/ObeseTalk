import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;
  const body = await req.json();
  const { username, typing } = body;

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const now = new Date();
  await prisma.chatPresence.upsert({
    where: { roomId_username: { roomId, username: username.trim() } },
    update: {
      lastSeen: now,
      ...(typing ? { typingAt: now } : {}),
    },
    create: {
      roomId,
      username: username.trim(),
      ...(typing ? { typingAt: now } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;
  const cutoff = new Date(Date.now() - 30000); // active in last 30s

  const active = await prisma.chatPresence.findMany({
    where: { roomId, lastSeen: { gte: cutoff } },
    select: { username: true },
    orderBy: { lastSeen: "desc" },
  });

  return NextResponse.json({
    count: active.length,
    users: active.map((a) => a.username),
  });
}
