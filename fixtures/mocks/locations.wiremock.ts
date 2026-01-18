import { test, expect, Page } from "@playwright/test";

/**
 * WireMock Pattern Implementation for API Mocking
 *
 * This example demonstrates how to stub the /v2/locations endpoint
 * using Playwright's route interception (similar to WireMock pattern)
 * for local isolation testing.
 *
 * Usage:
 * 1. Use this in your tests when you need to test against predictable data
 * 2. Prevents flaky tests caused by changing backend data
 * 3. Enables testing error scenarios without affecting real data
 */

/**
 * Mock response data for locations endpoint
 */
const mockLocationsSuccessResponse = {
  message: "List all public locations",
  data: [
    {
      id: "loc-001",
      name: "Singapore Data Center",
      metro: "Singapore",
      country: "Singapore",
      status: "Active",
      address: "123 Tech Park Drive",
      coordinates: {
        latitude: 1.3521,
        longitude: 103.8198,
      },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "loc-002",
      name: "Singapore Cloud Hub",
      metro: "Singapore",
      country: "Singapore",
      status: "Active",
      address: "456 Innovation Boulevard",
      coordinates: {
        latitude: 1.2897,
        longitude: 103.8501,
      },
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-18T00:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
};

const mockLocationsEmptyResponse = {
  message: "List all public locations",
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

const mockUnauthorizedResponse = {
  error: "Unauthorized",
  message: "Invalid or missing authentication token",
  statusCode: 401,
};

const mockBadRequestResponse = {
  error: "Bad Request",
  message: "Invalid parameter: limit must be a positive number",
  statusCode: 400,
};

/**
 * Helper class for WireMock-style API stubbing
 */
export class LocationsMockServer {
  /**
   * Stub successful GET /v2/locations response
   */
  static async stubGetLocationsSuccess(page: Page, customResponse?: any) {
    await page.route("**/v2/locations", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(customResponse || mockLocationsSuccessResponse),
          headers: {
            "Content-Type": "application/json",
            "X-API-Version": "v2",
          },
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Stub empty response (no locations found)
   */
  static async stubGetLocationsEmpty(page: Page) {
    await page.route("**/v2/locations", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockLocationsEmptyResponse),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Stub 401 Unauthorized response
   */
  static async stubGetLocationsUnauthorized(page: Page) {
    await page.route("**/v2/locations", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify(mockUnauthorizedResponse),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Stub 400 Bad Request response
   */
  static async stubGetLocationsBadRequest(page: Page) {
    await page.route("**/v2/locations", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify(mockBadRequestResponse),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Stub 500 Internal Server Error
   */
  static async stubGetLocationsServerError(page: Page) {
    await page.route("**/v2/locations", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal Server Error",
            message: "An unexpected error occurred",
            statusCode: 500,
          }),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Stub slow response (for testing timeouts)
   */
  static async stubGetLocationsSlowResponse(
    page: Page,
    delayMs: number = 5000,
  ) {
    await page.route("**/v2/locations", async (route) => {
      if (route.request().method() === "GET") {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockLocationsSuccessResponse),
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Stub response based on query parameters
   */
  static async stubGetLocationsConditional(page: Page) {
    await page.route("**/v2/locations*", async (route) => {
      if (route.request().method() === "GET") {
        const url = new URL(route.request().url());
        const metro = url.searchParams.get("metro");
        const status = url.searchParams.get("locationStatuses");

        // Return different responses based on parameters
        if (metro === "Singapore" && status === "Active") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockLocationsSuccessResponse),
          });
        } else if (metro === "NonExistent") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockLocationsEmptyResponse),
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Remove all stubs (reset to real API)
   */
  static async removeAllStubs(page: Page) {
    await page.unroute("**/v2/locations");
    await page.unroute("**/v2/locations*");
  }
}

/**
 * Example test demonstrating WireMock pattern usage
 */
test.describe("WireMock Pattern Examples", () => {
  test("Example: Test with mocked success response", async ({ page }) => {
    // Stub the API endpoint
    await LocationsMockServer.stubGetLocationsSuccess(page);

    // Navigate to your application that calls this API
    // await page.goto('/your-app-page');

    // Make API call using page.request
    const response = await page.request.get("/v2/locations", {
      params: {
        locationStatuses: "Active",
        metro: "Singapore",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].metro).toBe("Singapore");
  });

  test("Example: Test with mocked unauthorized response", async ({ page }) => {
    await LocationsMockServer.stubGetLocationsUnauthorized(page);

    const response = await page.request.get("/v2/locations");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("Example: Test with custom mock data", async ({ page }) => {
    const customMockData = {
      message: "Custom mock response",
      data: [
        {
          id: "custom-001",
          name: "Custom Location",
          metro: "Tokyo",
          status: "Active",
        },
      ],
      total: 1,
    };

    await LocationsMockServer.stubGetLocationsSuccess(page, customMockData);

    const response = await page.request.get("/v2/locations");
    const body = await response.json();

    expect(body.message).toBe("Custom mock response");
    expect(body.data[0].metro).toBe("Tokyo");
  });

  test("Example: Test conditional stubbing based on parameters", async ({
    page,
  }) => {
    await LocationsMockServer.stubGetLocationsConditional(page);

    // Request with Singapore metro should return data
    const response1 = await page.request.get("/v2/locations", {
      params: { metro: "Singapore", locationStatuses: "Active" },
    });
    const body1 = await response1.json();
    expect(body1.data).toHaveLength(2);

    // Request with NonExistent metro should return empty
    const response2 = await page.request.get("/v2/locations", {
      params: { metro: "NonExistent" },
    });
    const body2 = await response2.json();
    expect(body2.data).toHaveLength(0);
  });
});

/**
 * Usage in API-only tests (without Page object)
 * For API tests using request fixture, use Playwright's request.fetch with base mocking
 */
export const setupAPIRequestMocking = (baseURL: string) => {
  return {
    /**
     * Create a mock request context
     * Note: For pure API tests, consider using a mock server library like MSW or nock
     */
    async getMockedResponse(
      endpoint: string,
      mockData: any,
      status: number = 200,
    ) {
      // This is a simplified example
      // In real scenarios, use MSW or similar for API-only tests
      return {
        status: () => status,
        ok: () => status >= 200 && status < 300,
        json: async () => mockData,
        headers: () => ({ "content-type": "application/json" }),
      };
    },
  };
};
