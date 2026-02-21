import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url =
      process.env.UPTIMEKUMA_STATUS_JSON_URL ||
      (process.env.UPTIMEKUMA_BASE_URL
        ? `${process.env.UPTIMEKUMA_BASE_URL.replace(/\/$/, "")}/api/status-page/default`
        : null);

    if (!url) {
      return NextResponse.json(
        { error: "UPTIMEKUMA_STATUS_JSON_URL (or UPTIMEKUMA_BASE_URL) missing" },
        { status: 500 }
      );
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `UptimeKuma fetch failed: ${res.status}`, detail: text.slice(0, 300) },
        { status: 500 }
      );
    }

    const raw = await res.json();

    // Normalization attempt (best-effort):
    // Kuma status page JSON typicky obsahuje seznam monitorů a jejich status.
    // Proto děláme tolerantní mapování.
    const items: any[] =
      raw?.publicGroupList?.flatMap((g: any) => g?.monitorList ?? []) ??
      raw?.monitorList ??
      raw?.monitors ??
      [];

    const monitors = items.map((m: any) => {
      // status mapping: Kuma často používá 1=up, 0=down (nebo string)
      const stRaw = m?.status ?? m?.active ?? m?.statusCode;
      const st =
        stRaw === 1 || stRaw === "up"
          ? "up"
          : stRaw === 0 || stRaw === "down"
          ? "down"
          : "unknown";

      return {
        id: String(m?.id ?? m?.monitorID ?? m?.name ?? Math.random()),
        name: String(m?.name ?? m?.monitorName ?? "monitor"),
        status: st,
        url: m?.url ?? m?.href,
        raw: m,
      };
    });

    const summary = {
      total: monitors.length,
      up: monitors.filter((m) => m.status === "up").length,
      down: monitors.filter((m) => m.status === "down").length,
    };

    const overall = summary.down > 0 ? "down" : summary.up > 0 ? "up" : "unknown";

    return NextResponse.json(
      {
        provider: "uptimekuma",
        overall,
        summary,
        monitors,
        raw,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("api/status/uptimekuma error:", err);
    return NextResponse.json({ error: "uptimekuma status failed" }, { status: 500 });
  }
}