import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.UPTIMEROBOT_API_KEY;

  const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `api_key=${apiKey}&format=json`,
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Status fetch failed" }, { status: 500 });
  }

  const data = await res.json();

  return NextResponse.json(data);
}