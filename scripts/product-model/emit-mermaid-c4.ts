import type { CompiledModel } from "./schema";
import { slugifyId } from "./utils";

function q(s: string) {
  return (s ?? "").replace(/"/g, '\\"');
}

export function emitMermaidC4Context(model: CompiledModel) {
  const productId = slugifyId(model.vision.product.id);

  // Externals = services/components typu external-system/content-store (heuristika)
  const externals = model.components.components.filter((c) =>
    ["external-system"].includes(c.type)
  );

  const lines: string[] = [];
  lines.push("C4Context");
  lines.push(`title "${q(model.vision.product.name)} - Context"`);
  lines.push(`System(${productId}, "${q(model.vision.product.name)}", "${q(model.vision.product.type ?? "")}")`);

  for (const p of model.vision.personas ?? []) {
    const pid = slugifyId(p.id);
    lines.push(`Person(${pid}, "${q(p.name ?? p.id)}", "${q(p.intent ?? "")}")`);
    lines.push(`Rel(${pid}, ${productId}, "uses")`);
  }

  for (const ext of externals) {
    const eid = slugifyId(ext.id);
    lines.push(`System_Ext(${eid}, "${q(ext.id)}", "${q(ext.notes ?? ext.type)}")`);
    lines.push(`Rel(${productId}, ${eid}, "depends on")`);
  }

  return lines.join("\n") + "\n";
}

export function emitMermaidC4Container(model: CompiledModel) {
  const productId = slugifyId(model.vision.product.id);

  const ui = model.components.components.filter((c) => c.type === "ui");
  const backend = model.components.components.filter((c) => c.type === "backend-module");
  const stores = model.components.components.filter((c) => ["content-store"].includes(c.type));
  const externals = model.components.components.filter((c) => ["external-system"].includes(c.type));

  const lines: string[] = [];
  lines.push("C4Container");
  lines.push(`title "${q(model.vision.product.name)} - Container"`);
  lines.push(`System_Boundary(${productId}_b, "${q(model.vision.product.name)}") {`);

  for (const c of ui) {
    lines.push(`  Container(${slugifyId(c.id)}, "${q(c.name ?? c.id)}", "Next.js/React", "${q(c.notes ?? "")}")`);
  }

  for (const c of backend) {
    lines.push(`  Container(${slugifyId(c.id)}, "${q(c.id)}", "Next.js Route Handlers / Server", "${q(c.notes ?? "")}")`);
  }

  for (const s of stores) {
    lines.push(`  ContainerDb(${slugifyId(s.id)}, "${q(s.id)}", "Git", "${q(s.notes ?? "")}")`);
  }

  lines.push("}");

  for (const e of externals) {
    lines.push(`System_Ext(${slugifyId(e.id)}, "${q(e.id)}", "${q(e.notes ?? e.type)}")`);
  }

  // Heuristické vztahy: backend závisí na externals, UI volá backend
  for (const u of ui) {
    for (const b of backend) {
      lines.push(`Rel(${slugifyId(u.id)}, ${slugifyId(b.id)}, "calls")`);
    }
  }
  for (const b of backend) {
    for (const e of externals) {
      lines.push(`Rel(${slugifyId(b.id)}, ${slugifyId(e.id)}, "uses")`);
    }
  }

  return lines.join("\n") + "\n";
}
