"use client";

import { Box, Typography } from "@mui/material";
import PartnerForm from "../../../components/partner-form";
import { useParams } from "next/navigation";

export default function EditPartnerPage() {
  const params = useParams();
  const id = params.id as string;

  // MOCK – nahradíš API voláním
  const person: {
    id: string;
    name: string;
    relationship: "self" | "partner" | "child";
    email?: string;
  } = {
    id,
    name: "Eva Nováková",
    relationship: "partner",
    email: "",
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Upravit osobu
      </Typography>

      <PartnerForm mode="edit" person={person} />
    </Box>
  );
}
