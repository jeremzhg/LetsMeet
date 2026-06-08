import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError } from "./api";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { id: "1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(apiFetch("/ok")).resolves.toEqual({ success: true, data: { id: "1" } });
  });

  it("throws ApiError on failed response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: "bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(apiFetch("/bad")).rejects.toBeInstanceOf(ApiError);
  });
});
