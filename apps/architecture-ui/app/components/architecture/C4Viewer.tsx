"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Link, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SectionCard from "@/app/components/shared/SectionCard";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

type View = "context" | "container";

export default function C4Viewer({
  contextUrl,
  containerUrl,
}: {
  contextUrl: string;
  containerUrl: string;
}) {
  const [view, setView] = useState<View>("container");
  const [text, setText] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const url = useMemo(() => (view === "context" ? contextUrl : containerUrl), [view, contextUrl, containerUrl]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        setText("");
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const t = await res.text();
        if (alive) setText(t);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? String(e));
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [url]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <SectionCard
      title="C4 diagrams"
      subtitle="Mermaid C4 source (context/container). Reliable display + copy for Structurizr/Mermaid tooling."
      actions={
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => setView("context")} disabled={view === "context"}>
            Context
          </Button>
          <Button onClick={() => setView("container")} disabled={view === "container"}>
            Container
          </Button>
          <Button onClick={onCopy} disabled={!text} title="Copy source">
            <ContentCopyIcon fontSize="small" />
          </Button>
        </ButtonGroup>
      }
    >
      <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
        Source:{" "}
        <Link href={url} target="_blank" rel="noreferrer">
          open
        </Link>
      </Typography>

      {err && <ErrorState message={err} />}
      {!err && !text && <LoadingState label="Loading C4 source…" />}

      {!!text && (
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            overflow: "auto",
            maxHeight: 520,
            fontSize: 12,
          }}
        >
          {text}
        </Box>
      )}
    </SectionCard>
  );
}