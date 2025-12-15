"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

interface PartnerFormProps {
  mode: "create" | "edit";
  person?: {
    id: string;
    name: string;
    relationship: "self" | "partner" | "child";
    email?: string;
  };
}

export default function PartnerForm({ mode, person }: PartnerFormProps) {
  const [form, setForm] = useState({
    name: person?.name || "",
    relationship: person?.relationship || "partner",
    email: person?.email || "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (mode === "create") {
      console.log("Create partner:", form);
    } else {
      console.log("Edit partner:", form);
    }
  };

  return (
    <Card>
      <CardContent>
        <TextField
          fullWidth
          label="Jméno"
          sx={{ mb: 2 }}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <TextField
          fullWidth
          select
          label="Vztah"
          sx={{ mb: 2 }}
          value={form.relationship}
          onChange={(e) => handleChange("relationship", e.target.value)}
        >
          <MenuItem value="partner">Partner/ka</MenuItem>
          <MenuItem value="child">Dítě</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Email (nepovinný)"
          sx={{ mb: 2 }}
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          {mode === "create" ? "Přidat osobu" : "Uložit změny"}
        </Button>
      </CardContent>
    </Card>
  );
}
