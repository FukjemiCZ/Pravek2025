"use client";

import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@pravek.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const res = await fetch("/api/admin/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) { setError("Přihlášení se nepodařilo."); return; }
    window.location.href = "/admin";
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={800}>Administrace závodu</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Heslo" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
            <Button variant="contained" size="large" onClick={submit}>Přihlásit</Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
