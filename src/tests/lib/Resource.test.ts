import { describe, it } from "node:test";
import assert from "node:assert";
import { Resource } from "../../lib/Resource";
import { getPerformanceNavigationTiming } from "../_mock-performance";

describe("Resource class", () => {
  it("should store the entry", () => {
    const entry = getPerformanceNavigationTiming();
    const resource = new Resource(entry);
    assert.strictEqual(resource._entry, entry);
  });

  it("should return correct name", () => {
    const entry = getPerformanceNavigationTiming();
    const resource = new Resource(entry);
    assert.strictEqual(resource.name, "https://example.com");
  });

  it("should return correct duration", () => {
    const entry = getPerformanceNavigationTiming();
    const resource = new Resource(entry);
    assert.strictEqual(resource.duration, 100);
  });

  it("should return the largest byte size", () => {
    const entry = getPerformanceNavigationTiming();
    const resource = new Resource(entry);
    assert.strictEqual(resource.bytes, 200); // The largest of the sizes
  });

  it("should return correct size string", () => {
    const entryB = getPerformanceNavigationTiming({
      transferSize: 200,
    });
    const resourceB = new Resource(entryB);
    assert.strictEqual(resourceB.sizeString, "200 B");

    // Test KB
    const entryKB = getPerformanceNavigationTiming({
      transferSize: 3000,
    });
    const resourceKB = new Resource(entryKB);
    assert.strictEqual(resourceKB.sizeString, "2.93 KB");

    // Test MB
    const entryMB = getPerformanceNavigationTiming({
      transferSize: 1024 * 1024 * 5.4,
    });
    const resourceMB = new Resource(entryMB);
    assert.strictEqual(resourceMB.sizeString, "5.40 MB");
  });

  it("should determine if the resource is external", () => {
    const entry = getPerformanceNavigationTiming();
    const resource = new Resource(entry);
    // Is external resolves to null, because window.origin.location is undefined in nodejs
    assert.strictEqual(resource.isExternal, null);

    // Test with window object
    // @ts-ignore
    global.window = { location: { origin: "https://example.com" } };
    assert.strictEqual(resource.isExternal, false);
  });

  it("should calculate CO2 emissions", () => {
    const entryMid = getPerformanceNavigationTiming({
      transferSize: 1000,
    });
    const resourceMid = new Resource(entryMid);
    const co2Mid = resourceMid.co2;
    assert.strictEqual(typeof co2Mid, "number");
    assert.strictEqual(co2Mid > 0, true);

    const entryLow = getPerformanceNavigationTiming({
      transferSize: 500,
    });
    const resourceLow = new Resource(entryLow);
    const entryHigh = getPerformanceNavigationTiming({
      transferSize: 2000,
    });
    const resourceHigh = new Resource(entryHigh);

    // Assert that it grows and shrinks with the size of the resource
    assert.strictEqual(resourceLow.co2, co2Mid / 2);
    assert.strictEqual(resourceHigh.co2, co2Mid * 2);
  });

  it("should categorize resources", () => {
    const entry = getPerformanceNavigationTiming();
    const resource = new Resource(entry);
    assert.strictEqual(resource.category, "html");

    const scriptEntry = getPerformanceNavigationTiming({
      name: "https://example.com/script.js",
      entryType: "resource",
    });
    const scriptResource = new Resource(scriptEntry);
    assert.strictEqual(scriptResource.category, "js");

    const jsxEntry = getPerformanceNavigationTiming({
      name: "https://example.com/component.jsx",
      entryType: "resource",
    });
    const jsxResource = new Resource(jsxEntry);
    assert.strictEqual(jsxResource.category, "js");

    const tsEntry = getPerformanceNavigationTiming({
      name: "https://example.com/component.ts",
      entryType: "resource",
    });
    const tsResource = new Resource(tsEntry);
    assert.strictEqual(tsResource.category, "js");

    const cssEntry = getPerformanceNavigationTiming({
      name: "https://example.com/style.css",
      entryType: "resource",
    });
    const cssResource = new Resource(cssEntry);
    assert.strictEqual(cssResource.category, "css");

    const sassEntry = getPerformanceNavigationTiming({
      name: "https://example.com/style.sass",
      entryType: "resource",
    });
    const sassResource = new Resource(sassEntry);
    assert.strictEqual(sassResource.category, "css");

    const scssEntry = getPerformanceNavigationTiming({
      name: "https://example.com/style.scss",
      entryType: "resource",
    });
    const scssResource = new Resource(scssEntry);
    assert.strictEqual(scssResource.category, "css");

    const imageEntry = getPerformanceNavigationTiming({
      name: "https://example.com/image.jpg",
      entryType: "resource",
    });
    const imageResource = new Resource(imageEntry);
    assert.strictEqual(imageResource.category, "media");

    const mediaEntry = getPerformanceNavigationTiming({
      name: "https://example.com/video.mp4",
      entryType: "resource",
    });
    const mediaResource = new Resource(mediaEntry);
    assert.strictEqual(mediaResource.category, "media");
  });
});
