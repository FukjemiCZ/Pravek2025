// lib/DialogContext.tsx

"use client";
import AllDialogs from "@/app/lib/all-dialogs";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type DialogKey = string | null;

interface DialogContextValue {
  openDialog: (dialogKey: string) => void;
  closeDialog: () => void;
  currentDialog: DialogKey;
}

const DialogContext = createContext<DialogContextValue>({
  openDialog: () => {},
  closeDialog: () => {},
  currentDialog: null,
});

export function useDialog() {
  return useContext(DialogContext);
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [currentDialog, setCurrentDialog] = useState<DialogKey>(null);

  const openDialog = (dialogKey: string) => {
    setCurrentDialog(dialogKey);
  };

  const closeDialog = () => {
    setCurrentDialog(null);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, currentDialog }}>
      {children}
      {/* Sem vykreslíme všechny dialogy, které chceme mít dostupné
          a případně je zobrazíme podle toho, co je v currentDialog */}
      <AllDialogs currentDialog={currentDialog} onClose={closeDialog} />
    </DialogContext.Provider>
  );
}
