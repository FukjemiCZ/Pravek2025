import fs from "node:fs";
import path from "node:path";
import swaggerUiDist from "swagger-ui-dist";
import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

import { loadOpenApiRouteDefsFor } from "./scan";

extendZodWithOpenApi(z);

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

function writeRootIndex(outRoot: string) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Pravek2025 OpenAPI</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;max-width:900px;margin:0 auto}
      a{color:#0b5fff}
      .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0}
      code{background:#f6f8fa;padding:2px 6px;border-radius:6px}
    </style>
  </head>
  <body>
    <h1>OpenAPI / Swagger</h1>

    <div class="card">
      <h2>Web</h2>
      <p><a href="./web/">Swagger UI</a> · <a href="./web/openapi.json">openapi.json</a></p>
      <p>Sources: <code>apps/web/app/api/**/openapi.ts</code></p>
    </div>

    <div class="card">
      <h2>Architecture UI</h2>
      <p><a href="./architecture-ui/">Swagger UI</a> · <a href="./architecture-ui/openapi.json">openapi.json</a></p>
      <p>Sources: <code>apps/architecture-ui/app/api/**/openapi.ts</code></p>
    </div>
  </body>
</html>`;
  fs.writeFileSync(path.join(outRoot, "index.html"), html);
}

function toZodSchema(maybe: any) {
  // pokud je to zod schema, poznáme safeParse; jinak fallback
  return maybe?.safeParse ? maybe : z.any();
}

async function buildDoc(app: "web" | "architecture-ui") {
  const defs = await loadOpenApiRouteDefsFor(app);

  const registry = new OpenAPIRegistry();

  const ErrorSchema = registry.register(
    "Error",
    z.object({ error: z.string(), detail: z.string().optional() })
  );

  for (const r of defs) {
    const responses: any = {};

    for (const [codeStr, schema] of Object.entries(r.responses ?? {})) {
      const code = Number(codeStr);
      responses[code] = {
        description: code === 200 ? "OK" : "Response",
        content: {
          "application/json": {
            schema: toZodSchema(schema),
          },
        },
      };
    }

    if (!responses[500]) {
      responses[500] = {
        description: "Failure",
        content: { "application/json": { schema: ErrorSchema } },
      };
    }

    registry.registerPath({
      method: r.method,
      path: r.path,
      tags: r.tags ?? [app],
      summary: r.summary,
      description: r.description,
      responses,
    });
  }

  const gen = new OpenApiGeneratorV3(registry.definitions);

  const servers =
    app === "web"
      ? ["https://pravek-v-raji.cz", "http://localhost:3000"]
      : ["https://pravek.fukjemi.cz", "http://localhost:3001"];

  return gen.generateDocument({
    openapi: "3.0.3",
    info: {
      title: app === "web" ? "Pravek2025 — Web API" : "Pravek2025 — Architecture UI API",
      version: "1.0.0",
      description: `Auto-generated from ${app === "web" ? "apps/web/src/app/api/**/openapi.ts" : "apps/architecture-ui/app/api/**/openapi.ts"}`,
    },
    servers: servers.map((url) => ({ url })),
  });
}

async function main() {
  const outRoot = path.join(process.cwd(), "dist", "openapi");
  ensureDir(outRoot);

  // build both
  const [docWeb, docArch] = await Promise.all([
    buildDoc("web"),
    buildDoc("architecture-ui"),
  ]);

  // write outputs
  const outWeb = path.join(outRoot, "web");
  const outArch = path.join(outRoot, "architecture-ui");
  ensureDir(outWeb);
  ensureDir(outArch);

  fs.writeFileSync(path.join(outWeb, "openapi.json"), JSON.stringify(docWeb, null, 2));
  fs.writeFileSync(path.join(outArch, "openapi.json"), JSON.stringify(docArch, null, 2));

  // swagger ui in both
  copySwaggerUi(outWeb);
  copySwaggerUi(outArch);
  writeSwaggerIndex(outWeb, "Pravek2025 — Web API (Swagger)");
  writeSwaggerIndex(outArch, "Pravek2025 — Architecture UI API (Swagger)");

  // root index
  writeRootIndex(outRoot);

  console.log("✅ Generated: dist/openapi/web and dist/openapi/architecture-ui");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});