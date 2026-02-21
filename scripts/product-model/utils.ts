import fs from "node:fs";
import path from "node:path";

export function abs(...p: string[]) {
  // pokud první segment je absolutní, nepřidávej process.cwd()
  if (p.length > 0 && path.isAbsolute(p[0])) {
    return path.join(...p);
  }
  return path.join(process.cwd(), ...p);
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeText(filePath: string, content: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function writeJson(filePath: string, data: unknown) {
  writeText(filePath, JSON.stringify(data, null, 2) + "\n");
}

export function listYamlFiles(dirPath: string) {
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => path.join(dirPath, f))
    .sort();
}

export function slugifyId(id: string) {
  return (id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.:]/g, "-")
    .replace(/-+/g, "-");
}

export function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
