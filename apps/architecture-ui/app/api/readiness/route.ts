import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Check = {
  id: string;
  title: string;
  severity: "blocker" | "warning" | "info";
  status: "pass" | "fail" | "skip";
  detail?: string;
};

function isPlaceholder(v: unknown) {
  const s = String(v ?? "");
  return s.includes("${") && s.includes("}");
}

function asInternalPath(v: unknown): string | null {
  const s = String(v ?? "");
  if (!s.startsWith("internal:")) return null;
  const p = s.replace("internal:", "");
  return p.startsWith("/") ? p : `/${p}`;
}

async function safeFetchOk(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    return { ok: res.ok, status: res.status };
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message ?? String(e) };
  }
}

function pickActiveYear(runtime: any) {
  const years: any[] = Array.isArray(runtime?.years) ? runtime.years : [];
  // prefer "upcoming" then "active", else newest by id
  const preferred =
    years.find((y) => y?.status === "upcoming") ??
    years.find((y) => y?.status === "active") ??
    years.slice().sort((a, b) => String(b?.id ?? "").localeCompare(String(a?.id ?? "")))[0];
  return preferred ?? null;
}

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin;

    // runtime.json z product-model proxy (už máš /api/product-model)
    const pmRes = await fetch(`${origin}/api/product-model`, { cache: "no-store" });
    if (!pmRes.ok) {
      return NextResponse.json({ error: "Cannot load /api/product-model" }, { status: 500 });
    }
    const pm = await pmRes.json();
    const runtime = pm?.runtime;
    if (!runtime) {
      return NextResponse.json({ error: "runtime missing in /api/product-model" }, { status: 500 });
    }

    // status (uptimerobot aggregator)
    const statusRes = await fetch(`${origin}/api/status`, { cache: "no-store" });
    const statusJson = statusRes.ok ? await statusRes.json() : null;

    const activeYear = pickActiveYear(runtime);

    const checks: Check[] = [];

    // --- Global checks: feature flags & basics ---
    const flags = runtime.featureFlags ?? {};
    const endpoints = runtime.externalEndpoints ?? {};
    const cta = runtime.cta ?? {};
    const nav = runtime.navigation?.primary ?? [];

    // CTA basics
    const allCtas = [...(cta.primary ?? []), ...(cta.secondary ?? [])].filter(Boolean);
    const enabledCtas = allCtas.filter((x: any) => x?.enabled);

    checks.push({
      id: "cta.enabled",
      title: "CTA: alespoň 1 enabled CTA",
      severity: "blocker",
      status: enabledCtas.length > 0 ? "pass" : "fail",
      detail: enabledCtas.length > 0 ? `${enabledCtas.length} enabled` : "No enabled CTA found",
    });

    // Navigation basics
    checks.push({
      id: "nav.primary",
      title: "Navigation: primary menu není prázdné",
      severity: "warning",
      status: Array.isArray(nav) && nav.length > 0 ? "pass" : "fail",
      detail: Array.isArray(nav) ? `${nav.length} items` : "navigation.primary missing",
    });

    // Status overall
    if (statusJson?.overall) {
      checks.push({
        id: "ops.uptime.overall",
        title: "Operations: overall uptime (UptimeRobot proxy)",
        severity: "blocker",
        status: statusJson.overall === "up" ? "pass" : "fail",
        detail: statusJson.overall,
      });
    } else {
      checks.push({
        id: "ops.uptime.overall",
        title: "Operations: overall uptime (UptimeRobot proxy)",
        severity: "warning",
        status: "fail",
        detail: "No status data",
      });
    }

    // --- Endpoint readiness (internal APIs referenced by runtime) ---
    const internalChecks: Array<{ id: string; title: string; severity: Check["severity"]; url: string }> = [];

    // Gallery internal API
    const galleryApi = asInternalPath(endpoints?.gallery?.apiBaseUrl);
    if (galleryApi && flags.enableGallery) {
      internalChecks.push({
        id: "api.gallery",
        title: "API: gallery endpoint reachable",
        severity: "blocker",
        url: `${origin}${galleryApi}`,
      });
    }

    // Registration internal API
    const regApi = asInternalPath(endpoints?.registration?.apiBaseUrl);
    if (regApi && flags.enableSubstituteRegistration) {
      internalChecks.push({
        id: "api.registration.substitute",
        title: "API: substitute registration endpoint reachable",
        severity: "blocker",
        url: `${origin}${regApi}`,
      });
    }

    // Payments instructions
    const payInstr = asInternalPath(endpoints?.payments?.instructionsApi);
    if (payInstr) {
      internalChecks.push({
        id: "api.payments.instructions",
        title: "API: payments instructions endpoint reachable",
        severity: "blocker",
        url: `${origin}${payInstr}`,
      });
    }

    // Payments confirm (only if flag enabled)
    const payConfirm = asInternalPath(endpoints?.payments?.confirmApi);
    if (payConfirm && flags.enablePaymentsConfirm) {
      internalChecks.push({
        id: "api.payments.confirm",
        title: "API: payments confirm endpoint reachable",
        severity: "warning",
        url: `${origin}${payConfirm}`,
      });
    }

    for (const t of internalChecks) {
      const r = await safeFetchOk(t.url);
      checks.push({
        id: t.id,
        title: t.title,
        severity: t.severity,
        status: r.ok ? "pass" : "fail",
        detail: r.ok ? `HTTP ${r.status}` : `Failed${r.status ? ` (HTTP ${r.status})` : ""}${(r as any).error ? `: ${(r as any).error}` : ""}`,
      });
    }

    // --- Env placeholder checks (prove the config is “wired”) ---
    // Sheets ID
    const sheetsId = endpoints?.gallery?.sheet?.spreadsheetId;
    if (flags.enableGallery) {
      checks.push({
        id: "env.sheets.galleryId",
        title: "Config: Google Sheets gallery spreadsheetId is resolved",
        severity: "blocker",
        status: !isPlaceholder(sheetsId) && !!sheetsId ? "pass" : "fail",
        detail: isPlaceholder(sheetsId) ? "Placeholder not resolved" : sheetsId ? "OK" : "Missing",
      });
    }

    // Registration notify email
    const notifyEmail = endpoints?.registration?.notificationEmail;
    if (flags.enableSubstituteRegistration) {
      checks.push({
        id: "env.registration.notify",
        title: "Config: registration notificationEmail is resolved",
        severity: "warning",
        status: !isPlaceholder(notifyEmail) && !!notifyEmail ? "pass" : "fail",
        detail: isPlaceholder(notifyEmail) ? "Placeholder not resolved" : notifyEmail ? "OK" : "Missing",
      });
    }

    // Payments bank
    const iban = endpoints?.payments?.bank?.iban;
    const accName = endpoints?.payments?.bank?.accountName;
    checks.push({
      id: "env.payments.bank",
      title: "Config: payments bank account is resolved",
      severity: "blocker",
      status: !isPlaceholder(iban) && !!iban && !isPlaceholder(accName) && !!accName ? "pass" : "fail",
      detail: `iban: ${isPlaceholder(iban) ? "placeholder" : iban ? "ok" : "missing"}, name: ${isPlaceholder(accName) ? "placeholder" : accName ? "ok" : "missing"}`,
    });

    // Analytics
    const analyticsEnabled = !!endpoints?.analytics?.enabled && !!flags.enableAnalytics;
    const siteId = endpoints?.analytics?.siteId;
    checks.push({
      id: "analytics.site",
      title: "Analytics: enabled + siteId resolved",
      severity: "info",
      status: analyticsEnabled ? (!isPlaceholder(siteId) && !!siteId ? "pass" : "fail") : "skip",
      detail: analyticsEnabled ? (isPlaceholder(siteId) ? "Placeholder not resolved" : siteId ? "OK" : "Missing") : "Analytics disabled",
    });

    // --- Year-specific checks ---
    const yearChecks: Record<string, Check[]> = {};
    const years: any[] = Array.isArray(runtime?.years) ? runtime.years : [];
    for (const y of years) {
      const yc: Check[] = [];
      const yid = String(y?.id ?? "year");

      // eventDate sanity
      yc.push({
        id: `${yid}.eventDate`,
        title: "Event date configured",
        severity: "warning",
        status: y?.eventDate?.from && y?.eventDate?.to ? "pass" : "fail",
        detail: y?.eventDate?.from && y?.eventDate?.to ? `${y.eventDate.from} → ${y.eventDate.to}` : "Missing eventDate",
      });

      // year gallery
      if (flags.enableGallery) {
        yc.push({
          id: `${yid}.gallery.enabled`,
          title: "Year gallery enabled + key present",
          severity: "warning",
          status: y?.gallery?.enabled && !!y?.gallery?.galleryKey ? "pass" : "fail",
          detail: y?.gallery?.enabled ? `key: ${y?.gallery?.galleryKey ?? "missing"}` : "disabled",
        });
      }

      // year pages
      const p = y?.pages ?? {};
      if (y?.status === "upcoming" || y?.status === "active") {
        yc.push({
          id: `${yid}.pages.raceInfo`,
          title: "Race info path configured",
          severity: "blocker",
          status: !!p.raceInfoPath ? "pass" : "fail",
          detail: p.raceInfoPath ?? "Missing",
        });
        yc.push({
          id: `${yid}.pages.support`,
          title: "Support path configured",
          severity: "blocker",
          status: !!p.supportPath ? "pass" : "fail",
          detail: p.supportPath ?? "Missing",
        });
      }

      yearChecks[yid] = yc;
    }

    // --- Compute GO/NO-GO ---
    const blockersFailed = checks.filter((c) => c.severity === "blocker" && c.status === "fail").length;
    const yearBlockersFailed =
      activeYear && yearChecks[String(activeYear.id)]
        ? yearChecks[String(activeYear.id)].filter((c) => c.severity === "blocker" && c.status === "fail").length
        : 0;

    const go = blockersFailed === 0 && yearBlockersFailed === 0;

    return NextResponse.json(
      {
        activeYear,
        goNoGo: {
          status: go ? "GO" : "NO-GO",
          blockersFailed,
          yearBlockersFailed,
        },
        checks,
        yearChecks,
        runtime,
        status: statusJson,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("api/readiness error:", e);
    return NextResponse.json({ error: "readiness failed", detail: e?.message ?? String(e) }, { status: 500 });
  }
}