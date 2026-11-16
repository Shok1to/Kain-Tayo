import { describe, expect, it } from "vitest";
import { cleanSearch, exportFields, listHref, parseListParams } from "./list-params";

describe("admin list address bar values", () => {
  it("reads valid search, filters, sort and page", () => {
    const params = parseListParams({
      q: "Test Person",
      province: "Ontario",
      businessType: "Other",
      emailConsent: "yes",
      from: "2026-11-01",
      to: "2026-11-15",
      sort: "oldest",
      page: "2",
    });
    expect(params).toEqual({
      q: "Test Person",
      province: "Ontario",
      businessType: "Other",
      emailConsent: "yes",
      from: "2026-11-01",
      to: "2026-11-15",
      sort: "oldest",
      page: 2,
    });
  });

  it("ignores values that are not on the allowed lists", () => {
    const params = parseListParams({
      province: "Atlantis",
      businessType: "Pirate",
      emailConsent: "maybe",
      from: "yesterday",
      to: "2026-13-45",
      sort: "random",
      page: "-3",
    });
    expect(params).toMatchObject({
      province: "",
      businessType: "",
      emailConsent: "",
      from: "",
      to: "",
      sort: "newest",
      page: 1,
    });
  });

  it("removes characters that have a special meaning in database filters", () => {
    expect(cleanSearch("test@example.com")).toBe("test@example.com");
    expect(cleanSearch("a,b(c)%_*d")).toBe("a b c d");
    expect(cleanSearch("O'Brien & Co")).toBe("O'Brien & Co");
  });

  it("builds page links that keep the filters", () => {
    const params = parseListParams({ q: "Test", province: "Ontario" });
    expect(listHref(params, { page: 2 })).toBe("/admin?q=Test&province=Ontario&page=2");
    expect(listHref(parseListParams({}))).toBe("/admin");
  });
});

describe("CSV download form", () => {
  it("keeps the search and filters but not the page", () => {
    const params = parseListParams({ q: "Test", emailConsent: "yes", page: "3" });
    expect(exportFields(params)).toEqual([["q", "Test"], ["emailConsent", "yes"]]);
    expect(exportFields(parseListParams({}))).toEqual([]);
  });
});
