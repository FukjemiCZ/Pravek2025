import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

type Method = "get" | "post" | "put" | "patch" | "delete";

const METHOD_MAP: Array<[RegExp, Method]> = [
  [/export\s+async\s+function\s+GET\b/, "get"],
  [/export\s+async\s+function\s+POST\b/, "post"],
  [/export\s+async\s+function\s+PUT\b/, "put"],
  [/export\s+async\s+function\s+PATCH\b/, "patch"],
  [/export\s+async\s+function\s+DELETE\b/, "delete"],
];

// Odvodí OpenAPI path z umístění route.ts.
// Např. apps/web/src/app/api/foo/bar/route.ts -> /api/foo/bar
function inferPathFromRouteFile(file: string) {
  // normalize
  const p = file.replaceAll("\\", "/");
  const idx = p.indexOf("/src/app/api/");
  if (idx === -1) return null;

  const rest = p.slice(idx + "/src/app/api/".length);
  // rest: foo/bar/route.ts
  const dir = rest.replace(/\/route\.ts$/, "");
  if (!dir) return "/api";
  return `/api/${dir}`;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function openapiStub({
  method,
  apiPath,
  tag,
}: {
  method: Method;
  apiPath: string;
  tag: string;
}) {
  // minimal safe schema
  return `import { z } from "zod";

export const openapi = {
  method: "${method}",
  path: "${apiPath}",
  tags: ["${tag}"],
  summary: "${method.toUpperCase()} ${apiPath}",
  description: "TODO: describe this endpoint.",
  // Optional: request schemas
  // request: {
  //   query: z.object({}),
  //   params: z.object({}),
  //   body: z.object({}),
  // },
  responses: {
    200: z.any(),
    500: z.object({ error: z.string(), detail: z.string().optional() }),
  },
} as const;
`;
}

async function main() {
  const routes = await fg(["apps/web/src/app/api/**/route.ts"], {
    onlyFiles: true,
  });

  let created = 0;
  let skipped = 0;

  for (const routeFile of routes) {
    const apiPath = inferPathFromRouteFile(routeFile);
    if (!apiPath) continue;

    const src = fs.readFileSync(routeFile, "utf8");
    const methods: Method[] = [];

    for (const [rx, m] of METHOD_MAP) {
      if (rx.test(src)) methods.push(m);
    }

    // Pokud v route.ts nejsou exportované metody (edge case), přeskočíme
    if (!methods.length) {
      skipped++;
      continue;
    }

    const dir = path.dirname(routeFile);
    const openapiFile = path.join(dir, "openapi.ts");

    if (fs.existsSync(openapiFile)) {
      skipped++;
      continue;
    }

    ensureDir(dir);

    // když route podporuje více metod, vygenerujeme víc definic do jednoho souboru
    // (a tvůj scan/generator je může načíst jako export openapi[] nebo openapiMap)
    // Pro jednoduchost dáme defaultně první metodu – ty můžeš snadno rozšířit.
    const first = methods[0];

    fs.writeFileSync(
      openapiFile,
      openapiStub({ method: first, apiPath, tag: "web" }),
      "utf8"
    );

    created++;
  }

  console.log(`✅ openapi stubs created: ${created}`);
  console.log(`↩️  skipped (already exists / no methods): ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});