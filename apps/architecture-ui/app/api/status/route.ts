import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.UPTIMEROBOT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "UPTIMEROBOT_API_KEY missing" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: apiKey,
        format: "json",
        logs: "0",
      }),
      // status měníš často → no-store
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `UptimeRobot failed: ${res.status}`, detail: text.slice(0, 200) },
        { status: 500 }
      );
    }

    const data = await res.json();
    const monitors = Array.isArray(data?.monitors) ? data.monitors : [];

    // UptimeRobot status: 2=up, 9=down, 8=seems down, 0=paused
    const anyDown = monitors.some((m: any) => m?.status !== 2 && m?.status !== 0);
    const overall = anyDown ? "down" : "up";

    return NextResponse.json(
      {
        overall,
        monitors,
        raw: data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("api/status error:", err);
    return NextResponse.json({ error: "status fetch failed" }, { status: 500 });
  }
}