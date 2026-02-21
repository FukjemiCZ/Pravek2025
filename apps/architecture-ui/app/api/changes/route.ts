import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GH_API = "https://api.github.com";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function gh(path: string, token: string) {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub ${path} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function GET(req: Request) {
  try {
    const ghToken = requireEnv("GITHUB_TOKEN");
    const owner = requireEnv("GITHUB_OWNER");
    const repo = requireEnv("GITHUB_REPO");

    const url = new URL(req.url);
    const base = url.searchParams.get("base");
    const head = url.searchParams.get("head");

    // Latest releases
    const releases = await gh(`/repos/${owner}/${repo}/releases?per_page=10`, ghToken);

    // Latest merged PRs (GitHub Search API)
    // merged:>YYYY-MM-DD returns merged PRs in descending updated order
    const since = url.searchParams.get("since") ?? ""; // optional: YYYY-MM-DD
    const q = [
      `repo:${owner}/${repo}`,
      "is:pr",
      "is:merged",
      since ? `merged:>=${since}` : "",
      "sort:updated-desc",
    ].filter(Boolean).join(" ");

    const prsResp = await gh(`/search/issues?q=${encodeURIComponent(q)}&per_page=20`, ghToken);

    // Latest commits on main
    const commits = await gh(`/repos/${owner}/${repo}/commits?sha=main&per_page=20`, ghToken);

    // Optional compare base..head
    let compare: any = null;
    if (base && head && base !== head) {
      compare = await gh(`/repos/${owner}/${repo}/compare/${base}...${head}`, ghToken);
    }

    return NextResponse.json(
      {
        repo: `${owner}/${repo}`,
        releases,
        mergedPRs: prsResp?.items ?? [],
        commits,
        compare,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("api/changes error:", e);
    return NextResponse.json(
      { error: "changes feed failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}