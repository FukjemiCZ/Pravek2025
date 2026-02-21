import fs from "node:fs";
import path from "node:path";
import swaggerUiDist from "swagger-ui-dist";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registryArchitectureUi } from "./registry.architecture-ui";
import { registryWeb } from "./registry.web";

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function copySwaggerUi(outDir: string) {
  const distPath = swaggerUiDist.getAbsoluteFSPath();
  for (const f of fs.readdirSync(distPath)) {
    const src = path.join(distPath, f);
    const dst = path.join(outDir, f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, dst);
  }
}

function writeSwaggerIndex(outDir: string, title: string) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
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
  fs.writeFileSync(path.join(outDir, "index.html"), html);
}

function writeRootIndex(outDir: string) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Pravek2025 OpenAPI</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;max-width:900px;margin:0 auto}
      a{color:#0b5fff}
      code{background:#f6f8fa;padding:2px 6px;border-radius:6px}
      .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0}
    </style>
  </head>
  <body>
    <h1>OpenAPI / Swagger</h1>
    <div class="card">
      <h2>Architecture UI</h2>
      <p><a href="./architecture-ui/">Swagger UI</a> · <a href="./architecture-ui/openapi.json">openapi.json</a></p>
    </div>
    <div class="card">
      <h2>Web</h2>
      <p><a href="./web/">Swagger UI</a> · <a href="./web/openapi.json">openapi.json</a></p>
    </div>
  </body>
</html>`;
  fs.writeFileSync(path.join(outDir, "index.html"), html);
}

function generateSpec(registry: any, info: { title: string; version: string; description: string }, servers: string[]) {
  const gen = new OpenApiGeneratorV3(registry.definitions);
  return gen.generateDocument({
    openapi: "3.0.3",
    info,
    servers: servers.map((url) => ({ url })),
  });
}

function main() {
  const outRoot = path.join(process.cwd(), "dist", "openapi");
  ensureDir(outRoot);

  // generate specs
  const arch = generateSpec(
    registryArchitectureUi,
    {
      title: "Pravek2025 — Architecture UI API",
      version: "1.0.0",
      description: "Auto-generated OpenAPI",
    },
    ["https://pravek.fukjemi.cz", "http://localhost:3001"]
  );

  const web = generateSpec(
    registryWeb,
    {
      title: "Pravek2025 — Web API",
      version: "1.0.0",
      description: "Auto-generated OpenAPI",
    },
    ["https://pravek.fukjemi.cz", "http://localhost:3000"]
  );

  // per-app output
  const outArch = path.join(outRoot, "architecture-ui");
  const outWeb = path.join(outRoot, "web");
  ensureDir(outArch);
  ensureDir(outWeb);

  fs.writeFileSync(path.join(outArch, "openapi.json"), JSON.stringify(arch, null, 2));
  fs.writeFileSync(path.join(outWeb, "openapi.json"), JSON.stringify(web, null, 2));

  // swagger ui assets + index
  copySwaggerUi(outArch);
  copySwaggerUi(outWeb);
  writeSwaggerIndex(outArch, "Architecture UI — Swagger");
  writeSwaggerIndex(outWeb, "Web — Swagger");

  // root index
  writeRootIndex(outRoot);

  console.log("✅ OpenAPI generated in dist/openapi/");
}

main();