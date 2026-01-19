import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

/**
 * K6 SPIKE TEST - /v2/locations API Endpoint
 *
 * Purpose: Test system behavior under sudden, extreme load spikes
 * Duration: 10 minutes
 * VUs: Sudden spikes from low to very high load
 */

// Custom Metrics
const locationsLatency = new Trend("locations_api_latency", true);
const customErrorRate = new Rate("custom_business_errors");
const spikeRecoveryTime = new Trend("spike_recovery_time", true);
const errorCounter = new Counter("total_errors");

// Test Configuration - Spike Test Profile
export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Start with minimal load
    { duration: "30s", target: 200 }, // SPIKE! Sudden jump to 200 users
    { duration: "1m", target: 200 }, // Hold spike
    { duration: "30s", target: 10 }, // Drop back down
    { duration: "1m", target: 10 }, // Recovery period
    { duration: "30s", target: 300 }, // SPIKE! Even bigger spike
    { duration: "1m", target: 300 }, // Hold second spike
    { duration: "30s", target: 10 }, // Drop back down
    { duration: "1m", target: 10 }, // Recovery period
    { duration: "30s", target: 0 }, // Ramp-down
  ],

  thresholds: {
    // More lenient thresholds for spike testing
    http_req_duration: ["p(95)<3000", "p(99)<8000"],

    // Custom latency metric threshold
    locations_api_latency: ["p(95)<3000", "p(99)<8000"],

    // Higher failure tolerance during spikes
    http_req_failed: ["rate<0.15"], // Allow up to 15% failure during spikes

    // Custom error rate threshold
    custom_business_errors: ["rate<0.20"],

    // Status code checks - more lenient
    checks: ["rate>0.80"],
  },

  tags: {
    test_type: "spike",
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

/**
 * Setup function - Runs once before test execution
 */
export function setup() {
  console.log("🔧 Setting up Spike Test for /v2/locations");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`👥 Spike VUs: 10 → 200 → 10 → 300 → 10`);
  console.log(`⏱️  Total Duration: 10 minutes`);
  console.log(`🎯 Target: ${BASE_URL}${API_ENDPOINT}`);
  console.log("⚠️  WARNING: This test simulates sudden traffic spikes");
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
    testType: "spike",
    baselineStatus: testResponse.status,
    baselineDuration: testResponse.timings.duration,
    spikePhases: [
      { start: 90, end: 180, targetVUs: 200 },
      { start: 360, end: 450, targetVUs: 300 },
    ],
  };
}

/**
 * Main test function - Runs for each VU iteration
 * @param {any} data - Setup data
 */
export default function (data) {
  // Dynamic data generation using __VU and __ITER for variety
  const metroIndex = (__VU * __ITER + Date.now()) % METRO_OPTIONS.length;
  const statusIndex = __ITER % STATUS_OPTIONS.length;

  // Prepare headers
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Request-ID": `spike-test-${__VU}-${__ITER}-${Date.now()}`,
    "X-Test-Type": "spike",
    "X-VU-Count": `${__VU}`,
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
    timeout: "30s", // Longer timeout for spike conditions
  });
  const duration = new Date().getTime() - startTime;

  // Record custom latency metric
  locationsLatency.add(duration);

  // Track spike recovery time
  if (__VU <= 10) {
    // This is a "normal load" request - track its performance
    spikeRecoveryTime.add(duration);
  }

  // Validation checks
  const checkResult = check(response, {
    "Status is 200, 403, 429, or 503": (r) =>
      r.status === 200 ||
      r.status === 403 ||
      r.status === 429 ||
      r.status === 503,
    "Response received": (r) => r.body !== null && r.body !== undefined,
    "Response time < 8000ms": (r) => r.timings.duration < 8000,
    "Response has message field": (r) => {
      try {
        if (r.status !== 200) return true; // Skip for non-200 responses
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return body.hasOwnProperty("message");
      } catch (e) {
        return false;
      }
    },
    "Response has data array": (r) => {
      try {
        if (r.status !== 200) return true; // Skip for non-200 responses
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
    "No critical server errors": (r) =>
      r.status < 500 || r.status === 503 || r.status === 429,
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
    "Rate limiting handled gracefully": (r) => {
      if (r.status === 429) {
        return (
          r.headers["Retry-After"] !== undefined ||
          r.headers["retry-after"] !== undefined
        );
      }
      return true;
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

  // Enhanced logging during spike phases
  if (__ITER % 30 === 0) {
    if (response.status === 429) {
      console.warn(`⚠️  Rate limited at VU ${__VU}, iteration ${__ITER}`);
    } else if (response.status === 503) {
      console.warn(
        `⚠️  Service unavailable at VU ${__VU}, iteration ${__ITER}`,
      );
    } else if (!checkResult) {
      console.error(`❌ Check failed at VU ${__VU}, iteration ${__ITER}`);
      console.error(`   Status: ${response.status}, Duration: ${duration}ms`);
    } else if (duration > 3000) {
      console.warn(`⚠️  Slow response: ${duration}ms (VU: ${__VU})`);
    }
  }

  // Realistic pacing between requests
  // Shorter sleep during spike test to maximize impact
  sleep(1);
}

/**
 * Teardown function - Runs once after test execution
 * @param {any} data - Setup data
 */
export function teardown(data) {
  console.log("─".repeat(60));
  console.log("🏁 Spike Test Completed for /v2/locations");
  console.log(`📊 Test Type: ${data.testType}`);
  console.log(`🕐 Started: ${data.startTime}`);
  console.log(`🕐 Ended: ${new Date().toISOString()}`);
  console.log(`📈 Baseline Status: ${data.baselineStatus}`);
  console.log(`📈 Baseline Duration: ${data.baselineDuration}ms`);
  console.log("✅ Review metrics to analyze spike handling");
  console.log("💡 Check if system recovered after spikes");
  console.log("💡 Verify rate limiting and circuit breaker behavior");
  console.log("💡 Monitor for cascading failures");
  console.log("─".repeat(60));
}
