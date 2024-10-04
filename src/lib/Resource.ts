import { co2 } from "@tgwf/co2";

export type ResourceCategory = "media" | "js" | "css" | "html" | "other";

const co2Emission = new co2();

// @ts-ignore
const speedEstimate = navigator?.connection?.downlink ?? 0;

class Resource {
  _entry: PerformanceResourceTiming | PerformanceNavigationTiming;
  isEstimated = false;

  constructor(entry: PerformanceResourceTiming | PerformanceNavigationTiming) {
    this._entry = entry;
  }

  get name(): string {
    return this._entry.name;
  }

  get duration(): number {
    return this._entry.duration;
  }

  get bytes(): number {
    // Pick the largest size from the various size properties
    const maxSize = Math.max(
      this._entry.encodedBodySize,
      this._entry.decodedBodySize,
      this._entry.transferSize,
    );
    if (maxSize) {
      return maxSize;
    }

    if (speedEstimate && this._entry.duration) {
      this.isEstimated = true;
      return Math.round(speedEstimate * this._entry.duration);
    }

    return 0;
  }

  get sizeString(): string {
    if (this.bytes < 1024) {
      return `${this.bytes} B`;
    }
    const kb = this.bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  get isExternal(): boolean | null {
    if (typeof window === "undefined") {
      return null;
    }
    return !this.name.startsWith(window?.location?.origin);
  }

  get category(): ResourceCategory {
    let category: ResourceCategory = "other";

    const fileExtension = this._entry.name.includes(".")
      ? this._entry.name.split(".").pop()
      : "";

    if (!fileExtension) {
      return category;
    }

    // Sometimes CSS loaded by JS is detected as a script
    if (["css", "scss", "sass", "less"].includes(fileExtension)) {
      category = "css";
    }

    if (
      ["js", "mjs", "jsx", "ts", "tsx", "cjs", "vue", "svelte"].includes(
        fileExtension,
      )
    ) {
      category = "js";
    }

    if (
      ["svg", "jpg", "webp", "avif", "mp4", "png", "gif"].includes(
        fileExtension,
      )
    ) {
      category = "media";
    }

    if (this._entry.entryType === "navigation") {
      category = "html";
    }

    return category;
  }

  get co2(): number {
    return co2Emission.perByte(this.bytes, true);
  }
}

export { Resource };
