import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { guarded } from "@/lib/http";

export async function GET() {
  return guarded(async () => {
    const user = await requireAdmin();
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  });
}
