"use client";
import { FormEvent, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@pravek-v-raji.cz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) { setError("Přihlášení selhalo."); return; }
    window.location.href = "/admin";
  }

  return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
    <Container maxWidth="sm">
      <Card><CardContent><form onSubmit={submit}><Stack spacing={2}>
        <Typography variant="h4" fontWeight={900}>Pravěk Race Admin</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Heslo" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" size="large">Přihlásit</Button>
      </Stack></form></CardContent></Card>
    </Container>
  </Box>;
}
