import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

/**
 * K6 SOAK TEST - /v2/locations API Endpoint
 *
 * Purpose: Test system stability and reliability over extended period
 * Duration: 2 hours (can be adjusted for longer duration)
 * VUs: Sustained moderate load to detect memory leaks, degradation
 */

// Custom Metrics
const locationsLatency = new Trend("locations_api_latency", true);
const customErrorRate = new Rate("custom_business_errors");
const errorCounter = new Counter("total_errors");
const memoryLeakIndicator = new Trend("response_time_trend", true);

// Test Configuration - Soak Test Profile
export const options = {
  stages: [
    { duration: "5m", target: 30 }, // Ramp-up to moderate load
    { duration: "110m", target: 30 }, // Stay at 30 users for ~2 hours
    { duration: "5m", target: 0 }, // Ramp-down
  ],

  thresholds: {
    // Response time should remain consistent over time
    http_req_duration: ["p(95)<800", "p(99)<1500"],

    // Custom latency metric threshold
    locations_api_latency: ["p(95)<800", "p(99)<1500", "avg<400"],

    // Very low failure rate for long-running test
    http_req_failed: ["rate<0.01"],

    // Custom error rate threshold
    custom_business_errors: ["rate<0.01"],

    // Status code checks should pass consistently
    checks: ["rate>0.99"],

    // Ensure consistent throughput
    http_reqs: ["rate>20"],
  },

  tags: {
    test_type: "soak",
    endpoint: "/v2/locations",
  },
};

// Test Configuration
const BASE_URL = __ENV.BASE_URL || "https://api-staging.megaport.com";
const API_ENDPOINT = "/v2/locations";

// Test data variations
const METRO_OPTIONS = [
  "Singapore",
  "Tokyo",
  "London",
  "New York",
  "Sydney",
  "Hong Kong",
  "Paris",
  "Frankfurt",
  "Amsterdam",
  "Chicago",
  "Dallas",
  "Toronto",
  "Melbourne",
  "Mumbai",
  "São Paulo",
];
const STATUS_OPTIONS = ["Active", "Inactive"];

// Track performance over time to detect degradation
let performanceBaseline = null;
let hourlyMetrics = [];

/**
 * Setup function - Runs once before test execution
 */
export function setup() {
  console.log("🔧 Setting up Soak Test for /v2/locations");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`👥 Sustained VUs: 30`);
  console.log(`⏱️  Total Duration: 2 hours`);
  console.log(`🎯 Target: ${BASE_URL}${API_ENDPOINT}`);
  console.log("⚠️  WARNING: This is a long-running test (2 hours)");
  console.log(
    "💡 Monitoring for: memory leaks, connection leaks, performance degradation",
  );
  console.log("─".repeat(60));

  // Establish baseline performance
  const baselineRequests = [];
  for (let i = 0; i < 10; i++) {
    const testResponse = http.get(
      `${BASE_URL}${API_ENDPOINT}?locationStatuses=Active`,
      {
        headers: { Accept: "application/json" },
      },
    );
    baselineRequests.push(testResponse.timings.duration);
    sleep(0.5);
  }

  const avgBaseline =
    baselineRequests.reduce((a, b) => a + b, 0) / baselineRequests.length;

  console.log(`🔍 Baseline average response time: ${avgBaseline.toFixed(2)}ms`);
  console.log(`🔍 Baseline min: ${Math.min(...baselineRequests).toFixed(2)}ms`);
  console.log(`🔍 Baseline max: ${Math.max(...baselineRequests).toFixed(2)}ms`);
  console.log("─".repeat(60));

  return {
    startTime: new Date().toISOString(),
    testType: "soak",
    baselineAvg: avgBaseline,
    baselineMin: Math.min(...baselineRequests),
    baselineMax: Math.max(...baselineRequests),
    checkpoints: [],
  };
}

/**
 * Main test function - Runs for each VU iteration
 * @param {any} data - Setup data
 */
export default function (data) {
  // Dynamic data generation using __VU and __ITER for variety
  const metroIndex = (__VU + __ITER) % METRO_OPTIONS.length;
  const statusIndex = __ITER % STATUS_OPTIONS.length;

  // Prepare headers
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Request-ID": `soak-test-${__VU}-${__ITER}-${Date.now()}`,
    "X-Test-Type": "soak",
  };

  // Prepare query parameters with dynamic data
  const params = {
    locationStatuses: STATUS_OPTIONS[statusIndex],
    metro: METRO_OPTIONS[metroIndex],
  };

  // Build URL with query parameters
  const url = `${BASE_URL}${API_ENDPOINT}?${Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;

  // Make the API request
  const startTime = new Date().getTime();
  const response = http.get(url, {
    headers,
    timeout: "10s",
  });
  const duration = new Date().getTime() - startTime;

  // Record custom latency metric
  locationsLatency.add(duration);

  // Track response time trend to detect degradation
  memoryLeakIndicator.add(duration);

  // Validation checks
  const checkResult = check(response, {
    "Status is 200 or 403": (r) => r.status === 200 || r.status === 403,
    "Response time < 1500ms": (r) => r.timings.duration < 1500,
    "Response time < 800ms (p95 target)": (r) => r.timings.duration < 800,
    "Response has message field": (r) => {
      try {
        if (r.status === 403) return true; // Skip for 403
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return body.hasOwnProperty("message");
      } catch (e) {
        return false;
      }
    },
    "Response has data array": (r) => {
      try {
        if (r.status === 403) return true; // Skip for 403
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
    "Response contains expected message": (r) => {
      try {
        if (r.status === 403) return true; // Skip for 403
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return (
          body.message && body.message.includes("List all public locations")
        );
      } catch (e) {
        return false;
      }
    },
    "Data items have required fields": (r) => {
      try {
        if (r.status === 403) return true; // Skip for 403
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        if (body.data && body.data.length > 0) {
          const location = body.data[0];
          return (
            location.hasOwnProperty("id") &&
            location.hasOwnProperty("name") &&
            location.hasOwnProperty("status") &&
            location.hasOwnProperty("country") &&
            location.hasOwnProperty("siteCode")
          );
        }
        return true; // No data is acceptable
      } catch (e) {
        return false;
      }
    },
    "Content-Type is JSON": (r) => {
      return !!(
        r.headers["Content-Type"] &&
        r.headers["Content-Type"].includes("application/json")
      );
    },
    "No connection errors": (r) => {
      return r.error === "" || r.error === undefined;
    },
  });

  // Track custom business errors
  let hasBusinessError = false;
  try {
    if (response.status === 200 && typeof response.body === "string") {
      const body = JSON.parse(response.body);
      // Custom business logic validation
      if (body.data && body.data.length > 0) {
        body.data.forEach((/** @type {any} */ location) => {
          // Verify filtered results match query params
          if (location.status !== params.locationStatuses) {
            hasBusinessError = true;
          }
          if (params.metro && location.metro !== params.metro) {
            hasBusinessError = true;
          }
        });
      }
    } else if (response.status === 200) {
      hasBusinessError = true;
    }
  } catch (e) {
    hasBusinessError = true;
  }

  customErrorRate.add(hasBusinessError);

  // Count errors
  if (response.status !== 200 || !checkResult) {
    errorCounter.add(1);
  }

  // Periodic checkpoint logging (every 15 minutes)
  if (__ITER % 900 === 0 && __VU === 1) {
    const timeElapsed =
      (Date.now() - new Date(data.startTime).getTime()) / 1000 / 60;
    console.log(`⏰ Checkpoint at ${timeElapsed.toFixed(0)} minutes`);
    console.log(`   Current response time: ${duration}ms`);
    console.log(`   Baseline avg: ${data.baselineAvg.toFixed(2)}ms`);
    console.log(
      `   Degradation: ${((duration / data.baselineAvg - 1) * 100).toFixed(2)}%`,
    );
  }

  // Log errors and performance issues (sample logging)
  if (!checkResult && __ITER % 100 === 0) {
    console.error(`❌ Check failed for iteration ${__ITER} (VU: ${__VU})`);
    console.error(`   Status: ${response.status}, Duration: ${duration}ms`);
  } else if (duration > 1000 && __ITER % 100 === 0) {
    console.warn(
      `⚠️  Slow response detected: ${duration}ms (VU: ${__VU}, Iteration: ${__ITER})`,
    );
  }

  // Alert if performance has degraded significantly
  if (duration > data.baselineAvg * 2 && __ITER % 50 === 0) {
    console.warn(`🚨 Performance degradation detected!`);
    console.warn(
      `   Current: ${duration}ms vs Baseline: ${data.baselineAvg.toFixed(2)}ms`,
    );
    console.warn(`   This may indicate memory leak or resource exhaustion`);
  }

  // Realistic pacing between requests (simulate user think time)
  sleep(1);
}

/**
 * Teardown function - Runs once after test execution
 * @param {any} data - Setup data
 */
export function teardown(data) {
  const endTime = new Date();
  const startTime = new Date(data.startTime);
  const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // minutes

  console.log("─".repeat(60));
  console.log("🏁 Soak Test Completed for /v2/locations");
  console.log(`📊 Test Type: ${data.testType}`);
  console.log(`🕐 Started: ${data.startTime}`);
  console.log(`🕐 Ended: ${endTime.toISOString()}`);
  console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)} minutes`);
  console.log("─".repeat(60));
  console.log("📈 Performance Baseline:");
  console.log(`   Average: ${data.baselineAvg.toFixed(2)}ms`);
  console.log(`   Min: ${data.baselineMin.toFixed(2)}ms`);
  console.log(`   Max: ${data.baselineMax.toFixed(2)}ms`);
  console.log("─".repeat(60));
  console.log("✅ Analysis checklist:");
  console.log("   □ Compare final response times to baseline");
  console.log("   □ Check for memory leak indicators (gradual slowdown)");
  console.log("   □ Review error rate trends over time");
  console.log("   □ Verify connection pool stability");
  console.log("   □ Monitor system resources (CPU, memory, disk I/O)");
  console.log("   □ Check application logs for repeated errors");
  console.log("   □ Verify database connection pool health");
  console.log("─".repeat(60));
}
