import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "race_admin_session";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(value);
}

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secret());
    const id = String(verified.payload.sub || "");
    if (!id) return null;
    return prisma.adminUser.findUnique({ where: { id }, select: { id: true, email: true, name: true } });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
