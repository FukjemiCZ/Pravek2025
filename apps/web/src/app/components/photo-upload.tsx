"use client";

import { useRef } from "react";
import { Button } from "@mui/material";

interface Props {
  onSelect: (file: File) => void;
  label?: string;
}

export default function PhotoUpload({ onSelect, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        onClick={handleClick}
        sx={{ mt: 1 }}
      >
        {label || "Potvrdit fotkou"}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}
