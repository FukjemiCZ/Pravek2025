import { NextResponse } from "next/server";
import { z } from "zod";
import { loginAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Neplatné přihlašovací údaje.", 400);
  const admin = await loginAdmin(parsed.data.email, parsed.data.password);
  if (!admin) return jsonError("Nesprávný e-mail nebo heslo.", 401);
  return NextResponse.json({ admin });
}
