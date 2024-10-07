import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { getPerformanceNavigationTiming } from "./_mock-performance";
import { Footprint } from "../Footprint";

const mockedGetEntriesByType = mock.method(
  performance,
  "getEntriesByType",
  (type: string) => {
    if (type === "navigation") {
      const entry1 = getPerformanceNavigationTiming({
        name: "https://example.com",
        transferSize: 200,
        duration: 100,
      });
      const entry2 = getPerformanceNavigationTiming({
        name: "https://example2.com",
        transferSize: 500,
        duration: 500,
      });

      return [entry1, entry2];
    }
    return [];
  },
);

describe("Footprint class", () => {
  it('Should call getEntriesByType with "navigation" and "resource"', () => {
    const footprint = new Footprint(performance);
    footprint.resources;
    const mockCalls = mockedGetEntriesByType.mock.calls;
    // @ts-expect-error
    const mockArgs = mockCalls.map((call) => call.arguments[0]);
    assert.strictEqual(mockedGetEntriesByType.mock.calls.length, 2);
    assert.strictEqual(mockArgs.includes("navigation"), true);
    assert.strictEqual(mockArgs.includes("resource"), true);
  });

  it("should calculate emissions", () => {
    const footprint = new Footprint(performance);
    const results = footprint.resources;
    assert.strictEqual(results.totalBytes, 700);
    assert.strictEqual(results.totalDuration, 600);
    assert.strictEqual(results.totalCo2 > 0, true);
    assert.strictEqual(results.length, 2);

    // Get html category
    const htmlCategory = footprint.getByCategory("html");
    assert.strictEqual(htmlCategory.totalBytes, 700);
    assert.strictEqual(htmlCategory.totalDuration, 600);
    assert.strictEqual(htmlCategory.totalCo2 > 0, true);
    assert.strictEqual(htmlCategory.length, 2);
  });

  it("should ignore individual resources", () => {
    const footprint = new Footprint(performance);
    footprint.ignore(/example.com/);
    const resources = footprint.resources;
    // const htmlResources = footprint.getByCategory("html");
    assert.strictEqual(resources.length, 1);
  });

  it("should ignore multiple resources", () => {
    const footprint = new Footprint(performance);
    footprint.ignored = [/example.com/, /example2.com/];
    const resources = footprint.resources;
    assert.strictEqual(resources.length, 0);
  });

  it("should estimate connection speed based on resource transfer time", () => {
    const footprint = new Footprint(performance);

    const speedEstimate = footprint.speedEstimate;
    assert.strictEqual(speedEstimate, 0.0009765625);
  });
});
