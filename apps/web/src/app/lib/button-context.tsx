// lib/ButtonContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface ButtonItem {
  id: string;
  label: string;
  variant: string;
  color: string;
  status: "Skryté" | "Zakázané" | "Funkční";
  actionType: "dialog" | "navigate" | "externalLink" | "apiCall";
  actionPayload: string;
  dialogComponent: string | null;
  iconName: string | null;
}

interface ButtonsContextValue {
  buttons: Record<string, ButtonItem>;
  loading: boolean;
  error: string | null;
}

const ButtonsContext = createContext<ButtonsContextValue>({
  buttons: {},
  loading: true,
  error: null,
});

export function useButtons() {
  return useContext(ButtonsContext);
}

export function ButtonsProvider({ children }: { children: ReactNode }) {
  const [buttons, setButtons] = useState<Record<string, ButtonItem>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchButtons = async () => {
      try {
        const res = await fetch("/api/buttons");
        if (!res.ok) {
          throw new Error(`Chyba při načítání: ${res.status}`);
        }
        const data: ButtonItem[] = await res.json();
        const map: Record<string, ButtonItem> = {};
        data.forEach((item) => {
          map[item.id] = item;
        });
        setButtons(map);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchButtons();
  }, []);

  return (
    <ButtonsContext.Provider value={{ buttons, loading, error }}>
      {children}
    </ButtonsContext.Provider>
  );
}
