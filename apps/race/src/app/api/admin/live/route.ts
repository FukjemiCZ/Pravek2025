import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export async function GET(request: Request) {
  await requireAdmin();
  const raceId = new URL(request.url).searchParams.get("raceId") || undefined;
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      async function send() {
        const latest = await prisma.raceEvent.findFirst({ where: { raceId }, orderBy: { createdAt: "desc" }, include: { racer: true, checkpoint: true } });
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ latest, at: new Date().toISOString() })}\n\n`));
      }
      await send();
      const interval = setInterval(send, 5000);
      request.signal.addEventListener("abort", () => { clearInterval(interval); controller.close(); });
    }
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive" } });
}
