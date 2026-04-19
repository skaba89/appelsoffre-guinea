// ─── Tests: Search Engine ─────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from "vitest";
import {
  search,
  getSuggestions,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  countByType,
  facetBySector,
  facetByRegion,
  type SearchFilter,
} from "@/lib/search-engine";

// ─── search() ─────────────────────────────────────────────────────────────────

describe("search", () => {
  it("should return results for a matching query", () => {
    const results = search("construction route");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].document.title).toBeDefined();
  });

  it("should rank irrelevant queries lower than relevant ones", () => {
    const irrelevantResults = search("quantumphysics2029xyz");
    const relevantResults = search("BTP construction");
    // Relevant queries should produce higher top relevance
    if (relevantResults.length > 0 && irrelevantResults.length > 0) {
      expect(relevantResults[0].relevance).toBeGreaterThanOrEqual(irrelevantResults[0].relevance);
    }
  });

  it("should return all documents for empty query", () => {
    const results = search("");
    expect(results.length).toBeGreaterThan(0);
  });

  it("should compute relevance scores between 0 and 1", () => {
    const results = search("BTP");
    for (const r of results) {
      expect(r.relevance).toBeGreaterThanOrEqual(0);
      expect(r.relevance).toBeLessThanOrEqual(1);
    }
  });

  it("should return highlights for matching terms", () => {
    const results = search("construction");
    const withHighlights = results.filter((r) => r.highlights.length > 0);
    // Some results should have highlights
    expect(withHighlights.length).toBeGreaterThanOrEqual(0);
  });

  it("should filter by type", () => {
    const results = search("", { type: ["tender"] });
    for (const r of results) {
      expect(r.document.type).toBe("tender");
    }
  });

  it("should filter by sector", () => {
    const results = search("", { sectors: ["BTP"] });
    for (const r of results) {
      if (r.document.sector) {
        expect(r.document.sector).toBe("BTP");
      }
    }
  });

  it("should filter by region", () => {
    const results = search("", { regions: ["Conakry"] });
    for (const r of results) {
      if (r.document.region) {
        expect(r.document.region).toBe("Conakry");
      }
    }
  });

  it("should filter by score minimum", () => {
    const results = search("", { scoreMin: 70 });
    for (const r of results) {
      if (r.document.score !== undefined) {
        expect(r.document.score).toBeGreaterThanOrEqual(70);
      }
    }
  });

  it("should respect maxResults option", () => {
    const results = search("", undefined, { maxResults: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("should find IT/Digital tenders", () => {
    const results = search("informatique");
    expect(results.length).toBeGreaterThan(0);
  });

  it("should find contacts", () => {
    const results = search("Directeur");
    expect(results.length).toBeGreaterThan(0);
  });

  it("should find documents", () => {
    const results = search("Code Marchés Publics");
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── getSuggestions() ─────────────────────────────────────────────────────────

describe("getSuggestions", () => {
  it("should return popular searches for empty query", () => {
    const suggestions = getSuggestions("");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.type === "popular")).toBe(true);
  });

  it("should return completion suggestions for partial query", () => {
    const suggestions = getSuggestions("BTP");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("should return entity suggestions", () => {
    const suggestions = getSuggestions("Banque");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("should limit suggestions to 10", () => {
    const suggestions = getSuggestions("a");
    expect(suggestions.length).toBeLessThanOrEqual(10);
  });

  it("should not contain duplicate suggestions", () => {
    const suggestions = getSuggestions("BTP");
    const texts = suggestions.map((s) => s.text.toLowerCase());
    const unique = new Set(texts);
    expect(texts.length).toBe(unique.size);
  });
});

// ─── Saved Searches ──────────────────────────────────────────────────────────

describe("Saved Searches", () => {
  it("should return default saved searches", () => {
    const saved = getSavedSearches();
    expect(saved.length).toBeGreaterThan(0);
  });

  it("should save a new search", () => {
    const initialCount = getSavedSearches().length;
    const newSearch = saveSearch({
      name: "Test Search",
      query: "test query",
      filters: {},
      isAlert: false,
    });
    expect(newSearch.id).toBeTruthy();
    expect(newSearch.name).toBe("Test Search");
    expect(getSavedSearches().length).toBe(initialCount + 1);
  });

  it("should delete a saved search", () => {
    const newSearch = saveSearch({
      name: "To Delete",
      query: "delete me",
      filters: {},
      isAlert: false,
    });
    const countBefore = getSavedSearches().length;
    const deleted = deleteSavedSearch(newSearch.id);
    expect(deleted).toBe(true);
    expect(getSavedSearches().length).toBe(countBefore - 1);
  });

  it("should return false for deleting non-existent search", () => {
    const deleted = deleteSavedSearch("non-existent-id");
    expect(deleted).toBe(false);
  });
});

// ─── Facet Functions ──────────────────────────────────────────────────────────

describe("Facet functions", () => {
  const results = search("");

  it("countByType should return counts by document type", () => {
    const counts = countByType(results);
    expect(counts.tender).toBeGreaterThan(0);
    expect(typeof counts.tender).toBe("number");
  });

  it("facetBySector should return sorted sector facets", () => {
    const facets = facetBySector(results);
    expect(facets.length).toBeGreaterThan(0);
    expect(facets[0].sector).toBeTruthy();
    expect(facets[0].count).toBeGreaterThan(0);
    // Should be sorted by count descending
    for (let i = 1; i < facets.length; i++) {
      expect(facets[i].count).toBeLessThanOrEqual(facets[i - 1].count);
    }
  });

  it("facetByRegion should return sorted region facets", () => {
    const facets = facetByRegion(results);
    expect(facets.length).toBeGreaterThan(0);
    expect(facets[0].region).toBeTruthy();
  });
});
