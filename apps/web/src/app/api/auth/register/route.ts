import { NextRequest, NextResponse } from "next/server";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_MGMT_CLIENT_ID = process.env.AUTH0_MGMT_CLIENT_ID!;
const AUTH0_MGMT_CLIENT_SECRET = process.env.AUTH0_MGMT_CLIENT_SECRET!;
const AUTH0_DB_CONNECTION =
  process.env.AUTH0_DB_CONNECTION ?? "Username-Password-Authentication";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email a heslo jsou povinné." },
        { status: 400 }
      );
    }

    // 1) Získat token pro Management API (client_credentials)
    const tokenRes = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: AUTH0_MGMT_CLIENT_ID,
        client_secret: AUTH0_MGMT_CLIENT_SECRET,
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Auth0 token error:", errorText);
      return NextResponse.json(
        { error: "Chyba při komunikaci s Auth0 (token)." },
        { status: 500 }
      );
    }

    const { access_token } = (await tokenRes.json()) as {
      access_token: string;
    };

    // 2) Vytvořit uživatele
    const userRes = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        email,
        password,
        connection: AUTH0_DB_CONNECTION,
        name,
        verify_email: true, // pošle ověřovací e-mail
      }),
    });

    const data = await userRes.json();

    if (!userRes.ok) {
      console.error("Auth0 create user error:", data);
      return NextResponse.json(
        { error: data.message ?? "Chyba při vytváření uživatele." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      user_id: data.user_id,
    });
  } catch (e) {
    console.error("Unexpected error in register route:", e);
    return NextResponse.json(
      { error: "Neočekávaná chyba na serveru." },
      { status: 500 }
    );
  }
}
