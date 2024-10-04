import { describe, it, mock } from "node:test";
import assert from "node:assert";

import { Footprint } from "../Footprint";

// Fake PerformanceNavigationTiming class for nodejs & testing
class PerformanceNavigationTiming {
  type = "navigate";
  startTime = 0;
  duration = 100;
  domComplete = 100;
  domContentLoadedEventEnd = 50;
  loadEventEnd = 100;
  name = "https://example.com";
  entryType = "navigation";
  toJSON() {
    return {};
  }
  domContentLoadedEventStart = 0;
  domInteractive = 0;
  loadEventStart = 0;
  redirectCount = 0;
  unloadEventEnd = 0;
  unloadEventStart = 0;
  workerStart = 0;
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 120;
  encodedBodySize = 150;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  fetchStart = 0;
  initiatorType = "navigation";
  nextHopProtocol = "h2";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  serverTiming = [];
  transferSize = 200;
}

const entry1 = new PerformanceNavigationTiming();
const entry2 = new PerformanceNavigationTiming();
entry2.name = "https://example2.com";

const mockedGetEntriesByType = mock.method(
  performance,
  "getEntriesByType",
  (type: string) => {
    if (type === "navigation") {
      return [entry1, entry2];
    }
    return [];
  },
);

describe("Footprint class", () => {
  it('Should call getEntriesByType with "navigation" and "resource"', () => {
    const footprint = new Footprint(performance);
    const resources = footprint.resources;
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
    assert.strictEqual(results.totalBytes, 400);
    assert.strictEqual(results.totalDuration, 200);
    assert.strictEqual(results.totalCo2 > 0, true);
    assert.strictEqual(results.length, 2);

    // Get html category
    const htmlCategory = footprint.getByCategory("html");
    assert.strictEqual(htmlCategory.totalBytes, 400);
    assert.strictEqual(htmlCategory.totalDuration, 200);
    assert.strictEqual(htmlCategory.totalCo2 > 0, true);
    assert.strictEqual(htmlCategory.length, 2);
  });

  it("should ignore resources", () => {
    const footprint = new Footprint(performance);
    footprint.ignore(/example.com/);
    const resources = footprint.resources;
    // const htmlResources = footprint.getByCategory("html");
    assert.strictEqual(resources.length, 1);
  });
});
