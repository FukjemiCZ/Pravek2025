"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Mode = "business" | "technical";

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
};

const ModeContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "arch-ui.mode";

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("business");

  useEffect(() => {
    // restore
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Mode | null;
      if (saved === "business" || saved === "technical") setModeState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // ignore
    }
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode(): Ctx {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside <ModeProvider>");
  return ctx;
}