import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GH_API = "https://api.github.com";
const VERCEL_API = "https://api.vercel.com";

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
  if (!res.ok) throw new Error(`GitHub ${path} failed: ${res.status}`);
  return res.json();
}

async function vercel(path: string, token: string) {
  const res = await fetch(`${VERCEL_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Vercel ${path} failed: ${res.status}`);
  return res.json();
}

function pickLastKnownGood(deployments: any[]) {
  // Vercel: "READY" znamená úspěšný deploy; error je v "ERROR"
  const ready = deployments.filter((d) => d?.state === "READY" && d?.url);
  // prefer production (target === "production"), otherwise any
  const prod = ready.find((d) => d?.target === "production") ?? null;
  return {
    production: prod,
    any: ready[0] ?? null,
  };
}

export async function GET() {
  try {
    const ghToken = requireEnv("GITHUB_TOKEN");
    const owner = requireEnv("GITHUB_OWNER");
    const repo = requireEnv("GITHUB_REPO");

    const vercelToken = requireEnv("VERCEL_TOKEN");
    const teamId = process.env.VERCEL_TEAM_ID;

    const projectWeb = requireEnv("VERCEL_PROJECT_ID_WEB");
    const projectArch = requireEnv("VERCEL_PROJECT_ID_ARCH");

    // --- GitHub: poslední workflow runy (napříč repo) ---
    // list workflow runs for a repo (REST Actions) :contentReference[oaicite:3]{index=3}
    const runs = await gh(
      `/repos/${owner}/${repo}/actions/runs?per_page=20`,
      ghToken
    );

    // --- Vercel: deployments pro web + arch ---
    // list deployments endpoint :contentReference[oaicite:4]{index=4}
    const qs = (projectId: string) => {
      const params = new URLSearchParams();
      params.set("projectId", projectId);
      params.set("limit", "20");
      if (teamId) params.set("teamId", teamId);
      return `?${params.toString()}`;
    };

    const webDeploys = await vercel(`/v6/deployments${qs(projectWeb)}`, vercelToken);
    const archDeploys = await vercel(`/v6/deployments${qs(projectArch)}`, vercelToken);

    const webList = Array.isArray(webDeploys?.deployments) ? webDeploys.deployments : [];
    const archList = Array.isArray(archDeploys?.deployments) ? archDeploys.deployments : [];

    const lkgWeb = pickLastKnownGood(webList);
    const lkgArch = pickLastKnownGood(archList);

    return NextResponse.json(
      {
        github: {
          repo: `${owner}/${repo}`,
          runs: runs?.workflow_runs ?? [],
        },
        vercel: {
          web: {
            projectId: projectWeb,
            deployments: webList,
            lastKnownGood: lkgWeb,
          },
          architectureUi: {
            projectId: projectArch,
            deployments: archList,
            lastKnownGood: lkgArch,
          },
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("api/deployments error:", e);
    return NextResponse.json(
      { error: "deployments feed failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}