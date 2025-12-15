"use client";

import { Box, Typography } from "@mui/material";
import PartnerForm from "../../../components/partner-form"

export default function NewPartnerPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Přidat osobu
      </Typography>

      <PartnerForm mode="create" />
    </Box>
  );
}
