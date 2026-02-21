"use client";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Profile() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div>
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
  );
}
