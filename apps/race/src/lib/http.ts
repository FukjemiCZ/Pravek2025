import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function guarded<T>(handler: () => Promise<T>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Nejste přihlášený administrátor.", 401);
    }
    console.error(error);
    return jsonError("Interní chyba serveru.", 500);
  }
}
