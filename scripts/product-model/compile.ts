import { abs, writeJson, writeText, ensureDir } from "./utils";
import { loadProductModel } from "./loaders";
import { normalizeAndValidate } from "./normalize";
import { emitCatalog } from "./emit-catalog";
import { emitNeo4jCsv } from "./emit-neo4j";
import { emitGraphvizDot } from "./emit-dot";
import { emitMermaidRelations } from "./emit-mermaid-graph";
import { emitMermaidC4Context, emitMermaidC4Container } from "./emit-mermaid-c4";
import { emitHeatmap } from "./emit-heatmap";

function failOnErrors(issues: { level: "error" | "warn"; message: string }[]) {
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  if (warns.length) {
    console.warn("\n[product-model] WARNINGS:");
    for (const w of warns) console.warn(" - " + w.message);
  }
  if (errors.length) {
    console.error("\n[product-model] ERRORS:");
    for (const e of errors) console.error(" - " + e.message);
    process.exitCode = 1;
    throw new Error(`Product model validation failed (${errors.length} errors).`);
  }
}

async function main() {
  const outDir = abs("dist/product-model");
  ensureDir(outDir);

  // !!! důležité: posílej relativní cestu, loader si ji absolutizuje sám
  const model = loadProductModel("product-model");
  const { issues } = normalizeAndValidate(model);

  failOnErrors(issues);

  // 1) compiled model
  writeJson(abs(outDir, "compiled.json"), model);

  // 2) catalog
  const catalog = emitCatalog(model);
  writeJson(abs(outDir, "catalog.json"), catalog);

  // 3) split json outputs
  writeJson(abs(outDir, "runtime.json"), model.runtime.runtime ?? {});
  writeJson(abs(outDir, "ownership.json"), model.ownership.ownership ?? {});
  writeJson(abs(outDir, "roadmap.json"), model.roadmap.roadmap ?? {});

  // 4) heatmap
  writeJson(abs(outDir, "heatmap.json"), emitHeatmap(model));

  // 5) neo4j csv
  const { nodesCsv, edgesCsv } = emitNeo4jCsv(model);
  ensureDir(abs(outDir, "neo4j"));
  writeText(abs(outDir, "neo4j/nodes.csv"), nodesCsv);
  writeText(abs(outDir, "neo4j/edges.csv"), edgesCsv);

  // 6) dot + mermaid
  ensureDir(abs(outDir, "graph"));
  writeText(abs(outDir, "graph/relations.dot"), emitGraphvizDot(model));
  writeText(abs(outDir, "graph/relations.mmd"), emitMermaidRelations(model));
  writeText(abs(outDir, "graph/c4-context.mmd"), emitMermaidC4Context(model));
  writeText(abs(outDir, "graph/c4-container.mmd"), emitMermaidC4Container(model));

  console.log(`[product-model] OK -> ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
