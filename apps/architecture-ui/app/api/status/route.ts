import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      api_key: process.env.UPTIMEROBOT_API_KEY!,
      format: "json"
    })
  });

  return NextResponse.json(await res.json());
}