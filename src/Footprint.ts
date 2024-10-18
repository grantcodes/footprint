import type { ResourceCategory } from "./lib/Resource";
import { Resource } from "./lib/Resource";

class FootprintResources extends Array<Resource> {
  get totalBytes(): number {
    return this.reduce((total, resource) => total + resource.bytes, 0);
  }

  get totalDuration(): number {
    return this.reduce((total, resource) => total + resource.duration, 0);
  }

  get totalCo2(): number {
    return this.reduce((total, resource) => total + resource.co2, 0);
  }
}

class Footprint {
  private _ignored: RegExp[] = [];
  private _resources: Resource[] = [];
  // @ts-ignore
  private _speedEstimate: number = navigator?.connection?.downlink ?? 0;

  constructor(performance: Performance) {
    // Add all resource entries
    const performanceResourceTimings = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    for (const entry of performanceResourceTimings) {
      this.addEntry(entry);
    }

    // Add all navigation entries
    const performanceNavigationTimings = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    for (const entry of performanceNavigationTimings) {
      this.addEntry(entry);
    }

    // Sort resources by co2 emission
    this._resources.sort((a, b) => b.co2 - a.co2);
  }

  /**
   * Add an entry to the resources list
   * @param entry {PerformanceResourceTiming | PerformanceNavigationTiming} The entry to add
   * @returns {void}
   */
  private addEntry(
    entry: PerformanceResourceTiming | PerformanceNavigationTiming,
  ) {
    // Do not add if entry is in ignored list
    if (this._ignored.some((ignored) => entry.name.match(ignored))) {
      return;
    }
    const resource = new Resource(entry);

    this._resources.push(resource);

    // Also estimate connection speed based on transfer time when adding a resource.
    if (
      entry.transferSize &&
      entry.duration &&
      // @ts-ignore
      !navigator?.connection?.downlink
    ) {
      const speedEstimate = entry.transferSize / entry.duration / 1024;
      // If there is no estimate, or the new estimate is lower, set it as the estimated speed.
      if (!this._speedEstimate || speedEstimate < this._speedEstimate) {
        this.speedEstimate = speedEstimate;
      }
    }
  }

  /**
   * Get the estimated connection speed
   */
  get speedEstimate(): number {
    return this._speedEstimate;
  }

  /**
   * Set the estimated connection speed for all resources
   */
  private set speedEstimate(speed: number) {
    this._speedEstimate = speed;
    for (const resource of this._resources) {
      resource.speedEstimate = speed;
    }
  }

  /**
   * Add a pattern to ignore
   * @param pattern {RegExp} The pattern to ignore
   */
  ignore(pattern: RegExp) {
    // Add to ignored list
    this._ignored.push(pattern);

    // Remove from existing resources list
    if (this._resources.length) {
      this._resources = this._resources.filter(
        (resource) => !resource.name.match(pattern),
      );
    }
  }

  /**
   * Set the ignored patterns
   */
  set ignored(patterns: RegExp[]) {
    this._ignored = [...patterns];

    // Remove from existing resources list
    if (this._resources.length) {
      for (const pattern of patterns) {
        this._resources = this._resources.filter(
          (resource) => !resource.name.match(pattern),
        );
      }
    }
  }

  /**
   * Get the ignored patterns
   */
  get ignored(): RegExp[] {
    return this._ignored;
  }

  /**
   * Get resources for a specific category
   * @param category {ResourceCategory} The category to filter by
   * @returns
   */
  getByCategory(category: ResourceCategory): FootprintResources {
    const results = this._resources.filter(
      (resource) => resource.category === category,
    );
    return new FootprintResources(...results);
  }

  /**
   * Get all resources
   */
  get resources(): FootprintResources {
    return new FootprintResources(...this._resources);
  }
}

export type { FootprintResources, Resource as FootprintResource };

export { Footprint };
