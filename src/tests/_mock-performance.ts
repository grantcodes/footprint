const defaultPerformanceNavigationTimingData = {
  type: "navigate",
  startTime: 0,
  duration: 100,
  domComplete: 100,
  domContentLoadedEventEnd: 50,
  loadEventEnd: 100,
  name: "https://example.com",
  entryType: "navigation",
  toJSON() {
    return {};
  },
  domContentLoadedEventStart: 0,
  domInteractive: 0,
  loadEventStart: 0,
  redirectCount: 0,
  unloadEventEnd: 0,
  unloadEventStart: 0,
  workerStart: 0,
  connectEnd: 0,
  connectStart: 0,
  decodedBodySize: 120,
  encodedBodySize: 150,
  domainLookupEnd: 0,
  domainLookupStart: 0,
  fetchStart: 0,
  initiatorType: "navigation",
  nextHopProtocol: "h2",
  redirectEnd: 0,
  redirectStart: 0,
  requestStart: 0,
  responseEnd: 0,
  responseStart: 0,
  secureConnectionStart: 0,
  serverTiming: [],
  transferSize: 200,
};

// Fake PerformanceNavigationTiming class for nodejs & testing
class PerformanceNavigationTiming {
  constructor(options: Partial<typeof defaultPerformanceNavigationTimingData>) {
    for (const key in defaultPerformanceNavigationTimingData) {
      if (key in options) {
        // @ts-ignore
        this[key] = options[key];
      } else {
        // @ts-ignore
        this[key] = defaultPerformanceNavigationTimingData[key];
      }
    }
  }
}

function getPerformanceNavigationTiming(
  options: Partial<typeof defaultPerformanceNavigationTimingData> = {},
): PerformanceNavigationTiming {
  // @ts-ignore
  return new PerformanceNavigationTiming(options);
}

export { getPerformanceNavigationTiming };
