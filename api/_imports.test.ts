// Prefixed with an underscore so Vercel does not deploy this test as a function.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Vercel runs the files in api/ as native ES modules (package.json has "type": "module"), and
 * Node only resolves relative imports that name the file, such as "./_http.js". An import without
 * the extension works locally (Vite and Vitest resolve it) but crashes the deployed function with
 * ERR_MODULE_NOT_FOUND. This walks every file the routes load and checks their imports.
 */
const RUNTIME_IMPORT = /^\s*(?:import|export)\s+(?!type\s)[^;]*?\s+from\s+"(\.{1,2}\/[^"]+)"/gm;

function resolve(from: string, spec: string): string | null {
  const base = normalize(join(dirname(from), spec.replace(/\.js$/, "")));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function runtimeGraph(): Map<string, string[]> {
  const routes = readdirSync("api")
    .filter((f) => f.endsWith(".ts") && !f.startsWith("_"))
    .map((f) => join("api", f));
  const graph = new Map<string, string[]>();
  const pending = [...routes];
  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || graph.has(file)) continue;
    const specs = [...readFileSync(file, "utf8").matchAll(RUNTIME_IMPORT)].map((m) => m[1] ?? "");
    graph.set(file, specs);
    for (const spec of specs) {
      const target = resolve(file, spec);
      if (target) pending.push(target);
    }
  }
  return graph;
}

describe("files loaded by the API routes", () => {
  it("name the .js file in every relative import, so Node can resolve them on Vercel", () => {
    const missing: string[] = [];
    for (const [file, specs] of runtimeGraph()) {
      for (const spec of specs) if (!spec.endsWith(".js")) missing.push(`${file}: "${spec}"`);
    }
    expect(missing).toEqual([]);
  });

  it("only import files that exist", () => {
    for (const [file, specs] of runtimeGraph()) {
      for (const spec of specs) expect(resolve(file, spec), `${file}: "${spec}"`).not.toBeNull();
    }
  });
});
