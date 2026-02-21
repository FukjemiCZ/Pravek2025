import { slugifyId } from "./utils";
import type { CompiledModel } from "./schema";

function dotEscape(s: string) {
  return (s ?? "").replace(/"/g, '\\"');
}

export function emitGraphvizDot(model: CompiledModel) {
  const lines: string[] = [];
  lines.push('digraph ProductModel {');
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=box];');

  // Nodes: use relations + a subset of known ids for nicer labels
  const labelMap = new Map<string, string>();

  labelMap.set(slugifyId(model.vision.product.id), model.vision.product.name);

  for (const d of model.domains.domains) labelMap.set(slugifyId(d.id), d.name ?? d.id);
  for (const c of model.capabilities.capabilities) labelMap.set(slugifyId(c.id), c.id);
  for (const s of model.services.services) labelMap.set(slugifyId(s.id), s.id);
  for (const c of model.components.components) labelMap.set(slugifyId(c.id), c.id);
  for (const a of model.apis.apis) labelMap.set(slugifyId(a.id), a.id);
  for (const e of model.events.events) labelMap.set(slugifyId(e.id), e.id);

  const edges = model.relations.relations.map((r) => ({
    from: slugifyId(r.from),
    to: slugifyId(r.to),
    type: r.type
  }));

  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
  }

  for (const n of nodes) {
    const label = labelMap.get(n) ?? n;
    lines.push(`  "${dotEscape(n)}" [label="${dotEscape(label)}"];`);
  }

  for (const e of edges) {
    lines.push(`  "${dotEscape(e.from)}" -> "${dotEscape(e.to)}" [label="${dotEscape(e.type)}"];`);
  }

  lines.push('}');
  return lines.join("\n") + "\n";
}
