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
  const ready = deployments.filter((d) => d?.state === "READY" && d?.url);
  const prod = ready.find((d) => d?.target === "production") ?? null;
  return {
    production: prod,
    any: ready[0] ?? null,
  };
}

function buildGitHubRunIndex(runs: any[]) {
  // sha -> best run info (prefer success, prefer newer run_started_at)
  const bySha = new Map<string, any>();

  for (const r of runs) {
    const sha = String(r?.head_sha ?? "").toLowerCase();
    if (!sha) continue;

    const existing = bySha.get(sha);

    const cand = {
      id: r?.id,
      name: r?.name,
      conclusion: r?.conclusion ?? null, // success | failure | cancelled | null
      status: r?.status ?? null, // completed | in_progress | queued
      html_url: r?.html_url ?? null,
      run_started_at: r?.run_started_at ?? null,
      updated_at: r?.updated_at ?? null,
    };

    if (!existing) {
      bySha.set(sha, cand);
      continue;
    }

    // Prefer success over non-success
    const existingIsSuccess = existing?.conclusion === "success";
    const candIsSuccess = cand?.conclusion === "success";
    if (candIsSuccess && !existingIsSuccess) {
      bySha.set(sha, cand);
      continue;
    }
    if (!candIsSuccess && existingIsSuccess) continue;

    // Otherwise prefer newer run_started_at
    const exT = existing?.run_started_at ? Date.parse(existing.run_started_at) : 0;
    const caT = cand?.run_started_at ? Date.parse(cand.run_started_at) : 0;
    if (caT > exT) bySha.set(sha, cand);
  }

  return bySha;
}

function getDeploySha(d: any): string | null {
  // Vercel deployments often include meta.githubCommitSha
  const sha =
    d?.meta?.githubCommitSha ??
    d?.meta?.githubCommitSha1 ?? // just in case
    d?.meta?.commitSha ??
    null;

  if (!sha) return null;
  return String(sha).toLowerCase();
}

function pickLastKnownGoodPaired(deployments: any[], ghBySha: Map<string, any>) {
  // production READY deployments with commit sha that has success run
  const candidates = deployments
    .filter((d) => d?.target === "production" && d?.state === "READY" && d?.url)
    .map((d) => ({ d, sha: getDeploySha(d) }))
    .filter((x) => !!x.sha);

  // deployments are already newest first from Vercel; but keep explicit sort:
  candidates.sort((a, b) => (b.d?.createdAt ?? 0) - (a.d?.createdAt ?? 0));

  const prodPaired =
    candidates.find((x) => {
      const run = ghBySha.get(String(x.sha));
      return run?.conclusion === "success";
    }) ?? null;

  const anyPaired =
    deployments
      .filter((d) => d?.state === "READY" && d?.url)
      .map((d) => ({ d, sha: getDeploySha(d) }))
      .filter((x) => !!x.sha)
      .sort((a, b) => (b.d?.createdAt ?? 0) - (a.d?.createdAt ?? 0))
      .find((x) => {
        const run = ghBySha.get(String(x.sha));
        return run?.conclusion === "success";
      }) ?? null;

  return {
    production: prodPaired ? prodPaired.d : null,
    any: anyPaired ? anyPaired.d : null,
  };
}

function attachRunToDeployments(deployments: any[], ghBySha: Map<string, any>) {
  // add deploy.ghRun = {conclusion, html_url, ...} if sha present
  return deployments.map((d) => {
    const sha = getDeploySha(d);
    const run = sha ? ghBySha.get(sha) : null;
    return {
      ...d,
      ghCommitSha: sha,
      ghRun: run ?? null,
    };
  });
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

    // GitHub workflow runs (latest)
    const runsResp = await gh(
      `/repos/${owner}/${repo}/actions/runs?per_page=30`,
      ghToken
    );
    const runs = Array.isArray(runsResp?.workflow_runs) ? runsResp.workflow_runs : [];
    const ghBySha = buildGitHubRunIndex(runs);

    // Vercel deployments (web + arch)
    const qs = (projectId: string) => {
      const params = new URLSearchParams();
      params.set("projectId", projectId);
      params.set("limit", "25");
      if (teamId) params.set("teamId", teamId);
      return `?${params.toString()}`;
    };

    const [webDeploys, archDeploys] = await Promise.all([
      vercel(`/v6/deployments${qs(projectWeb)}`, vercelToken),
      vercel(`/v6/deployments${qs(projectArch)}`, vercelToken),
    ]);

    const webListRaw = Array.isArray(webDeploys?.deployments) ? webDeploys.deployments : [];
    const archListRaw = Array.isArray(archDeploys?.deployments) ? archDeploys.deployments : [];

    const webList = attachRunToDeployments(webListRaw, ghBySha);
    const archList = attachRunToDeployments(archListRaw, ghBySha);

    const lkgWeb = pickLastKnownGood(webListRaw);
    const lkgArch = pickLastKnownGood(archListRaw);

    const lkgWebPaired = pickLastKnownGoodPaired(webListRaw, ghBySha);
    const lkgArchPaired = pickLastKnownGoodPaired(archListRaw, ghBySha);

    return NextResponse.json(
      {
        github: {
          repo: `${owner}/${repo}`,
          runs,
        },
        vercel: {
          web: {
            projectId: projectWeb,
            deployments: webList, // includes ghCommitSha + ghRun
            lastKnownGood: lkgWeb,
            lastKnownGoodPaired: lkgWebPaired,
          },
          architectureUi: {
            projectId: projectArch,
            deployments: archList, // includes ghCommitSha + ghRun
            lastKnownGood: lkgArch,
            lastKnownGoodPaired: lkgArchPaired,
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