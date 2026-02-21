import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.UPTIMEROBOT_API_KEY;

  const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      api_key: apiKey!,
      format: "json",
      logs: "0"
    })
  });

  const data = await res.json();

  return NextResponse.json(data);
}