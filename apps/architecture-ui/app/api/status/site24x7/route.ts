import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const base = (process.env.SITE24X7_API_BASE || "https://www.site24x7.com/api/").replace(/\/$/, "");
    const token = process.env.SITE24X7_OAUTH_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "SITE24X7_OAUTH_TOKEN missing" },
        { status: 500 }
      );
    }

    // Example endpoint: monitors (může se lišit podle account/region)
    const res = await fetch(`${base}/monitors`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Site24x7 fetch failed: ${res.status}`, detail: text.slice(0, 300) },
        { status: 500 }
      );
    }

    const raw = await res.json();

    const list: any[] = raw?.data ?? raw?.monitors ?? raw ?? [];

    // Best-effort normalization; status pole se může jmenovat různě.
    const monitors = list.map((m: any) => {
      const stRaw = m?.status ?? m?.current_status ?? m?.state;
      const st =
        stRaw === "Up" || stRaw === "UP" || stRaw === 1
          ? "up"
          : stRaw === "Down" || stRaw === "DOWN" || stRaw === 0
          ? "down"
          : "unknown";

      return {
        id: String(m?.monitor_id ?? m?.id ?? m?.display_name ?? Math.random()),
        name: String(m?.display_name ?? m?.name ?? "monitor"),
        status: st,
        url: m?.website ?? m?.url,
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
        provider: "site24x7",
        overall,
        summary,
        monitors,
        raw,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("api/status/site24x7 error:", err);
    return NextResponse.json({ error: "site24x7 status failed" }, { status: 500 });
  }
}