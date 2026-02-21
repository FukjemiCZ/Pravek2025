import { slugifyId } from "./utils";
import type { CompiledModel } from "./schema";

export function emitMermaidRelations(model: CompiledModel) {
  const lines: string[] = [];
  lines.push("graph LR");

  const edges = model.relations.relations.map((r) => ({
    from: slugifyId(r.from),
    to: slugifyId(r.to),
    type: r.type
  }));

  // Create stable mapping from ids to nicer labels
  const labels = new Map<string, string>();
  labels.set(slugifyId(model.vision.product.id), model.vision.product.name);

  for (const d of model.domains.domains) labels.set(slugifyId(d.id), d.name ?? d.id);

  const show = (id: string) => labels.get(id) ?? id;

  // define nodes
  const nodes = new Set<string>();
  for (const e of edges) {
    nodes.add(e.from);
    nodes.add(e.to);
  }
  for (const n of nodes) lines.push(`  ${n}["${show(n).replace(/"/g, '\\"')}"]`);

  for (const e of edges) {
    lines.push(`  ${e.from} -->|${e.type}| ${e.to}`);
  }

  return lines.join("\n") + "\n";
}
