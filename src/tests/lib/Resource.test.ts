import { describe, it } from "node:test";
import assert from "node:assert";

import { Resource } from "../../lib/Resource";

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

describe("Resource class", () => {
  // Testing constructor and getters
  const entry = new PerformanceNavigationTiming();
  const resource = new Resource(entry);

  it("should store the entry", () => {
    assert.strictEqual(resource._entry, entry);
  });

  it("should return correct name", () => {
    assert.strictEqual(resource.name, "https://example.com");
  });

  it("should return correct duration", () => {
    assert.strictEqual(resource.duration, 100);
  });

  it("should return the largest byte size", () => {
    assert.strictEqual(resource.bytes, 200); // The largest of the sizes
  });

  it("should return correct size string", () => {
    assert.strictEqual(resource.sizeString, "200 B");

    // Test KB
    entry.transferSize = 3000;
    assert.strictEqual(resource.sizeString, "2.93 KB");

    // Test MB
    entry.transferSize = 1024 * 1024 * 5.4;
    assert.strictEqual(resource.sizeString, "5.40 MB");
  });

  it("should determine if the resource is external", () => {
    // Is external resolves to null, because window.origin.location is undefined in nodejs
    assert.strictEqual(resource.isExternal, null);

    // Test with window object
    // @ts-ignore
    global.window = { location: { origin: "https://example.com" } };
    assert.strictEqual(resource.isExternal, false);
  });

  it("should calculate CO2 emissions", () => {
    const originalCo2 = resource.co2;
    assert.strictEqual(typeof originalCo2, "number");
    assert.strictEqual(originalCo2 > 0, true);

    // Assert that it grows and shrinks with the size of the resource
    entry.transferSize = entry.transferSize * 2;
    assert.strictEqual(resource.co2, originalCo2 * 2);

    entry.transferSize = entry.transferSize / 4;
    assert.strictEqual(resource.co2, originalCo2 / 2);
  });
});
