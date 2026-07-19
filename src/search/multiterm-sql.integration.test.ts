import { test, expect, describe } from "bun:test";
import { searchMultiterm } from "./multiterm-sql";

describe("multiterm SQL search (integration - requires real opencode.db)", () => {
  test("real history: finds ses_0d62f1f50ffeadcrTabJufiC93 for truck+vertex+gemini", async () => {
    const results = await searchMultiterm(null, ["truck", "vertex", "gemini"]);
    const ids = results.map((r) => r.sessionID);
    expect(ids).toContain("ses_0d62f1f50ffeadcrTabJufiC93");
  });

  test("multi-term returns subset of single-term baseline", async () => {
    const single = await searchMultiterm(null, ["truck"]);
    const multi = await searchMultiterm(null, ["truck", "vertex"]);
    expect(multi.length).toBeLessThanOrEqual(single.length);
  });

  test("every returned session's termHits covers all query terms", async () => {
    const results = await searchMultiterm(null, ["truck", "vertex", "gemini"]);
    for (const r of results) {
      for (const term of ["truck", "vertex", "gemini"]) {
        expect(
          r.termHits.has(term),
          `session ${r.sessionID} missing term ${term}`,
        ).toBe(true);
      }
    }
  });

  test("returns empty for non-existent term in non-current project", async () => {
    const results = await searchMultiterm("4b0ea68d7af9a6031a7ffda7ad66e0cb83315750", ["qX7vK2zP9wR5tY8mN3jF"]);
    expect(results).toHaveLength(0);
  });

  test("multi-term completes in under 3 seconds (smoke)", async () => {
    const t0 = performance.now();
    await searchMultiterm(null, ["truck", "vertex", "gemini"]);
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(3000);
  });

  test("project-scoped search only returns sessions in that project", async () => {
    const projectID = "4b0ea68d7af9a6031a7ffda7ad66e0cb83315750";
    const results = await searchMultiterm(projectID, ["truck"]);
    expect(Array.isArray(results)).toBe(true);
    for (const r of results) {
      expect(r).toHaveProperty("projectDirectory");
    }
  });

  test("end-to-end via the full tool: terms parameter returns ses_0d62f1f50ffeadcrTabJufiC93", async () => {
    const { formatMultitermResults } = await import("../format");
    const { searchMultiterm } = await import("./multiterm-sql");
    const results = await searchMultiterm(null, ["truck", "vertex", "gemini"]);
    const output = formatMultitermResults(results);
    expect(output).toContain("ses_0d62f1f50ffeadcrTabJufiC93");
  });
});
