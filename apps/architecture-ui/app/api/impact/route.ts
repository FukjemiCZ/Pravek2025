import { NextResponse } from "next/server";
import micromatch from "micromatch";
import YAML from "yaml";

export const dynamic = "force-dynamic";

type ImpactRule = {
  id: string;
  match: string[];
  domainId?: string;
  capabilityIds?: string[];
};

type ImpactConfig = {
  version: number;
  rules: ImpactRule[];
};

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.json();
}

async function fetchText(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.text();
}

// 1) GitHub compare: files list
async function githubCompare(base: string, head: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "FukjemiCZ";
  const repo = process.env.GITHUB_REPO || "Pravek2025";
  if (!token) throw new Error("Missing env: GITHUB_TOKEN");

  const url = `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`GitHub compare failed: ${res.status} ${t.slice(0, 200)}`);
  }

  return res.json();
}

function addCount(map: Map<string, number>, key: string, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const base = u.searchParams.get("base");
    const head = u.searchParams.get("head");
    if (!base || !head) {
      return NextResponse.json({ error: "Missing base/head query params" }, { status: 400 });
    }

    // 2) Product-model catalog (from GitHub Pages via your existing endpoint)
    // Prefer using the already-working proxy:
    const origin = new URL(req.url).origin;
    const productModel = await fetchJson(`${origin}/api/product-model`);
    const catalog = productModel?.catalog ?? {};
    const domains: Array<{ id: string; name?: string }> = catalog?.domains ?? [];
    const capabilities: Array<{ id: string; domain: string }> = catalog?.capabilities ?? [];

    const domainSet = new Set(domains.map((d) => d.id));
    const capSet = new Set(capabilities.map((c) => c.id));

    // 3) Load impact mapping YAML from repo (raw github)
    // If you prefer GH Pages: put it into dist and fetch from there. For now: raw GitHub main.
    const rawMapUrl =
      "https://raw.githubusercontent.com/FukjemiCZ/Pravek2025/main/product-model/15-impact-map.yaml";
    const mapText = await fetchText(rawMapUrl);
    const cfg = YAML.parse(mapText) as ImpactConfig;

    if (!cfg?.rules?.length) {
      return NextResponse.json({ error: "impact map has no rules" }, { status: 500 });
    }

    // 4) Compare
    const cmp = await githubCompare(base, head);
    const files: any[] = Array.isArray(cmp?.files) ? cmp.files : [];

    // 5) Apply mapping rules
    const touchedDomains = new Map<string, number>();
    const touchedCaps = new Map<string, number>();

    const matchedFiles: Array<{
      filename: string;
      status?: string;
      additions?: number;
      deletions?: number;
      changes?: number;
      matchedRuleIds: string[];
      domainIds: string[];
      capabilityIds: string[];
    }> = [];

    const unmatchedFiles: Array<any> = [];

    for (const f of files) {
      const filename = String(f?.filename ?? "");
      if (!filename) continue;

      const matchedRuleIds: string[] = [];
      const domainIds: string[] = [];
      const capabilityIds: string[] = [];

      for (const r of cfg.rules) {
        if (!r?.match?.length) continue;
        if (!micromatch.isMatch(filename, r.match)) continue;

        matchedRuleIds.push(r.id);

        if (r.domainId) domainIds.push(r.domainId);
        for (const capId of r.capabilityIds ?? []) capabilityIds.push(capId);
      }

      // dedupe
      const domUniq = Array.from(new Set(domainIds));
      const capUniq = Array.from(new Set(capabilityIds));

      // validate against catalog
      const domValid = domUniq.filter((d) => domainSet.has(d));
      const capValid = capUniq.filter((c) => capSet.has(c));

      // count weight: use "changes" if present (better signal than 1 file = 1)
      const weight = Number(f?.changes) || 1;

      for (const d of domValid) addCount(touchedDomains, d, weight);
      for (const c of capValid) addCount(touchedCaps, c, weight);

      if (matchedRuleIds.length > 0) {
        matchedFiles.push({
          filename,
          status: f?.status,
          additions: f?.additions,
          deletions: f?.deletions,
          changes: f?.changes,
          matchedRuleIds,
          domainIds: domValid,
          capabilityIds: capValid,
        });
      } else {
        unmatchedFiles.push(f);
      }
    }

    const toSortedArray = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([id, score]) => ({ id, score }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

    return NextResponse.json(
      {
        base,
        head,
        totals: {
          files: files.length,
          matched: matchedFiles.length,
          unmatched: unmatchedFiles.length,
        },
        domainsTouched: toSortedArray(touchedDomains),
        capabilitiesTouched: toSortedArray(touchedCaps),
        matchedFiles,
        unmatchedFiles: unmatchedFiles.map((f) => ({
          filename: f?.filename,
          status: f?.status,
          changes: f?.changes,
        })),
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("api/impact error:", e);
    return NextResponse.json(
      { error: "impact map failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}