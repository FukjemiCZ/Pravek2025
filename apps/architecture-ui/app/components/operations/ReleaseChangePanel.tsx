"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReactMarkdown from "react-markdown";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";

function iso(d: any) {
  const t = Date.parse(String(d ?? ""));
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toISOString().replace("T", " ").replace("Z", " UTC");
}

function shortSha(sha?: string) {
  return sha ? sha.slice(0, 7) : "—";
}

function firstLine(s: any) {
  const str = String(s ?? "");
  return str.split("\n")[0] ?? str;
}

function normalizeReleaseBody(body: any) {
  const s = String(body ?? "").trim();
  return s || "_No release notes._";
}

function Markdown({ value }: { value: string }) {
  return (
    <Box
      sx={{
        // basic readable markdown styling
        "& h1": { fontSize: 22, fontWeight: 900, mt: 1, mb: 1 },
        "& h2": { fontSize: 18, fontWeight: 900, mt: 1.5, mb: 1 },
        "& h3": { fontSize: 16, fontWeight: 800, mt: 1.25, mb: 0.75 },
        "& p": { m: 0, mb: 1.25, lineHeight: 1.6 },
        "& ul": { mt: 0, mb: 1.25, pl: 3 },
        "& ol": { mt: 0, mb: 1.25, pl: 3 },
        "& li": { mb: 0.5 },
        "& blockquote": {
          m: 0,
          mb: 1.25,
          pl: 2,
          borderLeft: "4px solid",
          borderColor: "divider",
          opacity: 0.9,
        },
        "& code": {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 12,
          bgcolor: "rgba(0,0,0,0.04)",
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
        },
        "& pre": {
          m: 0,
          mb: 1.25,
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          overflow: "auto",
          fontSize: 12,
        },
        "& pre code": {
          bgcolor: "transparent",
          p: 0,
        },
        "& a": { color: "primary.main" },
        "& hr": { border: 0, borderTop: "1px solid", borderColor: "divider", my: 2 },
      }}
    >
      <ReactMarkdown
        components={{
          // Use MUI Link for anchors
          a: ({ href, children, ...props }) => (
            <MuiLink href={href} target="_blank" rel="noreferrer" {...props}>
              {children}
            </MuiLink>
          ),
          // Ensure headings use Typography semantics if needed
          h1: ({ children }) => <Typography component="h1">{children}</Typography>,
          h2: ({ children }) => <Typography component="h2">{children}</Typography>,
          h3: ({ children }) => <Typography component="h3">{children}</Typography>,
          p: ({ children }) => <Typography component="p">{children}</Typography>,
        }}
      >
        {value}
      </ReactMarkdown>
    </Box>
  );
}

export default function ReleaseChangePanel({
  baseSha,
  headSha,
}: {
  baseSha?: string;
  headSha?: string;
}) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const queryUrl = useMemo(() => {
    const u = new URL("/api/changes", window.location.origin);
    if (baseSha && headSha) {
      u.searchParams.set("base", baseSha);
      u.searchParams.set("head", headSha);
    }
    return u.toString();
  }, [baseSha, headSha]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        setData(null);
        const res = await fetch(queryUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`changes api failed: ${res.status}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? String(e));
      }
    }

    load();
    const t = setInterval(load, 120_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [queryUrl]);

  const mergedPRs = data?.mergedPRs ?? [];
  const releases = data?.releases ?? [];
  const commits = data?.commits ?? [];
  const compare = data?.compare ?? null;

  const filteredPRs = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return mergedPRs;
    return mergedPRs.filter((p: any) => {
      const hay = `${p.title ?? ""} ${p.number ?? ""} ${(p.labels ?? [])
        .map((l: any) => l.name)
        .join(" ")} ${p.user?.login ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [mergedPRs, q]);

  const autoNotes = useMemo(() => {
    const list = (compare?.commits ?? []).map((c: any) => ({
      sha: c?.sha,
      message: firstLine(c?.commit?.message),
      url: c?.html_url,
      author: c?.commit?.author?.name,
      date: c?.commit?.author?.date,
    }));

    const seen = new Set<string>();
    const uniq: any[] = [];
    for (const x of list) {
      const k = `${x.message}`.trim();
      if (!k) continue;
      if (seen.has(k)) continue;
      seen.add(k);
      uniq.push(x);
    }
    return uniq.slice(0, 50);
  }, [compare]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading releases & changes…" />;

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Release & Change Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Releases (markdown notes), merged PRs, commits.{" "}
              {baseSha && headSha ? "Compare mode enabled." : ""}
            </Typography>
          </Box>

          <TextField
            size="small"
            label="Search PRs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Box>

        {baseSha && headSha && (
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={`base: ${shortSha(baseSha)}`} size="small" variant="outlined" />
            <Chip label={`head: ${shortSha(headSha)}`} size="small" variant="outlined" />
            {compare?.html_url && (
              <Chip
                label="GitHub compare"
                size="small"
                variant="outlined"
                component="a"
                href={compare.html_url}
                clickable
              />
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* FULL WIDTH: Releases + markdown notes */}
        <Typography sx={{ fontWeight: 900, mb: 1 }}>Releases (with notes)</Typography>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 1,
            mb: 2,
          }}
        >
          {(releases ?? []).slice(0, 10).map((r: any) => (
            <Accordion key={r.id} disableGutters sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <Chip size="small" label={r.tag_name ?? "release"} variant="outlined" />
                  <Typography sx={{ fontWeight: 800 }}>
                    {r.name ?? r.tag_name ?? "Release"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    · {iso(r.published_at)}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
                  {r.html_url && (
                    <MuiLink href={r.html_url} target="_blank" rel="noreferrer">
                      Open on GitHub
                    </MuiLink>
                  )}
                  {r.tarball_url && (
                    <MuiLink href={r.tarball_url} target="_blank" rel="noreferrer">
                      Tarball
                    </MuiLink>
                  )}
                </Box>

                <Typography sx={{ fontWeight: 800, mb: 1 }}>Release notes</Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    maxHeight: 520,
                    overflow: "auto",
                  }}
                >
                  <Markdown value={normalizeReleaseBody(r.body)} />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* PRs + Commits */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Merged PRs ({filteredPRs.length})
            </Typography>

            <List
              dense
              sx={{
                maxHeight: 420,
                overflow: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              {filteredPRs.slice(0, 40).map((p: any) => (
                <ListItem key={p.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip size="small" label={`#${p.number}`} variant="outlined" />
                        <Typography sx={{ fontWeight: 700 }}>{p.title ?? "PR"}</Typography>
                      </Box>
                    }
                    secondary={
                      p.html_url ? (
                        <MuiLink href={p.html_url} target="_blank" rel="noreferrer">
                          Open · updated {iso(p.updated_at)}
                        </MuiLink>
                      ) : `updated ${iso(p.updated_at)}`
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>Commits (main)</Typography>

            <List
              dense
              sx={{
                maxHeight: 420,
                overflow: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              {(commits ?? []).slice(0, 40).map((c: any) => (
                <ListItem key={c.sha} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip size="small" label={shortSha(c.sha)} variant="outlined" />
                        <Typography sx={{ fontWeight: 700 }}>
                          {firstLine(c?.commit?.message) || "commit"}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      c.html_url ? (
                        <MuiLink href={c.html_url} target="_blank" rel="noreferrer">
                          Open · {iso(c?.commit?.author?.date)}
                        </MuiLink>
                      ) : iso(c?.commit?.author?.date)
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

        {/* Compare auto notes */}
        {compare && (
          <>
            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Changes between {shortSha(compare?.base_commit?.sha)} → {shortSha(compare?.head_commit?.sha)}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
              Total commits: {compare?.total_commits ?? "—"} · Auto-notes derived from commit messages.
            </Typography>

            <Typography sx={{ fontWeight: 900, mb: 1 }}>Auto release notes</Typography>
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
              <List dense sx={{ m: 0, maxHeight: 280, overflow: "auto" }}>
                {autoNotes.map((x: any) => (
                  <ListItem key={x.sha} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                          <Chip size="small" label={shortSha(x.sha)} variant="outlined" />
                          <Typography sx={{ fontWeight: 700 }}>{x.message}</Typography>
                        </Box>
                      }
                      secondary={
                        x.url ? (
                          <MuiLink href={x.url} target="_blank" rel="noreferrer">
                            Open commit · {iso(x.date)}
                          </MuiLink>
                        ) : iso(x.date)
                      }
                    />
                  </ListItem>
                ))}
                {autoNotes.length === 0 && (
                  <ListItem>
                    <ListItemText primary="—" />
                  </ListItem>
                )}
              </List>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}