"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

interface DogFormProps {
  mode: "create" | "edit" | "move";
  dog?: {
    id: string;
    name: string;
    birthDate: string;
    chip: string;
    breed: string;
    ownerId: string;
  };
}

export default function DogForm({ mode, dog }: DogFormProps) {
  const [form, setForm] = useState({
    name: dog?.name || "",
    birthDate: dog?.birthDate || "",
    chip: dog?.chip || "",
    breed: dog?.breed || "",
    ownerId: dog?.ownerId || "",
  });

  // MOCK osoby – nahradíš API daty
  const people = [
    { id: "1", name: "Jan Novák" },
    { id: "2", name: "Eva Nováková" },
    { id: "3", name: "Petr Novák (dítě)" },
  ];

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    if (mode === "create") {
      console.log("Create dog:", form);
    }
    if (mode === "edit") {
      console.log("Edit dog:", form);
    }
    if (mode === "move") {
      console.log("Move dog to:", form.ownerId);
    }
  };

  return (
    <Card>
      <CardContent>
        {mode !== "move" && (
          <>
            <TextField
              fullWidth
              label="Jméno psa"
              sx={{ mb: 2 }}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <TextField
              fullWidth
              label="Datum narození"
              type="date"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              value={form.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />

            <TextField
              fullWidth
              label="Číslo čipu"
              sx={{ mb: 2 }}
              value={form.chip}
              onChange={(e) => handleChange("chip", e.target.value)}
            />

            <TextField
              fullWidth
              label="Plemeno"
              sx={{ mb: 2 }}
              value={form.breed}
              onChange={(e) => handleChange("breed", e.target.value)}
            />

            <Typography sx={{ mt: 3, mb: 1 }} fontWeight="bold">
              Přiřazená osoba
            </Typography>
          </>
        )}

        {/* MOVE MODE */}
        <TextField
          fullWidth
          select
          label="Vyberte osobu"
          sx={{ mb: 3 }}
          value={form.ownerId}
          onChange={(e) => handleChange("ownerId", e.target.value)}
        >
          {people.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          {mode === "create" && "Přidat psa"}
          {mode === "edit" && "Uložit změny"}
          {mode === "move" && "Přesunout psa"}
        </Button>
      </CardContent>
    </Card>
  );
}
