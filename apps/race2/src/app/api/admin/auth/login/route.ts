import { NextResponse } from "next/server";
import { z } from "zod";
import { loginAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  const input = schema.safeParse(await request.json());
  if (!input.success) return jsonError("Neplatné přihlašovací údaje.", 400);
  const user = await loginAdmin(input.data.email, input.data.password);
  if (!user) return jsonError("Nesprávný e-mail nebo heslo.", 401);
  return NextResponse.json({ user });
}
