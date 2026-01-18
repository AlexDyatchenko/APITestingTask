/**
 * K6 Common Configuration
 *
 * Shared configuration and utilities for all k6 tests
 */

// Base Configuration
export const CONFIG = {
  BASE_URL: __ENV.BASE_URL || "https://api-staging.megaport.com",
  API_ENDPOINT: "/v2/locations",
  AUTH_TOKEN: __ENV.AUTH_TOKEN || "[INSERT_BEARER_TOKEN]",

  // Timeouts
  DEFAULT_TIMEOUT: "10s",
  STRESS_TIMEOUT: "30s",

  // Test data
  METRO_OPTIONS: [
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
  ],

  STATUS_OPTIONS: ["Active", "Inactive"],

  // Performance expectations
  PERFORMANCE: {
    SMOKE: {
      P95: 500,
      P99: 1000,
      FAILURE_RATE: 0.01,
      CHECK_RATE: 0.99,
    },
    LOAD: {
      P95: 500,
      P99: 1000,
      FAILURE_RATE: 0.01,
      CHECK_RATE: 0.99,
    },
    STRESS: {
      P95: 2000,
      P99: 5000,
      FAILURE_RATE: 0.1,
      CHECK_RATE: 0.85,
    },
    SPIKE: {
      P95: 3000,
      P99: 8000,
      FAILURE_RATE: 0.15,
      CHECK_RATE: 0.8,
    },
    SOAK: {
      P95: 800,
      P99: 1500,
      FAILURE_RATE: 0.01,
      CHECK_RATE: 0.99,
    },
  },
};

/**
 * Get common HTTP headers
 */
export function getHeaders(token = CONFIG.AUTH_TOKEN, requestId = "") {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Request-ID": requestId,
  };
}

/**
 * Build query parameters
 * @param {any} params - Query parameters object
 */
export function buildQueryParams(params) {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

/**
 * Build full URL with query parameters
 * @param {any} baseUrl - Base URL
 * @param {any} endpoint - API endpoint
 * @param {any} params - Query parameters
 */
export function buildUrl(baseUrl, endpoint, params) {
  const queryString = buildQueryParams(params);
  return `${baseUrl}${endpoint}?${queryString}`;
}

/**
 * Generate dynamic test data based on VU and iteration
 * @param {any} vu - Virtual user number
 * @param {any} iteration - Iteration number
 */
export function generateDynamicParams(vu, iteration) {
  const metroIndex = (vu + iteration) % CONFIG.METRO_OPTIONS.length;
  const statusIndex = iteration % CONFIG.STATUS_OPTIONS.length;

  return {
    locationStatuses: CONFIG.STATUS_OPTIONS[statusIndex],
    metro: CONFIG.METRO_OPTIONS[metroIndex],
  };
}

/**
 * Common validation checks for response
 */
export function getCommonChecks() {
  return {
    "✓ Status is 200": (/** @type {any} */ r) => r.status === 200,
    "✓ Response has message field": (/** @type {any} */ r) => {
      try {
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return body.hasOwnProperty("message");
      } catch (e) {
        return false;
      }
    },
    "✓ Response has data array": (/** @type {any} */ r) => {
      try {
        if (typeof r.body !== "string") return false;
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
    "✓ Data items have required fields": (/** @type {any} */ r) => {
      try {
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
        return true;
      } catch (e) {
        return false;
      }
    },
  };
}

/**
 * Validate business logic
 * @param {any} response - HTTP response
 * @param {any} expectedParams - Expected parameters
 */
export function validateBusinessLogic(response, expectedParams) {
  try {
    if (response.status !== 200) return false;
    if (typeof response.body !== "string") return false;

    const body = JSON.parse(response.body);
    if (!body.data || body.data.length === 0) return true;

    // Check if all returned locations match the filter criteria
    return body.data.every((/** @type {any} */ location) => {
      if (
        expectedParams.locationStatuses &&
        location.status !== expectedParams.locationStatuses
      ) {
        return false;
      }
      if (expectedParams.metro && location.metro !== expectedParams.metro) {
        return false;
      }
      return true;
    });
  } catch (e) {
    return false;
  }
}

/**
 * Format test summary
 * @param {any} data - Setup data
 * @param {any} testType - Test type
 */
export function formatTestSummary(data, testType) {
  console.log("─".repeat(60));
  console.log(`🏁 ${testType} Test Completed`);
  console.log(`📊 Test Type: ${data.testType}`);
  console.log(`🕐 Started: ${data.startTime}`);
  console.log(`🕐 Ended: ${new Date().toISOString()}`);
  console.log("─".repeat(60));
}

export default CONFIG;
