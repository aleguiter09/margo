import { describe, expect, it } from "vitest";
import { resolveEntityByName } from "@/modules/ai/utils/resolve-entity";

describe("resolveEntityByName", () => {
  const accounts = [
    { id: 1, name: "Cash" },
    { id: 2, name: "Bank ES" },
    { id: 3, name: "Bank US" },
  ];

  it("resolves exact matches case-insensitively", () => {
    expect(resolveEntityByName(accounts, "cash")).toEqual({
      status: "ok",
      id: 1,
      name: "Cash",
    });
  });

  it("resolves unique partial matches", () => {
    expect(resolveEntityByName(accounts, "cash")).toMatchObject({
      status: "ok",
      id: 1,
    });
  });

  it("returns ambiguous when multiple partial matches", () => {
    const result = resolveEntityByName(accounts, "bank");
    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.matches).toHaveLength(2);
    }
  });

  it("returns not_found when nothing matches", () => {
    expect(resolveEntityByName(accounts, "wallet")).toEqual({
      status: "not_found",
      query: "wallet",
    });
  });
});
