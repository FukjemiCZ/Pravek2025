"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
} from "@mui/material";

export default function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error ?? "Registrace se nepodařila.");
      } else {
        setSuccessMessage(
          "Účet byl vytvořen. Zkontroluj e-mail pro ověření a pak se můžeš přihlásit."
        );
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Došlo k chybě při komunikaci se serverem.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      component="section"
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        maxWidth: 480,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Registrace nového účastníka
      </Typography>

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <TextField
          label="Jméno (nepovinné)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Heslo"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        {errorMessage && (
          <Alert severity="error">{errorMessage}</Alert>
        )}

        {successMessage && (
          <Alert severity="success">{successMessage}</Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? "Probíhá registrace…" : "Registrovat"}
        </Button>
      </Stack>
    </Box>
  );
}
