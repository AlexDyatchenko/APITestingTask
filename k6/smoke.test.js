import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

/**
 * K6 SMOKE TEST - /v2/locations API Endpoint
 *
 * Purpose: Verify the system works with minimal load (1 VU)
 * Duration: 1 minute
 * VUs: 1
 */

// Type definition for setup data
/**
 * @typedef {Object} SetupData
 * @property {string} startTime
 * @property {string} testType
 */

// Custom Metrics
const locationsLatency = new Trend("locations_api_latency", true);
const customErrorRate = new Rate("custom_business_errors");

// Test Configuration - Smoke Test Profile
export const options = {
  vus: 1,
  duration: "1m",

  thresholds: {
    // 95th percentile response time should be below 500ms
    http_req_duration: ["p(95)<500"],

    // Custom latency metric threshold
    locations_api_latency: ["p(95)<500", "p(99)<1000"],

    // Failure rate should be less than 1%
    http_req_failed: ["rate<0.01"],

    // Custom error rate threshold
    custom_business_errors: ["rate<0.01"],

    // Status code checks should pass 99% of the time
    checks: ["rate>0.99"],
  },

  tags: {
    test_type: "smoke",
    endpoint: "/v2/locations",
  },
};

// Test Configuration
const BASE_URL = __ENV.BASE_URL || "https://api-staging.megaport.com";
const API_ENDPOINT = "/v2/locations";

// Authentication - Replace with your auth type
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "[INSERT_BEARER_TOKEN]";

/**
 * Setup function - Runs once before test execution
 */
export function setup() {
  console.log("🔧 Setting up Smoke Test for /v2/locations");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`👤 VUs: ${options.vus}`);
  console.log(`⏱️  Duration: ${options.duration}`);
  console.log(`🎯 Target: ${BASE_URL}${API_ENDPOINT}`);
  console.log("─".repeat(60));

  return {
    startTime: new Date().toISOString(),
    testType: "smoke",
  };
}

/**
 * Main test function - Runs for each VU iteration
 * @param {SetupData} _data - Data from setup (unused in this test)
 */
export default function (_data) {
  // Prepare headers with authentication
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  // Prepare query parameters
  const params = {
    locationStatuses: "Active",
    metro: "Singapore",
  };

  // Build URL with query parameters
  const url = `${BASE_URL}${API_ENDPOINT}?${Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;

  // Make the API request
  const startTime = new Date().getTime();
  const response = http.get(url, { headers });
  const duration = new Date().getTime() - startTime;

  // Record custom latency metric
  locationsLatency.add(duration);

  // Validation checks
  const checkResult = check(response, {
    "✓ Status is 200": (r) => r.status === 200,
    "✓ Response time < 500ms": (r) => r.timings.duration < 500,
    "✓ Response has message field": (r) => {
      try {
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return body.hasOwnProperty("message");
      } catch (e) {
        return false;
      }
    },
    "✓ Response has data array": (r) => {
      try {
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
    "✓ Response contains expected message": (r) => {
      try {
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return (
          body.message && body.message.includes("List all public locations")
        );
      } catch (e) {
        return false;
      }
    },
    "✓ Data items have required fields": (r) => {
      try {
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        if (body.data && body.data.length > 0) {
          const location = body.data[0];
          return (
            location.hasOwnProperty("id") &&
            location.hasOwnProperty("name") &&
            location.hasOwnProperty("status") &&
            location.hasOwnProperty("country")
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
    if (typeof response.body === "string") {
      const body = JSON.parse(response.body);
      // Custom business logic validation
      if (body.data && body.data.length > 0) {
        body.data.forEach((/** @type {any} */ location) => {
          if (
            location.status !== "Active" &&
            params.locationStatuses === "Active"
          ) {
            hasBusinessError = true;
          }
        });
      }
    } else {
      hasBusinessError = true;
    }
  } catch (e) {
    hasBusinessError = true;
  }

  customErrorRate.add(hasBusinessError);

  // Log failures for debugging
  if (!checkResult) {
    console.error(`❌ Check failed for iteration ${__ITER} (VU: ${__VU})`);
    console.error(`   Status: ${response.status}, Duration: ${duration}ms`);
  }

  // Realistic pacing between requests (simulate user think time)
  sleep(1);
}

/**
 * Teardown function - Runs once after test execution
 * @param {SetupData} data - Data from setup function
 */
export function teardown(data) {
  console.log("─".repeat(60));
  console.log("🏁 Smoke Test Completed for /v2/locations");
  console.log(`📊 Test Type: ${data.testType}`);
  console.log(`🕐 Started: ${data.startTime}`);
  console.log(`🕐 Ended: ${new Date().toISOString()}`);
  console.log("✅ Check test results and metrics above");
  console.log("─".repeat(60));
}
