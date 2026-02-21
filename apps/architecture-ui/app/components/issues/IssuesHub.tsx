"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoadingState from "@/app/components/shared/LoadingState";
import ErrorState from "@/app/components/shared/ErrorState";
import IssueBodyDialog from "@/app/components/issues/IssueBodyDialog";
import ReactionsChips from "@/app/components/issues/ReactionsChips";

type IssueItem = any;

function extractChildIssueNumbersFromBody(body?: string | null): number[] {
  if (!body) return [];
  // - [ ] #123 or - [x] owner/repo#123
  const re =
    /-\s*\[[ xX]\]\s*(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#(\d+)/g;
  const out: number[] = [];
  let m;
  while ((m = re.exec(body))) out.push(Number(m[1]));
  return Array.from(new Set(out)).filter((n) => Number.isFinite(n));
}

function buildGithubTree(items: IssueItem[]) {
  const byNum = new Map<number, any>();
  for (const it of items) {
    if (typeof it?.number === "number") byNum.set(it.number, { ...it, children: [] as any[] });
  }

  const childNums = new Set<number>();

  for (const it of byNum.values()) {
    const kids = extractChildIssueNumbersFromBody(it.body);
    for (const k of kids) {
      const child = byNum.get(k);
      if (child) {
        it.children.push(child);
        childNums.add(k);
      }
    }
  }

  const roots = Array.from(byNum.values()).filter((it) => !childNums.has(it.number));
  // Sort: most recently updated first
  roots.sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
  // Sort children too
  for (const r of roots) {
    r.children.sort((a: any, b: any) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
  }
  return roots;
}

function stateChip(state: string) {
  const s = String(state ?? "open");
  const upper = s.toUpperCase();
  const color =
    s === "open" ? "warning" : s === "closed" || s === "merged" ? "success" : "default";
  return <Chip size="small" label={upper} color={color as any} variant="outlined" />;
}

export default function IssuesHub() {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"all" | "openproject" | "github">("all");

  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    url?: string;
    body?: string | null;
  }>({ open: false, title: "" });

  const url = useMemo(() => {
    const u = new URL("/api/issues", window.location.origin);
    if (q.trim()) u.searchParams.set("q", q.trim());
    u.searchParams.set("limit", "60");
    return u.toString();
  }, [q]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setErr(null);
        const res = await fetch(url, { cache: "no-store" });

        // Allow 503 payload (degraded: no sources). UI will show error state.
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.detail || json?.error || `issues api failed: ${res.status}`);

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
  }, [url]);

  const items = useMemo(() => {
    const list: IssueItem[] = data?.items ?? [];
    return list.filter((x) => (source === "all" ? true : x.source === source));
  }, [data, source]);

  const ghItems = useMemo(() => items.filter((x) => x.source === "github"), [items]);
  const opItems = useMemo(() => items.filter((x) => x.source === "openproject"), [items]);

  const ghTree = useMemo(() => buildGithubTree(ghItems), [ghItems]);

  if (err) return <ErrorState message={err} />;
  if (!data) return <LoadingState label="Loading issues…" />;

  const warnings: string[] = data?.warnings ?? [];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Issues Hub
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            Unified view: OpenProject work packages + GitHub issues/PRs. GitHub supports sub-issues via task lists.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Chip
            label={`All: ${data?.totals?.all ?? 0}`}
            variant="outlined"
            onClick={() => setSource("all")}
            clickable
            color={source === "all" ? "primary" : "default"}
          />
          <Chip
            label={`OpenProject: ${data?.totals?.openproject ?? 0}`}
            variant="outlined"
            onClick={() => setSource("openproject")}
            clickable
            color={source === "openproject" ? "primary" : "default"}
          />
          <Chip
            label={`GitHub: ${data?.totals?.github ?? 0}`}
            variant="outlined"
            onClick={() => setSource("github")}
            clickable
            color={source === "github" ? "primary" : "default"}
          />
        </Box>
      </Box>

      {/* Availability strip */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        <Chip
          size="small"
          variant="outlined"
          color={data?.meta?.github?.ok ? "success" : data?.meta?.github?.enabled ? "warning" : "default"}
          label={`GitHub: ${data?.meta?.github?.ok ? "OK" : data?.meta?.github?.enabled ? "DOWN" : "OFF"}`}
        />
        <Chip
          size="small"
          variant="outlined"
          color={data?.meta?.openproject?.ok ? "success" : data?.meta?.openproject?.enabled ? "warning" : "default"}
          label={`OpenProject: ${data?.meta?.openproject?.ok ? "OK" : data?.meta?.openproject?.enabled ? "DOWN" : "OFF"}`}
        />
        {warnings.length > 0 && (
          <Chip size="small" variant="outlined" color="warning" label={`Warnings: ${warnings.length}`} />
        )}
      </Box>

      {warnings.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {warnings.slice(0, 3).map((w, idx) => (
            <Typography key={idx} variant="body2" sx={{ opacity: 0.75 }}>
              ⚠ {w}
            </Typography>
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* GitHub tree (hierarchy) */}
      {(source === "all" || source === "github") && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>
            GitHub (hierarchy via task list) — roots: {ghTree.length}
          </Typography>

          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            {ghTree.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  —
                </Typography>
              </Box>
            ) : (
              ghTree.map((it: any) => (
                <Accordion key={it.id} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip size="small" label={it.type === "pr" ? "PR" : "ISSUE"} variant="outlined" />
                        <Chip size="small" label={it.key} variant="outlined" />
                        {stateChip(it.state)}
                        {Array.isArray(it.labels) && it.labels.slice(0, 3).map((l: string) => (
                          <Chip key={l} size="small" label={l} variant="outlined" />
                        ))}
                        <Typography sx={{ fontWeight: 800 }}>{it.title}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 1 }}>
                        {it.url && (
                          <Link href={it.url} target="_blank" rel="noreferrer">
                            Open
                          </Link>
                        )}
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Body"
                          clickable
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDialog({ open: true, title: `${it.key} ${it.title}`, url: it.url, body: it.body });
                          }}
                        />
                        {it.assignee && <Chip size="small" variant="outlined" label={`assignee: ${it.assignee}`} />}
                        {Array.isArray(it.linkedIssues) && it.linkedIssues.length > 0 && (
                          <Chip size="small" variant="outlined" label={`links: ${it.linkedIssues.join(", ")}`} />
                        )}
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <ReactionsChips reactions={it.reactions} />
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
                      Sub-issues: {it.children?.length ?? 0}
                    </Typography>

                    {it.children?.length ? (
                      <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        {it.children.map((c: any) => (
                          <ListItem key={c.id} divider>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                  <Chip size="small" label={c.type === "pr" ? "PR" : "ISSUE"} variant="outlined" />
                                  <Chip size="small" label={c.key} variant="outlined" />
                                  {stateChip(c.state)}
                                  <Typography sx={{ fontWeight: 700 }}>{c.title}</Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                  {c.url && (
                                    <Link href={c.url} target="_blank" rel="noreferrer">
                                      Open
                                    </Link>
                                  )}
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label="Body"
                                    clickable
                                    onClick={() =>
                                      setDialog({ open: true, title: `${c.key} ${c.title}`, url: c.url, body: c.body })
                                    }
                                  />
                                  {c.assignee && <Chip size="small" variant="outlined" label={`assignee: ${c.assignee}`} />}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        No sub-issues detected. Use task list in the parent issue body: <code>- [ ] #123</code>
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        </Box>
      )}

      {/* OpenProject flat list */}
      {(source === "all" || source === "openproject") && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>
            OpenProject — items: {opItems.length}
          </Typography>

          <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, maxHeight: "45vh", overflow: "auto" }}>
            {opItems.length === 0 ? (
              <ListItem>
                <ListItemText primary="—" />
              </ListItem>
            ) : (
              opItems.map((x: any) => (
                <ListItem key={x.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip size="small" label="OP" variant="outlined" />
                        <Chip size="small" label={x.key} variant="outlined" />
                        {stateChip(x.state)}
                        {x.type ? <Chip size="small" label={x.type} variant="outlined" /> : null}
                        {x.priority ? <Chip size="small" label={x.priority} variant="outlined" /> : null}
                        <Typography sx={{ fontWeight: 800 }}>{x.title}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        {x.url ? (
                          <Link href={x.url} target="_blank" rel="noreferrer">
                            Open
                          </Link>
                        ) : null}
                        {x.assignee ? <Chip size="small" variant="outlined" label={`assignee: ${x.assignee}`} /> : null}
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      )}

      <IssueBodyDialog
        open={dialog.open}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
        title={dialog.title}
        url={dialog.url}
        body={dialog.body}
      />
    </Box>
  );
}