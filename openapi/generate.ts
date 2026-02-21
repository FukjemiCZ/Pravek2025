import fs from "node:fs";
import path from "node:path";
import swaggerUiDist from "swagger-ui-dist";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string | Buffer) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}

function main() {
  const outDir = path.join(process.cwd(), "dist", "openapi");
  ensureDir(outDir);

  // 1) generate openapi spec
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Pravek2025 API",
      version: "1.0.0",
      description: "Auto-generated OpenAPI from openapi/registry.ts",
    },
    servers: [
      { url: "https://pravek.fukjemi.cz" },
      { url: "http://localhost:3000" },
    ],
  });

  writeFile(path.join(outDir, "openapi.json"), JSON.stringify(doc, null, 2));

  // 2) copy swagger-ui-dist assets
  const distPath = swaggerUiDist.getAbsoluteFSPath();
  for (const f of fs.readdirSync(distPath)) {
    const src = path.join(distPath, f);
    const dst = path.join(outDir, f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, dst);
  }

  // 3) create index.html pointing to openapi.json
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Pravek2025 API Docs</title>
    <link rel="stylesheet" href="./swagger-ui.css" />
    <style>body{margin:0}</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js"></script>
    <script src="./swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "./openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    </script>
  </body>
</html>`;
  writeFile(path.join(outDir, "index.html"), html);

  console.log(`✅ OpenAPI generated: ${path.join(outDir, "openapi.json")}`);
  console.log(`✅ Swagger UI:       ${path.join(outDir, "index.html")}`);
}

main();