import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GH_API = "https://api.github.com";

function hasEnv(name: string) {
  const v = process.env[name];
  return !!(v && String(v).trim().length > 0);
}

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---- GitHub ----
async function gh(path: string, token: string) {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const payload = await safeJson(res);
    throw new Error(
      `GitHub ${path} failed: ${res.status} ${
        typeof payload === "string" ? payload.slice(0, 200) : ""
      }`
    );
  }
  return res.json();
}

// ---- OpenProject ----
// OpenProject API v3 (HAL JSON)
// Auth: Basic base64("apikey:<token>") je běžné
async function op(path: string, baseUrl: string, apiKey: string) {
  const auth = Buffer.from(`apikey:${apiKey}`).toString("base64");
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/hal+json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const payload = await safeJson(res);
    throw new Error(
      `OpenProject ${path} failed: ${res.status} ${
        typeof payload === "string" ? payload.slice(0, 200) : ""
      }`
    );
  }
  return res.json();
}

function extractOpRefs(text: string): string[] {
  const s = String(text ?? "");
  const re = /\bOP#(\d+)\b/gi;
  const out: string[] = [];
  let m;
  while ((m = re.exec(s))) out.push(`OP:${m[1]}`);
  return Array.from(new Set(out));
}

function mapGithubIssueFromSearchItem(i: any, details: any | null) {
  const isPR = !!i?.pull_request;

  const body = details?.body ?? null;

  // reactions from details (REST issue endpoint provides reactions)
  const reactions = details?.reactions
    ? {
        plusOne: details.reactions["+1"] ?? 0,
        minusOne: details.reactions["-1"] ?? 0,
        laugh: details.reactions.laugh ?? 0,
        hooray: details.reactions.hooray ?? 0,
        confused: details.reactions.confused ?? 0,
        heart: details.reactions.heart ?? 0,
        rocket: details.reactions.rocket ?? 0,
        eyes: details.reactions.eyes ?? 0,
      }
    : null;

  return {
    source: "github" as const,
    id: `GH:${i.number}`,
    key: `#${i.number}`,
    number: i.number,
    title: i.title,
    url: i.html_url,
    state: isPR ? (i.state === "closed" ? "merged" : "open") : i.state,
    type: isPR ? "pr" : "issue",
    labels: (i.labels ?? []).map((l: any) => l.name).filter(Boolean),
    assignee: i.assignee?.login ?? null,
    updatedAt: i.updated_at,
    createdAt: i.created_at,
    body,
    reactions,
    linkedIssues: extractOpRefs(i.title + "\n" + (body ?? "")),
  };
}

function mapOpenProjectWP(wp: any, baseUrl: string) {
  const id = wp?.id;
  const subject = wp?.subject ?? `WP ${id}`;
  const links = wp?._links ?? {};
  const statusTitle = links?.status?.title ?? null;
  const typeTitle = links?.type?.title ?? null;
  const priorityTitle = links?.priority?.title ?? null;
  const assigneeTitle = links?.assignee?.title ?? null;

  const state = statusTitle && /closed|done|resolved/i.test(statusTitle) ? "closed" : "open";

  // API href is typically /api/v3/work_packages/123 -> human URL often /work_packages/123
  const apiHref = links?.self?.href ?? "";
  const url = apiHref
    ? `${baseUrl.replace(/\/$/, "")}${apiHref.replace(/^\/api\/v3\//, "/")}`
    : "";

  return {
    source: "openproject" as const,
    id: `OP:${id}`,
    key: `WP#${id}`,
    title: subject,
    url,
    state,
    type: typeTitle ? String(typeTitle).toLowerCase() : "work-package",
    priority: priorityTitle ?? null,
    labels: [] as string[],
    assignee: assigneeTitle ?? null,
    updatedAt: wp?.updatedAt ?? wp?.updated_at ?? null,
    createdAt: wp?.createdAt ?? wp?.created_at ?? null,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

  const warnings: string[] = [];
  const meta: any = {
    github: { enabled: false, ok: false, reason: "" },
    openproject: { enabled: false, ok: false, reason: "" },
  };

  let ghItems: any[] = [];
  let opItems: any[] = [];

  // --- GitHub (optional, partial success allowed) ---
  if (hasEnv("GITHUB_TOKEN") && hasEnv("GITHUB_OWNER") && hasEnv("GITHUB_REPO")) {
    meta.github.enabled = true;
    try {
      const ghToken = process.env.GITHUB_TOKEN!;
      const owner = process.env.GITHUB_OWNER!;
      const repo = process.env.GITHUB_REPO!;

      const ghQuery = [
        `repo:${owner}/${repo}`,
        "is:issue",
        "state:open",
        q ? q : "",
        "sort:updated-desc",
      ]
        .filter(Boolean)
        .join(" ");

      const ghResp = await gh(
        `/search/issues?q=${encodeURIComponent(ghQuery)}&per_page=${limit}`,
        ghToken
      );

      const rawItems = (ghResp?.items ?? []) as any[];

      // Hydrate details (body + reactions) for top N to keep rate limits sane
      const hydrateLimit = Math.min(rawItems.length, 30);

      async function ghIssueDetails(num: number) {
        return gh(`/repos/${owner}/${repo}/issues/${num}`, ghToken);
      }

      const detailedPairs = await Promise.all(
        rawItems.slice(0, hydrateLimit).map(async (i) => {
          try {
            const det = await ghIssueDetails(i.number);
            return { number: i.number, det };
          } catch {
            return { number: i.number, det: null };
          }
        })
      );

      const detailsByNumber = new Map<number, any>(
        detailedPairs.map((x) => [x.number, x.det])
      );

      ghItems = rawItems.map((i) => mapGithubIssueFromSearchItem(i, detailsByNumber.get(i.number) ?? null));
      meta.github.ok = true;
    } catch (e: any) {
      meta.github.ok = false;
      meta.github.reason = e?.message ?? String(e);
      warnings.push(`GitHub unavailable: ${meta.github.reason}`);
    }
  } else {
    meta.github.reason = "Missing env: GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO";
  }

  // --- OpenProject (optional, partial success allowed) ---
  if (hasEnv("OPENPROJECT_BASE_URL") && hasEnv("OPENPROJECT_API_KEY")) {
    meta.openproject.enabled = true;
    try {
      const baseUrl = process.env.OPENPROJECT_BASE_URL!;
      const apiKey = process.env.OPENPROJECT_API_KEY!;
      const projectId = process.env.OPENPROJECT_PROJECT_ID;

      // OP filters (open work packages, optional project)
      const filters: any[] = [{ status: { operator: "o", values: [] } }];
      if (projectId) filters.push({ project: { operator: "=", values: [String(projectId)] } });

      const opResp = await op(
        `/api/v3/work_packages?filters=${encodeURIComponent(JSON.stringify(filters))}&pageSize=${limit}`,
        baseUrl,
        apiKey
      );

      const elements = opResp?._embedded?.elements ?? [];
      opItems = elements.map((wp: any) => mapOpenProjectWP(wp, baseUrl));
      meta.openproject.ok = true;
    } catch (e: any) {
      meta.openproject.ok = false;
      meta.openproject.reason = e?.message ?? String(e);
      warnings.push(`OpenProject unavailable: ${meta.openproject.reason}`);
    }
  } else {
    meta.openproject.reason = "Missing env: OPENPROJECT_BASE_URL / OPENPROJECT_API_KEY";
  }

  const items = [...opItems, ...ghItems].sort((a: any, b: any) =>
    String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""))
  );

  const totals = {
    github: ghItems.length,
    openproject: opItems.length,
    all: items.length,
  };

  // If both are not ok -> 503
  const anyOk = meta.github.ok || meta.openproject.ok;
  if (!anyOk) {
    return NextResponse.json(
      { error: "No issue sources available", warnings, meta, totals, items: [] },
      { status: 503 }
    );
  }

  return NextResponse.json({ warnings, meta, totals, items }, { status: 200 });
}