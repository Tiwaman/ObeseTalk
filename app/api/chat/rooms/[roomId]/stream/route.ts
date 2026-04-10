import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;
  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");

  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return new Response("Room not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let lastTimestamp = after ? new Date(after) : new Date();

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      // Send initial heartbeat
      send("connected", { roomId });

      const poll = async () => {
        if (closed) return;
        try {
          const messages = await prisma.chatMessage.findMany({
            where: {
              roomId,
              createdAt: { gt: lastTimestamp },
            },
            orderBy: { createdAt: "asc" },
            take: 50,
          });

          for (const msg of messages) {
            send("message", {
              id: msg.id,
              text: msg.text,
              authorName: msg.authorName,
              createdAt: msg.createdAt.toISOString(),
            });
            lastTimestamp = msg.createdAt;
          }

          // Send presence count
          const cutoff = new Date(Date.now() - 30000); // active in last 30s
          const activePresence = await prisma.chatPresence.findMany({
            where: { roomId, lastSeen: { gte: cutoff } },
            select: { username: true, typingAt: true },
          });
          send("presence", { count: activePresence.length });

          // Send typing indicators (typed in last 3s)
          const typingCutoff = new Date(Date.now() - 3000);
          const typers = activePresence
            .filter((p) => p.typingAt && p.typingAt >= typingCutoff)
            .map((p) => p.username);
          if (typers.length > 0) {
            for (const u of typers) {
              send("typing", { username: u });
            }
          }
        } catch {
          // DB error, skip this tick
        }
      };

      // Poll DB every 1.5s and push via SSE
      const interval = setInterval(poll, 1500);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
