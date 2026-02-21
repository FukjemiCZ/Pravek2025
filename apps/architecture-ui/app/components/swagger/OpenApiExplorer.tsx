"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type OpenAPIDoc = {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  servers?: Array<{ url: string }>;
  tags?: Array<{ name: string; description?: string }>;
  paths?: Record<
    string,
    Partial<
      Record<
        "get" | "post" | "put" | "patch" | "delete",
        {
          tags?: string[];
          summary?: string;
          description?: string;
          operationId?: string;
          parameters?: any[];
          requestBody?: any;
          responses?: any;
        }
      >
    >
  >;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
};

function defaultWebOpenApiUrl() {
  // override přes env (Vercel)
  // Prefer server-only env do route? Tady je klientská komponenta, takže NEXT_PUBLIC_*
  return (
    process.env.NEXT_PUBLIC_WEB_OPENAPI_URL ||
    "https://fukjemicz.github.io/Pravek2025/openapi/web/openapi.json"
  );
}

function methodColor(m: string) {
  switch (m) {
    case "get":
      return "success";
    case "post":
      return "primary";
    case "put":
      return "warning";
    case "patch":
      return "warning";
    case "delete":
      return "error";
    default:
      return "default";
  }
}

function shortJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

export default function OpenApiExplorer() {
  const [doc, setDoc] = useState<OpenAPIDoc | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("all");

  const url = defaultWebOpenApiUrl();

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        setDoc(null);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch OpenAPI: ${res.status}`);
        const json = (await res.json()) as OpenAPIDoc;
        if (alive) setDoc(json);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? String(e));
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [url]);

  const endpoints = useMemo(() => {
    const out: Array<{
      path: string;
      method: string;
      tags: string[];
      summary?: string;
      description?: string;
      operationId?: string;
      parameters?: any[];
      requestBody?: any;
      responses?: any;
    }> = [];

    const paths = doc?.paths ?? {};
    for (const [p, ops] of Object.entries(paths)) {
      for (const m of ["get", "post", "put", "patch", "delete"] as const) {
        const op = ops?.[m];
        if (!op) continue;
        out.push({
          path: p,
          method: m,
          tags: op.tags ?? [],
          summary: op.summary,
          description: op.description,
          operationId: op.operationId,
          parameters: op.parameters,
          requestBody: op.requestBody,
          responses: op.responses,
        });
      }
    }

    out.sort(
      (a, b) =>
        a.path.localeCompare(b.path) ||
        a.method.localeCompare(b.method) ||
        (a.summary ?? "").localeCompare(b.summary ?? "")
    );

    return out;
  }, [doc]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const e of endpoints) for (const t of e.tags) s.add(t);
    return ["all", ...Array.from(s).sort()];
  }, [endpoints]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return endpoints.filter((e) => {
      if (tag !== "all" && !e.tags.includes(tag)) return false;
      if (!qq) return true;
      const hay = `${e.method} ${e.path} ${e.summary ?? ""} ${e.description ?? ""} ${e.tags.join(" ")}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [endpoints, q, tag]);

  const schemas = useMemo(() => {
    const s = doc?.components?.schemas ?? {};
    const keys = Object.keys(s).sort();
    return keys.map((k) => ({ name: k, schema: s[k] }));
  }, [doc]);

  if (err) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          API Docs (Web)
        </Typography>
        <Typography color="error">{err}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
          URL: {url}
        </Typography>
      </Box>
    );
  }

  if (!doc) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          API Docs (Web)
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Loading OpenAPI…
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mt: 1 }}>
          URL: {url}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          API Docs (Web)
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          {doc?.info?.title ?? "OpenAPI"} · v{doc?.info?.version ?? "—"}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
        Source: <code>{url}</code>
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {allTags.map((t) => (
              <Chip
                key={t}
                label={t}
                variant={t === tag ? "filled" : "outlined"}
                color={t === tag ? "primary" : "default"}
                size="small"
                onClick={() => setTag(t)}
              />
            ))}
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Search endpoints"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
            Endpoints: {filtered.length} / {endpoints.length}
          </Typography>

          {filtered.map((e) => (
            <Accordion key={`${e.method}:${e.path}`} disableGutters sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    label={e.method.toUpperCase()}
                    color={methodColor(e.method) as any}
                    variant="outlined"
                  />
                  <Typography sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                    {e.path}
                  </Typography>
                  {e.summary && (
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      — {e.summary}
                    </Typography>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {e.tags?.length ? (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                    {e.tags.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Box>
                ) : null}

                {e.description && (
                  <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
                    {e.description}
                  </Typography>
                )}

                <Divider sx={{ my: 1 }} />

                <Typography sx={{ fontWeight: 800, mb: 1 }}>Request</Typography>
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
                    maxHeight: 220,
                    fontSize: 12,
                  }}
                >
                  {shortJson({ parameters: e.parameters ?? [], requestBody: e.requestBody ?? null })}
                </Box>

                <Typography sx={{ fontWeight: 800, mt: 2, mb: 1 }}>Responses</Typography>
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
                    maxHeight: 280,
                    fontSize: 12,
                  }}
                >
                  {shortJson(e.responses ?? {})}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        <Grid item xs={12} lg={5}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            Data model (schemas)
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
            From <code>components.schemas</code>
          </Typography>

          <Box sx={{ maxHeight: "calc(100vh - 260px)", overflow: "auto", pr: 1 }}>
            {schemas.length === 0 && (
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                No schemas in this OpenAPI document.
              </Typography>
            )}

            {schemas.map((s) => (
              <Accordion key={s.name} disableGutters sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                    {s.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                      maxHeight: 380,
                      fontSize: 12,
                    }}
                  >
                    {shortJson(s.schema)}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}