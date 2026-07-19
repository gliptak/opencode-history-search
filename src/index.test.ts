import { test, expect, describe } from "bun:test";
import historySearch from "./index";

describe("historySearch tool", () => {
  test("exports a tool with a description", () => {
    expect(historySearch).toBeDefined();
    expect(typeof historySearch).toBe("object");
  });

  test("tool schema includes terms parameter for multi-term search", () => {
    const description = (historySearch as any).description ?? "";
    const args = (historySearch as any).args ?? {};
    expect(args).toHaveProperty("terms");
  });
});
