// lib/AllDialogs.tsx

"use client";

import * as React from "react";
import SupportDialog from "@/app/components/support-dialog";

interface AllDialogsProps {
  currentDialog: string | null;
  onClose: () => void;
}

export default function AllDialogs({ currentDialog, onClose }: AllDialogsProps) {
  return (
    <>
      {/* Pokud currentDialog === "supportDialog", vykreslí se SupportDialog */}
      <SupportDialog
        open={currentDialog === "supportDialog"}
        onClose={onClose}
      />

      {/* Sem lze přidat další dialogy: 
      {currentDialog === "jinydialog" && <JinyDialog open onClose={onClose} />} */}
    </>
  );
}
