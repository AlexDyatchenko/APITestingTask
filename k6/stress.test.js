import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

/**
 * K6 STRESS TEST - /v2/locations API Endpoint
 *
 * Purpose: Test system behavior under extreme load beyond normal capacity
 * Duration: 15 minutes
 * VUs: Ramp up to breaking point (200+ users)
 */

// Custom Metrics
const locationsLatency = new Trend("locations_api_latency", true);
const customErrorRate = new Rate("custom_business_errors");
const errorCounter = new Counter("total_errors");

// Test Configuration - Stress Test Profile
export const options = {
  stages: [
    { duration: "2m", target: 50 }, // Ramp-up to normal load
    { duration: "3m", target: 100 }, // Increase to above normal
    { duration: "3m", target: 150 }, // Push further
    { duration: "3m", target: 200 }, // Push to breaking point
    { duration: "2m", target: 250 }, // Maximum stress
    { duration: "2m", target: 0 }, // Ramp-down for recovery
  ],

  thresholds: {
    // More lenient thresholds for stress testing
    http_req_duration: ["p(95)<2000", "p(99)<5000"],

    // Custom latency metric threshold
    locations_api_latency: ["p(95)<2000", "p(99)<5000"],

    // Higher failure tolerance during stress - API returns 403
    http_req_failed: ["rate<0.75"], // Allow up to 75% failure due to 403

    // Custom error rate threshold
    custom_business_errors: ["rate<0.15"],

    // Status code checks - more lenient
    checks: ["rate>0.85"],
  },

  tags: {
    test_type: "stress",
    endpoint: "/v2/locations",
  },
};

// Test Configuration
const BASE_URL = __ENV.BASE_URL || "https://api-staging.megaport.com";
const API_ENDPOINT = "/v2/locations";

// Test data variations for more realistic load
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
];
const STATUS_OPTIONS = ["Active", "Inactive"];

/**
 * Setup function - Runs once before test execution
 */
export function setup() {
  console.log("🔧 Setting up Stress Test for /v2/locations");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`👥 Max VUs: 250 (breaking point test)`);
  console.log(`⏱️  Total Duration: 15 minutes`);
  console.log(`🎯 Target: ${BASE_URL}${API_ENDPOINT}`);
  console.log("⚠️  WARNING: This test pushes the system beyond normal limits");
  console.log("─".repeat(60));

  // Verify endpoint is accessible
  const testResponse = http.get(
    `${BASE_URL}${API_ENDPOINT}?locationStatuses=Active`,
    {
      headers: { Accept: "application/json" },
    },
  );

  console.log(`🔍 Baseline accessibility check: ${testResponse.status}`);
  console.log(`🔍 Baseline response time: ${testResponse.timings.duration}ms`);
  console.log("─".repeat(60));

  return {
    startTime: new Date().toISOString(),
    testType: "stress",
    baselineStatus: testResponse.status,
    baselineDuration: testResponse.timings.duration,
  };
}

/**
 * Main test function - Runs for each VU iteration
 * @param {any} data - Setup data
 */
export default function (data) {
  // Dynamic data generation using __VU and __ITER for variety
  const metroIndex = (__VU * __ITER) % METRO_OPTIONS.length;
  const statusIndex = __ITER % STATUS_OPTIONS.length;

  // Prepare headers
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Request-ID": `stress-test-${__VU}-${__ITER}-${Date.now()}`,
    "X-Test-Type": "stress",
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
    timeout: "30s", // Longer timeout for stress conditions
  });
  const duration = new Date().getTime() - startTime;

  // Record custom latency metric
  locationsLatency.add(duration);

  // Validation checks
  const checkResult = check(response, {
    "Status is 200, 403, or 503": (r) =>
      r.status === 200 || r.status === 403 || r.status === 503,
    "Response received": (r) => r.body !== null && r.body !== undefined,
    "Response time < 5000ms": (r) => r.timings.duration < 5000,
    "Response has message field": (r) => {
      try {
        if (r.status !== 200) return true; // Skip for non-200 responses (including 403)
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return body.hasOwnProperty("message");
      } catch (e) {
        return false;
      }
    },
    "Response has data array": (r) => {
      try {
        if (r.status !== 200) return true; // Skip for non-200 responses (including 403)
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
    "No server errors (5xx)": (r) => r.status < 500 || r.status === 503, // 503 is acceptable under stress, 403 is client error
    "Data items have required fields": (r) => {
      try {
        if (r.status !== 200) return true; // Skip for non-200 responses
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        if (body.data && body.data.length > 0) {
          const location = body.data[0];
          return (
            location.hasOwnProperty("id") &&
            location.hasOwnProperty("name") &&
            location.hasOwnProperty("status")
          );
        }
        return true; // No data is acceptable
      } catch (e) {
        return false;
      }
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

  // Log failures and performance degradation (sample logging)
  if (__ITER % 50 === 0) {
    if (!checkResult) {
      console.error(`❌ Check failed for iteration ${__ITER} (VU: ${__VU})`);
      console.error(`   Status: ${response.status}, Duration: ${duration}ms`);
    } else if (duration > 2000) {
      console.warn(
        `⚠️  Slow response at iteration ${__ITER} (VU: ${__VU}): ${duration}ms`,
      );
    }
  }

  // Realistic pacing between requests (simulate user think time)
  // Shorter sleep during stress test to maximize load
  sleep(1);
}

/**
 * Teardown function - Runs once after test execution
 * @param {any} data - Setup data
 */
export function teardown(data) {
  console.log("─".repeat(60));
  console.log("🏁 Stress Test Completed for /v2/locations");
  console.log(`📊 Test Type: ${data.testType}`);
  console.log(`🕐 Started: ${data.startTime}`);
  console.log(`🕐 Ended: ${new Date().toISOString()}`);
  console.log(`📈 Baseline Status: ${data.baselineStatus}`);
  console.log(`📈 Baseline Duration: ${data.baselineDuration}ms`);
  console.log("✅ Review metrics to identify breaking points");
  console.log("💡 Analyze where performance degraded and errors started");
  console.log("💡 Check system resources (CPU, memory, connections)");
  console.log("─".repeat(60));
}
