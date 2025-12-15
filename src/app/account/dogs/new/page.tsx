"use client";

import { Box, Typography } from "@mui/material";
import DogForm from "../../../components/dog-form";

export default function NewDogPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Přidat nového psa
      </Typography>

      <DogForm mode="create" />
    </Box>
  );
}
