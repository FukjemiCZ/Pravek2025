import { slugifyId } from "./utils";
import type { CompiledModel } from "./schema";

type NodeRow = {
  id: string;
  label: string;
  name?: string;
  type?: string;
  domain?: string;
};

type EdgeRow = {
  from: string;
  to: string;
  type: string;
};

function csvEscape(v: string) {
  const s = (v ?? "").toString();
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function emitNeo4jCsv(model: CompiledModel) {
  const nodes: NodeRow[] = [];
  const edges: EdgeRow[] = [];

  // Nodes
  nodes.push({
    id: slugifyId(model.vision.product.id),
    label: "Product",
    name: model.vision.product.name,
    type: model.vision.product.type
  });

  for (const d of model.domains.domains) {
    nodes.push({ id: slugifyId(d.id), label: "Domain", name: d.name ?? d.id });
  }

  for (const p of model.vision.personas ?? []) {
    nodes.push({ id: slugifyId(p.id), label: "Persona", name: p.name ?? p.id });
  }

  for (const c of model.capabilities.capabilities) {
    nodes.push({
      id: slugifyId(c.id),
      label: "Capability",
      name: c.description ?? c.id,
      domain: slugifyId(c.domain)
    });
    edges.push({
      from: slugifyId(c.id),
      to: slugifyId(c.domain),
      type: "IN_DOMAIN"
    });
  }

  for (const f of model.flows.flows) {
    nodes.push({ id: slugifyId(f.id), label: "Flow", name: f.id });
    edges.push({ from: slugifyId(f.id), to: slugifyId(f.actor), type: "ACTOR" });
    for (const cap of f.capabilities ?? []) {
      edges.push({ from: slugifyId(f.id), to: slugifyId(cap), type: "USES" });
    }
  }

  for (const c of model.components.components) {
    nodes.push({ id: slugifyId(c.id), label: "Component", name: c.name ?? c.id, type: c.type });
    if (c.parent) edges.push({ from: slugifyId(c.id), to: slugifyId(c.parent), type: "PART_OF" });
  }

  for (const s of model.services.services) {
    nodes.push({ id: slugifyId(s.id), label: "Service", name: s.id });
    for (const imp of s.implements ?? []) {
      edges.push({ from: slugifyId(s.id), to: slugifyId(imp), type: "IMPLEMENTS" });
    }
    for (const pb of s.providedBy ?? []) {
      edges.push({ from: slugifyId(s.id), to: slugifyId(pb), type: "PROVIDED_BY" });
    }
  }

  for (const a of model.apis.apis) {
    nodes.push({ id: slugifyId(a.id), label: "API", name: a.id, type: a.type });
  }

  for (const e of model.events.events) {
    nodes.push({ id: slugifyId(e.id), label: "Event", name: e.id });
    if (e.producer) edges.push({ from: slugifyId(e.producer), to: slugifyId(e.id), type: "PRODUCES" });
    for (const c of e.consumers ?? []) {
      edges.push({ from: slugifyId(c), to: slugifyId(e.id), type: "CONSUMES" });
    }
  }

  // Relations seed from 11-relations.yaml
  for (const r of model.relations.relations) {
    edges.push({ from: slugifyId(r.from), to: slugifyId(r.to), type: r.type });
  }

  // Deduplicate nodes by id+label (same id can appear across labels, but we prefer one label per id)
  const nodeMap = new Map<string, NodeRow>();
  for (const n of nodes) {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
  }

  const edgeKey = (x: EdgeRow) => `${x.from}::${x.to}::${x.type}`;
  const edgeSet = new Set<string>();
  const uniqueEdges: EdgeRow[] = [];
  for (const e of edges) {
    const k = edgeKey(e);
    if (edgeSet.has(k)) continue;
    edgeSet.add(k);
    uniqueEdges.push(e);
  }

  const nodesCsv =
    "id:ID,label,name,type,domain\n" +
    [...nodeMap.values()]
      .map((n) =>
        [
          csvEscape(n.id),
          csvEscape(n.label),
          csvEscape(n.name ?? ""),
          csvEscape(n.type ?? ""),
          csvEscape(n.domain ?? "")
        ].join(",")
      )
      .join("\n") +
    "\n";

  const edgesCsv =
    ":START_ID,:END_ID,type\n" +
    uniqueEdges.map((e) => [csvEscape(e.from), csvEscape(e.to), csvEscape(e.type)].join(",")).join("\n") +
    "\n";

  return { nodesCsv, edgesCsv };
}
