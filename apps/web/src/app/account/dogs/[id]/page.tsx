  
"use client"; // musíme být client component, abychom mohli použít useParams

import { Box, Typography } from "@mui/material";
import DogForm from "../../../components/dog-form";
import { useParams, useSearchParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();

  const dogId = params.id as string;
  const moveMode = searchParams.get("move") === "1";

  const dog = {
    id: dogId,
    name: "Ben",
    birthDate: "2019-07-12",
    chip: "123456789",
    breed: "Labrador",
    ownerId: "1",
  };

  return (
    <Box sx={{ py: 4 }}>
      {moveMode ? (
        <>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Přesunout psa: {dog.name}
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Vyberte osobu, ke které bude pes přiřazen.
          </Typography>

          <DogForm mode="move" dog={dog} />
        </>
      ) : (
        <>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Upravit psa: {dog.name}
          </Typography>

          <DogForm mode="edit" dog={dog} />
        </>
      )}
    </Box>
  );
}
