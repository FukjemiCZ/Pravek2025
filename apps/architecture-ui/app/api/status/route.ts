import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseRatios(v: unknown) {
  // custom_uptime_ratios přijde typicky jako "99.99-99.95-..."
  const s = typeof v === "string" ? v : "";
  return s
    .split("-")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x));
}

export async function GET() {
  try {
    const apiKey = process.env.UPTIMEROBOT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "UPTIMEROBOT_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = new URLSearchParams({
      api_key: apiKey,
      format: "json",

      // ✅ detailní data:
      all_time_uptime_ratio: "1",
      custom_uptime_ratios: "1-7-30-90",

      response_times: "1",
      response_times_limit: "24", // posledních 24 bodů (dle API může být min/hod interval)

      logs: "1",
      logs_limit: "20",

      // volitelně: alert_contacts: "1"
    });

    const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `UptimeRobot failed: ${res.status}`, detail: text.slice(0, 300) },
        { status: 500 }
      );
    }

    const raw = await res.json();
    const monitors = Array.isArray(raw?.monitors) ? raw.monitors : [];

    // overall: down pokud je něco v down-ish stavu (2=up, 0=paused)
    const anyDown = monitors.some((m: any) => m?.status !== 2 && m?.status !== 0);
    const overall = anyDown ? "down" : "up";

    // agregace: průměrné uptime ratio za 30 dní (pokud je k dispozici)
    // UptimeRobot vrací custom_uptime_ratio a/nebo all_time_uptime_ratio na monitoru
    const ratios30 = monitors
      .map((m: any) => {
        const arr = parseRatios(m?.custom_uptime_ratio);
        // pořadí odpovídá custom_uptime_ratios: 1-7-30-90 => index 2 je 30d
        return arr[2];
      })
      .filter((x: any) => typeof x === "number" && !Number.isNaN(x));

    const avg30d =
      ratios30.length > 0
        ? Math.round((ratios30.reduce((a: number, b: number) => a + b, 0) / ratios30.length) * 1000) / 1000
        : null;

    return NextResponse.json(
      {
        overall,
        avg30d,
        monitors,
        raw,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("api/status error:", err);
    return NextResponse.json({ error: "status fetch failed" }, { status: 500 });
  }
}