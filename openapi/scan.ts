import fg from "fast-glob";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type OpenApiRouteDef = {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  tags?: string[];
  summary?: string;
  description?: string;
  responses: Record<number, any>; // statusCode -> zod schema
};

export async function loadOpenApiRouteDefsFor(app: "web" | "architecture-ui"): Promise<OpenApiRouteDef[]> {
  const pattern =
    app === "web"
      ? "apps/web/src/app/api/**/openapi.ts"
      : "apps/architecture-ui/app/api/**/openapi.ts";

  const files = await fg([pattern], { onlyFiles: true });

  const defs: OpenApiRouteDef[] = [];
  for (const f of files) {
    const abs = path.resolve(process.cwd(), f);
    const mod = await import(pathToFileURL(abs).href);

    if (!mod?.openapi) {
      throw new Error(`Missing export 'openapi' in ${f}`);
    }
    defs.push(mod.openapi as OpenApiRouteDef);
  }

  // stabilní ordering
  defs.sort((a, b) => (a.path ?? "").localeCompare(b.path ?? "") || (a.method ?? "").localeCompare(b.method ?? ""));
  return defs;
}