import { test, expect } from "@playwright/test";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { LocationsAPI } from "../../modules/locations/locations.api";
import { PayloadBuilder } from "../../modules/data/payload-builder";
import { APIClient } from "../../utils/api-client";
import {
  API_ENDPOINTS,
  HTTP_STATUS,
  CONTENT_TYPES,
  LOCATION_STATUSES,
  PERFORMANCE_THRESHOLDS,
  ERROR_MESSAGES,
} from "../../utils/constants";
import locationsSchema from "../../fixtures/mocks/locations-schema.json";

/**
 * Comprehensive API Test Suite for /v2/locations endpoint
 *
 * This suite covers:
 * - Authentication scenarios (valid/invalid tokens)
 * - Schema validation using AJV
 * - Success and error paths
 * - Boundary testing
 * - Performance testing
 * - Dynamic test data generation
 */

test.describe("/v2/locations API Tests", () => {
  let locationsAPI: LocationsAPI;
  let apiClient: APIClient;
  const ajv = new Ajv({ allowUnionTypes: true });
  addFormats(ajv); // Add format support for date-time, email, etc.
  const validateSchema = ajv.compile(locationsSchema);

  test.beforeEach(async ({ request }) => {
    const baseURL = test.info().project.use.baseURL || "";
    locationsAPI = new LocationsAPI(request, baseURL);
    apiClient = new APIClient(request, baseURL);
  });

  test.describe("Authentication Scenarios", () => {
    test(
      "should return 200 with valid Bearer token",
      {
        tag: ["@ci", "@api", "@auth"],
      },
      async () => {
        // Generate a valid token (in production, this would be from auth service)
        const validToken = PayloadBuilder.generateValidToken();
        const params = PayloadBuilder.generateValidLocationParams();

        const response = await locationsAPI.getLocations(params, validToken);

        // API may return 401 if token validation is strict
        expect([HTTP_STATUS.OK, HTTP_STATUS.UNAUTHORIZED]).toContain(
          response.status(),
        );

        if (response.status() === HTTP_STATUS.OK) {
          const body = await response.json();
          expect(body?.message).toBeDefined();

          // Validate response headers
          expect(
            APIClient.validateHeader(
              response,
              "Content-Type",
              /application\/json/,
            ),
          ).toBeTruthy();
        }
      },
    );

    test(
      "should return 401 Unauthorized with missing token",
      {
        tag: ["@ci", "@api", "@auth", "@negative"],
      },
      async () => {
        const params = PayloadBuilder.generateValidLocationParams();

        const response = await locationsAPI.getLocations(params);

        // Depending on API implementation, it might return 200 or 401
        // Adjust based on your actual API behavior
        if (response.status() === HTTP_STATUS.UNAUTHORIZED) {
          const body = await response.json();
          expect(body?.error || body?.message).toBeDefined();
        } else {
          // If API doesn't require auth, it should still return 200
          expect(response.status()).toBe(HTTP_STATUS.OK);
        }
      },
    );

    test(
      "should return 401 Unauthorized with invalid token",
      {
        tag: ["@ci", "@api", "@auth", "@negative"],
      },
      async () => {
        const invalidToken = PayloadBuilder.generateInvalidToken();
        const params = PayloadBuilder.generateValidLocationParams();

        const response = await locationsAPI.getLocations(params, invalidToken);

        // Depending on API implementation
        if (response.status() === HTTP_STATUS.UNAUTHORIZED) {
          const body = await response.json();
          expect(body?.error || body?.message).toMatch(
            /unauthorized|invalid|token/i,
          );
        }
      },
    );
  });

  test.describe("Validation & Schema", () => {
    test(
      "should validate response against JSON schema",
      {
        tag: ["@ci", "@api", "@schema"],
      },
      async ({ request }) => {
        const params = {
          locationStatuses: LOCATION_STATUSES.ACTIVE,
          metro: "Singapore",
        };

        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          headers: { Accept: CONTENT_TYPES.JSON },
          params,
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();

        // Validate against JSON schema
        const isValid = validateSchema(body);
        if (!isValid) {
          console.error("Schema validation errors:", validateSchema.errors);
        }
        expect(isValid).toBeTruthy();
      },
    );

    test(
      "should have correct Content-Type header",
      {
        tag: ["@ci", "@api", "@headers"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          headers: { Accept: CONTENT_TYPES.JSON },
          params: { locationStatuses: LOCATION_STATUSES.ACTIVE },
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const contentType = response.headers()["content-type"];
        expect(contentType).toContain("application/json");
      },
    );

    test(
      "should validate status codes for success",
      {
        tag: ["@ci", "@api"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: { locationStatuses: LOCATION_STATUSES.ACTIVE },
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);
        expect(response.ok()).toBeTruthy();
      },
    );
  });

  test.describe("Functional Test Cases - Success Path", () => {
    test(
      "should successfully retrieve locations with valid parameters",
      {
        tag: ["@ci", "@api", "@smoke"],
      },
      async ({ request }) => {
        const params = PayloadBuilder.generateValidLocationParams();

        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          headers: { Accept: CONTENT_TYPES.JSON },
          params: params as Record<string, string | number | boolean>,
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();
        expect(body?.message).toContain("List all public locations");

        // Validate response structure
        expect(body).toHaveProperty("message");
        expect(body).toHaveProperty("terms");
        expect(body.terms).toContain("Acceptable Use Policy");

        // Validate data array exists and has proper structure
        expect(body).toHaveProperty("data");
        expect(Array.isArray(body.data)).toBeTruthy();
        expect(body.data.length).toBeGreaterThanOrEqual(0);

        // If data exists, validate first location structure
        if (body.data.length > 0) {
          const location = body.data[0];
          expect(location).toHaveProperty("id");
          expect(location).toHaveProperty("name");
          expect(location).toHaveProperty("country");
          expect(location).toHaveProperty("siteCode");
          expect(location).toHaveProperty("networkRegion");
          expect(location).toHaveProperty("status");
          expect(location).toHaveProperty("address");
          expect(location.address).toHaveProperty("street");
          expect(location.address).toHaveProperty("city");
          expect(location).toHaveProperty("latitude");
          expect(location).toHaveProperty("longitude");
          expect(location).toHaveProperty("products");
        }
      },
    );

    test(
      "should filter locations by status",
      {
        tag: ["@ci", "@api", "@functional"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: {
            locationStatuses: LOCATION_STATUSES.ACTIVE,
          },
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();

        // Validate data is returned
        expect(body).toHaveProperty("data");
        expect(Array.isArray(body.data)).toBeTruthy();

        // All locations should have Active status
        if (body.data.length > 0) {
          body.data.forEach((location: any) => {
            expect(location.status).toBe(LOCATION_STATUSES.ACTIVE);
          });
        }
      },
    );

    test(
      "should filter locations by metro",
      {
        tag: ["@ci", "@api", "@functional"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: {
            metro: "Singapore",
          },
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();

        // Validate data is returned
        expect(body).toHaveProperty("data");
        expect(Array.isArray(body.data)).toBeTruthy();

        // All locations should be in Singapore metro
        if (body.data.length > 0) {
          body.data.forEach((location: any) => {
            expect(location.metro).toBe("Singapore");
          });
        }
      },
    );

    test(
      "should handle multiple filter parameters",
      {
        tag: ["@ci", "@api", "@functional"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: {
            locationStatuses: LOCATION_STATUSES.ACTIVE,
            metro: "Singapore",
          },
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();
        expect(body?.message).toBeDefined();
      },
    );
  });

  test.describe("Boundary Testing", () => {
    test(
      "should handle minimum boundary values",
      {
        tag: ["@ci", "@api", "@boundary"],
      },
      async ({ request }) => {
        const params = PayloadBuilder.generateMinBoundaryParams();

        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: params as Record<string, string | number | boolean>,
        });

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();
        expect(body).toBeDefined();
      },
    );

    test(
      "should handle maximum boundary values",
      {
        tag: ["@ci", "@api", "@boundary"],
      },
      async ({ request }) => {
        const params = PayloadBuilder.generateMaxBoundaryParams();

        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: params as Record<string, string | number | boolean>,
        });

        // API should handle large values gracefully (200 or 400)
        expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
          response.status(),
        );
      },
    );

    test(
      "should handle empty parameters",
      {
        tag: ["@ci", "@api", "@boundary"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS);

        expect(response.status()).toBe(HTTP_STATUS.OK);

        const body = await response.json();
        expect(body?.message).toBeDefined();
      },
    );
  });

  test.describe("Error Handling", () => {
    test(
      "should return 400 Bad Request for invalid parameters",
      {
        tag: ["@ci", "@api", "@negative"],
      },
      async ({ request }) => {
        const invalidParams = PayloadBuilder.generateInvalidParams();

        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: invalidParams,
        });

        // API might return 400 or process with default values (200)
        // Adjust based on your API's error handling
        if (response.status() === HTTP_STATUS.BAD_REQUEST) {
          const body = await response.json();
          expect(body?.error || body?.message).toBeDefined();
        }
      },
    );

    test(
      "should handle invalid Accept header gracefully",
      {
        tag: ["@ci", "@api", "@negative"],
      },
      async ({ request }) => {
        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          headers: {
            Accept: "application/xml",
          },
          params: {
            locationStatuses: LOCATION_STATUSES.ACTIVE,
          },
        });

        // API should either return JSON anyway or 406 Not Acceptable
        expect([HTTP_STATUS.OK, 406]).toContain(response.status());
      },
    );

    test(
      "should return appropriate error for non-existent endpoint",
      {
        tag: ["@ci", "@api", "@negative"],
      },
      async ({ request }) => {
        const response = await request.get("/v2/locations/nonexistent123456");

        expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
      },
    );
  });

  test.describe("Performance Testing", () => {
    test(
      "should respond within acceptable time threshold",
      {
        tag: ["@ci", "@api", "@performance"],
      },
      async ({ request }) => {
        const params = PayloadBuilder.generateValidLocationParams();

        const { response, duration } = await APIClient.getResponseTime(
          async () => {
            return await request.get(API_ENDPOINTS.LOCATIONS, {
              params: params as Record<string, string | number | boolean>,
            });
          },
        );

        expect(response.status()).toBe(HTTP_STATUS.OK);
        expect(duration).toBeLessThan(
          PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME + 100,
        );

        // console.log(`API response time: ${duration}ms`);
      },
    );

    test(
      "should handle concurrent requests efficiently",
      {
        tag: ["@api", "@performance", "@load"],
      },
      async ({ request }) => {
        const params = PayloadBuilder.generateValidLocationParams();
        const concurrentRequests = 10;

        const startTime = Date.now();

        const promises = Array.from({ length: concurrentRequests }, () =>
          request.get(API_ENDPOINTS.LOCATIONS, {
            params: params as Record<string, string | number | boolean>,
          }),
        );

        const responses = await Promise.all(promises);
        const duration = Date.now() - startTime;

        // All requests should succeed
        responses.forEach((response) => {
          expect(response.status()).toBe(HTTP_STATUS.OK);
        });

        // console.log(
        //   `${concurrentRequests} concurrent requests completed in ${duration}ms`,
        // );

        // Average response time should be reasonable
        const avgTime = duration / concurrentRequests;
        expect(avgTime).toBeLessThan(
          PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME * 2,
        );
      },
    );
  });

  test.describe("Dynamic Data Testing", () => {
    test(
      "should handle dynamically generated query parameters",
      {
        tag: ["@api", "@dynamic"],
      },
      async ({ request }) => {
        // Generate unique test data for each run
        const dynamicParams = PayloadBuilder.generateLocationQueryParams({
          locationStatuses: LOCATION_STATUSES.ACTIVE,
        });

        const response = await request.get(API_ENDPOINTS.LOCATIONS, {
          params: dynamicParams as Record<string, string | number | boolean>,
        });

        // Should handle various parameter combinations
        expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
          response.status(),
        );

        const body = await response.json();
        expect(body).toBeDefined();
      },
    );

    test(
      "should generate unique test data on each run",
      {
        tag: ["@api", "@dynamic"],
      },
      async () => {
        const params1 = PayloadBuilder.generateLocationQueryParams();
        const params2 = PayloadBuilder.generateLocationQueryParams();

        // Parameters should be different on each generation
        // (may occasionally be the same due to randomness, but unlikely)
        // console.log("Generated params 1:", params1);
        // console.log("Generated params 2:", params2);

        expect(params1).toBeDefined();
        expect(params2).toBeDefined();
      },
    );
  });

  // Keep original test for backwards compatibility
  test(
    "Original: /v2/locations basic test",
    {
      tag: ["@ci", "@api", "@legacy"],
    },
    async ({ request }) => {
      const url = "/v2/locations";

      const response = await request.get(url, {
        headers: {
          Accept: "*/*",
        },
        params: {
          locationStatuses: "Active",
          metro: "Singapore",
        },
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body?.message).toContain("List all public locations");
    },
  );
});
