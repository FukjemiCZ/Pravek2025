"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Drawer,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";

type Catalog = {
  domains?: Array<{ id: string; name?: string }>;
  capabilities?: Array<{ id: string; domain: string; description?: string }>;
  services?: Array<{ id: string; implements?: string[] }>;
  apis?: Array<{ id: string; endpoints?: string[] }>;
  events?: Array<{ id: string }>;
};

type GraphFilters = {
  domains: boolean;
  capabilities: boolean;
  services: boolean;
  apis: boolean;
  events: boolean;
};

function nodeLabel(id: string) {
  return id;
}

function makeNode(id: string, kind: string): Node {
  return {
    id,
    type: "default",
    data: { label: nodeLabel(id), kind },
    position: { x: 0, y: 0 },
  };
}

function layoutGrid(nodes: Node[]) {
  // jednoduchý deterministický layout do gridu (bez externích layout engine)
  const cols = 6;
  const dx = 220;
  const dy = 120;

  return nodes.map((n, i) => ({
    ...n,
    position: { x: (i % cols) * dx, y: Math.floor(i / cols) * dy },
  }));
}

export default function GraphCanvas({
  catalog,
}: {
  catalog: Catalog;
}) {
  const [filters, setFilters] = useState<GraphFilters>({
    domains: true,
    capabilities: true,
    services: true,
    apis: false,
    events: false,
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { nodes, edges, byId } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const byId = new Map<string, any>();

    const domains = catalog?.domains ?? [];
    const caps = catalog?.capabilities ?? [];
    const services = catalog?.services ?? [];
    const apis = catalog?.apis ?? [];
    const events = catalog?.events ?? [];

    // indexy
    const capsById = new Map<string, any>();
    for (const c of caps) capsById.set(c.id, c);

    const domainSet = new Set(domains.map((d) => d.id));
    const capSet = new Set(caps.map((c) => c.id));
    const serviceSet = new Set(services.map((s) => s.id));
    const apiSet = new Set(apis.map((a) => a.id));
    const eventSet = new Set(events.map((e) => e.id));

    // NODES
    if (filters.domains) {
      for (const d of domains) {
        const n = makeNode(d.id, "domain");
        nodes.push(n);
        byId.set(d.id, { kind: "domain", data: d });
      }
    }

    if (filters.capabilities) {
      for (const c of caps) {
        const n = makeNode(c.id, "capability");
        nodes.push(n);
        byId.set(c.id, { kind: "capability", data: c });
      }
    }

    if (filters.services) {
      for (const s of services) {
        const n = makeNode(s.id, "service");
        nodes.push(n);
        byId.set(s.id, { kind: "service", data: s });
      }
    }

    if (filters.apis) {
      for (const a of apis) {
        const n = makeNode(a.id, "api");
        nodes.push(n);
        byId.set(a.id, { kind: "api", data: a });
      }
    }

    if (filters.events) {
      for (const e of events) {
        const n = makeNode(e.id, "event");
        nodes.push(n);
        byId.set(e.id, { kind: "event", data: e });
      }
    }

    // EDGES (jen mezi existujícími uzly dle filtrů)
    // Domain -> Capability
    if (filters.domains && filters.capabilities) {
      for (const c of caps) {
        if (!domainSet.has(c.domain)) continue;
        if (!capSet.has(c.id)) continue;

        edges.push({
          id: `domain:${c.domain}->cap:${c.id}`,
          source: c.domain,
          target: c.id,
          label: "IN_DOMAIN",
        });
      }
    }

    // Service -> Capability (implements)
    if (filters.services && filters.capabilities) {
      for (const s of services) {
        const impl = s.implements ?? [];
        for (const capId of impl) {
          if (!capsById.has(capId)) continue;
          edges.push({
            id: `svc:${s.id}->cap:${capId}`,
            source: s.id,
            target: capId,
            label: "IMPLEMENTS",
          });
        }
      }
    }

    // Optional: API -> Service (zatím nemáš explicitní mapování, nechávám bez edge)
    // Optional: Event edges (pokud si doplníš producer/consumers do catalogu)

    // FILTER by query (client-side)
    const q = query.trim().toLowerCase();
    let filteredNodes = nodes;
    let filteredEdges = edges;

    if (q) {
      const keep = new Set(
        nodes
          .filter((n) => String(n.id).toLowerCase().includes(q))
          .map((n) => n.id)
      );

      filteredNodes = nodes.filter((n) => keep.has(n.id));
      filteredEdges = edges.filter((e) => keep.has(e.source) && keep.has(e.target));
    }

    const laidOut = layoutGrid(filteredNodes);

    return { nodes: laidOut, edges: filteredEdges, byId };
  }, [catalog, filters, query]);

  const onNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedId(node.id);
  };

  const selected = selectedId ? byId.get(selectedId) : null;

  const kindColor = (k?: string) => {
    if (k === "domain") return "primary";
    if (k === "capability") return "info";
    if (k === "service") return "success";
    if (k === "api") return "warning";
    if (k === "event") return "default";
    return "default";
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Architecture Graph
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Domain → Capability, Service → Capability. Use filters/search, click node for detail.
            </Typography>
          </Box>

          <TextField
            size="small"
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.domains}
                onChange={(e) => setFilters((p) => ({ ...p, domains: e.target.checked }))}
              />
            }
            label="Domains"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.capabilities}
                onChange={(e) => setFilters((p) => ({ ...p, capabilities: e.target.checked }))}
              />
            }
            label="Capabilities"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.services}
                onChange={(e) => setFilters((p) => ({ ...p, services: e.target.checked }))}
              />
            }
            label="Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.apis}
                onChange={(e) => setFilters((p) => ({ ...p, apis: e.target.checked }))}
              />
            }
            label="APIs"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.events}
                onChange={(e) => setFilters((p) => ({ ...p, events: e.target.checked }))}
              />
            }
            label="Events"
          />
        </Box>

        <Box sx={{ mt: 2, height: 560, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView>
            <MiniMap pannable zoomable />
            <Controls />
            <Background />
          </ReactFlow>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.75, mt: 2 }}>
          Nodes: {nodes.length} • Edges: {edges.length}
        </Typography>

        <Drawer
          anchor="right"
          open={!!selected}
          onClose={() => setSelectedId(null)}
          PaperProps={{ sx: { width: { xs: "100%", md: 420 } } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Node detail
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Click nodes in graph to inspect.
            </Typography>

            <Divider sx={{ my: 2 }} />

            {!selected ? (
              <Typography variant="body2">—</Typography>
            ) : (
              <>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip
                    label={selected.kind}
                    color={kindColor(selected.kind) as any}
                    variant="outlined"
                    size="small"
                  />
                  <Chip label={selectedId!} variant="outlined" size="small" />
                </Stack>

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
                    maxHeight: "70vh",
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(selected.data, null, 2)}
                </Box>
              </>
            )}
          </Box>
        </Drawer>
      </CardContent>
    </Card>
  );
}