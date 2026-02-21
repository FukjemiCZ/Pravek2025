"use client";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useMode } from "./ModeContext";
import type { Mode } from "./ModeContext";

export default function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={mode}
      onChange={(_, val: Mode | null) => {
        if (!val) return;
        setMode(val);
      }}
    >
      <ToggleButton value="business">Business</ToggleButton>
      <ToggleButton value="technical">Technical</ToggleButton>
    </ToggleButtonGroup>
  );
}