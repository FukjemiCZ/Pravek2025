import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// default URL pro tvůj GH Pages
const DEFAULT_WEB_OPENAPI =
  "https://fukjemicz.github.io/Pravek2025/openapi/web/openapi.json";

export async function GET() {
  const specUrl =
    process.env.NEXT_PUBLIC_WEB_OPENAPI_URL ||
    process.env.WEB_OPENAPI_URL || // server-only override
    DEFAULT_WEB_OPENAPI;

  // jednoduché Swagger UI HTML (bez bundle dependency na klientovi)
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Web API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body{margin:0}</style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

    <script>
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(specUrl)},
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // swagger se mění jen při publishi → můžeš cachovat
      "cache-control": "no-store",
    },
  });
}