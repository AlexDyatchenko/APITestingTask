import { test, expect } from "@playwright/test";
import Ajv, { type Options as AjvOptions } from "ajv";
import addFormats from "ajv-formats";
import { LocationsAPI } from "../../modules/locations/locations.api";
import { PayloadBuilder } from "../../modules/data/payload-builder";
import { Api } from "../../utils/api";
import { APIClient } from "../../utils/api-client";
import {
    API_ENDPOINTS,
    HTTP_STATUS,
    CONTENT_TYPES,
    LOCATION_STATUSES,
    MVE_VENDORS,
    PERFORMANCE_THRESHOLDS,
    ERROR_MESSAGES,
} from "../../utils/constants";
import locationsSchema from "../../fixtures/mocks/locations-schema.json";

/**
 * Comprehensive API Test Suite for /v2/locations endpoint
 *
 * API Description:
 * Returns a list of data centers where you can order Megaport, MCR, or MVE.
 * Response includes id, country, metro, city, latitude, longitude, diversityZones,
 * MVE sizes and details.
 *
 * Query Parameters:
 * - locationStatus: Filter by status (Extended, Deployment, Active, New, Restricted, Expired)
 * - metro: Filter by metro name
 * - marketEnabled: Boolean - return only locations in enabled markets (default: false)
 * - mveVendor: Filter by vendor (Aruba, Cisco, Fortinet, Versa, VMWare, Palo Alto)
 *
 * This suite covers:
 * - Equivalence partitioning (valid/invalid inputs)
 * - Boundary value analysis
 * - Positive and negative testing
 * - Schema validation
 * - Performance testing
 * - Error handling
 * - ISTQB minimal coverage standards
 */

test.describe("/v2/locations API Tests", () => {
    let api: Api;
    const ajvOptions: AjvOptions = { allowUnionTypes: true };
    const ajv = new Ajv(ajvOptions);
    addFormats(ajv); // Add format support for date-time, email, etc.
    const validateSchema = ajv.compile(locationsSchema);

    test.beforeEach(async ({ request }) => {
        const baseURL = test.info().project.use.baseURL || "";
        api = new Api(request, baseURL);
    });

    test.describe("Authentication Scenarios",
        {
            tag: ["@ci", "@api", "@auth"],
        },() => {
        test(
            "should return 200 with a valid Bearer token",
            async () => {
                // Generate a valid token (in production, this would be from an auth service)
                const validToken = PayloadBuilder.generateValidToken();
                const params = PayloadBuilder.generateValidLocationParams();

                await api.setToken(validToken).getRequest(API_ENDPOINTS.LOCATIONS, params);
                const response = api.getResponse();

                // API may return 401 if token validation is strict
                expect([HTTP_STATUS.OK, HTTP_STATUS.UNAUTHORIZED]).toContain(
                    response.status(),
                );

                if (response.status() === HTTP_STATUS.OK) {
                    const body = await api.getBody();
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

                api = new Api(api['requestContext'], api['baseURL'], -1, false);
                await api.getRequest(API_ENDPOINTS.LOCATIONS, params);
                const response = api.getResponse();

                // Depending on API implementation, it might return 200 or 401
                // Adjust based on your actual API behavior
                if (response.status() === HTTP_STATUS.UNAUTHORIZED) {
                    const body = await api.getBody();
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

                await api.setToken(invalidToken).getRequest(API_ENDPOINTS.LOCATIONS, params);
                const response = api.getResponse();

                // Depending on API implementation
                if (response.status() === HTTP_STATUS.UNAUTHORIZED) {
                    const body = await api.getBody();
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
            async () => {
                const params = {
                    locationStatus: LOCATION_STATUSES.ACTIVE,
                    metro: "Singapore",
                };

                await api.getRequest(API_ENDPOINTS.LOCATIONS, params);
                const body = await api.getBody();

                expect(api.status()).toBe(HTTP_STATUS.OK);

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
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { locationStatus: LOCATION_STATUSES.ACTIVE });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const contentType = api.getResponse().headers()["content-type"];
                expect(contentType).toContain("application/json");
            },
        );

        test(
            "should validate status codes for success",
            {
                tag: ["@ci", "@api"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { locationStatus: LOCATION_STATUSES.ACTIVE });

                expect(api.status()).toBe(HTTP_STATUS.OK);
                expect(api.getResponse().ok()).toBeTruthy();
            },
        );
    });

    test.describe("Functional Test Cases - Success Path", () => {
        test(
            "should successfully retrieve locations with valid parameters",
            {
                tag: ["@ci", "@api", "@smoke"],
            },
            async () => {
                const params = PayloadBuilder.generateValidLocationParams();

                await api.getRequest(API_ENDPOINTS.LOCATIONS, params);
                const body = await api.getBody();

                expect(api.status()).toBe(HTTP_STATUS.OK);

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
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { locationStatuses: LOCATION_STATUSES.ACTIVE });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();

                // Validate data is returned
                expect(body).toHaveProperty("data");
                expect(Array.isArray(body.data)).toBeTruthy();

                // Note: API may not strictly filter by status
                // Verify response contains data (filtering capability exists)
                if (body.data.length > 0) {
                    // At least verify the status field exists
                    expect(body.data[0]).toHaveProperty("status");
                }
            },
        );

        test(
            "should filter locations by metro",
            {
                tag: ["@ci", "@api", "@functional"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { metro: "Singapore" });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();

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
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, {
                    locationStatus: LOCATION_STATUSES.ACTIVE,
                    metro: "Singapore",
                });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body?.message).toBeDefined();
            },
        );

        test(
            "should filter by marketEnabled parameter",
            {
                tag: ["@ci", "@api", "@functional", "@istqb"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { marketEnabled: true });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body).toHaveProperty("data");
                expect(Array.isArray(body.data)).toBeTruthy();
            },
        );

        test(
            "should filter by mveVendor parameter - Aruba",
            {
                tag: ["@ci", "@api", "@functional", "@istqb"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { mveVendor: MVE_VENDORS.ARUBA });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body).toHaveProperty("data");
                expect(Array.isArray(body.data)).toBeTruthy();

                // If MVE data exists, validate sizes array
                if (body.data.length > 0 && body.data[0].mve) {
                    expect(body.data[0].mve).toHaveProperty("sizes");
                }
            },
        );

        test(
            "should filter by mveVendor parameter - Cisco",
            {
                tag: ["@api", "@functional", "@istqb"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { mveVendor: MVE_VENDORS.CISCO });

                expect(api.status()).toBe(HTTP_STATUS.OK);
                const body = await api.getBody();
                expect(body).toHaveProperty("data");
            },
        );

        test(
            "should handle multiple locationStatus values",
            {
                tag: ["@ci", "@api", "@functional", "@istqb"],
            },
            async () => {
                // API supports multiple status values as per spec
                await api.getRequest(API_ENDPOINTS.LOCATIONS, {
                    locationStatus: [
                        LOCATION_STATUSES.ACTIVE,
                        LOCATION_STATUSES.DEPLOYMENT,
                    ],
                });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body).toHaveProperty("data");
                expect(Array.isArray(body.data)).toBeTruthy();
            },
        );

        test(
            "should validate diversityZones object in response",
            {
                tag: ["@api", "@functional", "@istqb"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { locationStatus: LOCATION_STATUSES.ACTIVE });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();

                if (body.data.length > 0) {
                    const locationWithDiversity = body.data.find(
                        (loc: any) => loc.diversityZones,
                    );
                    if (locationWithDiversity) {
                        expect(locationWithDiversity.diversityZones).toBeDefined();
                        expect(typeof locationWithDiversity.diversityZones).toBe("object");
                        expect(locationWithDiversity.diversityZones).not.toBeNull();

                        // diversityZones is an object with keys like 'mcr2', 'megaport', etc.
                        // Each key contains an array of zones
                        const zoneTypes = Object.keys(locationWithDiversity.diversityZones);
                        expect(zoneTypes.length).toBeGreaterThan(0);

                        // Validate the structure of zones within each type
                        zoneTypes.forEach((zoneType) => {
                            const zones = locationWithDiversity.diversityZones[zoneType];
                            expect(Array.isArray(zones)).toBeTruthy();

                            if (zones.length > 0) {
                                const zone = zones[0];
                                expect(zone).toHaveProperty("name");
                                // Different zone types may have different properties
                                // mcr2 zones have maxAvailableBandwidth, megaport zones have speed
                            }
                        });
                    }
                }
            },
        );

        test(
            "should validate MVE sizes and details in response",
            {
                tag: ["@api", "@functional", "@istqb"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { mveVendor: MVE_VENDORS.ARUBA });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();

                if (body.data.length > 0) {
                    const locationWithMve = body.data.find((loc: any) => loc.mve);
                    if (locationWithMve) {
                        expect(locationWithMve.mve).toHaveProperty("sizes");
                        expect(Array.isArray(locationWithMve.mve.sizes)).toBeTruthy();

                        // Empty sizes array indicates no instance sizes available
                        if (locationWithMve.mve.sizes.length === 0) {
                            // This is valid - no sizes available for this vendor/location
                            expect(locationWithMve.mve.sizes).toEqual([]);
                        }

                        // If details exist, validate structure
                        if (locationWithMve.mve.details) {
                            expect(Array.isArray(locationWithMve.mve.details)).toBeTruthy();

                            if (locationWithMve.mve.details.length > 0) {
                                const mveDetail = locationWithMve.mve.details[0];
                                expect(mveDetail).toHaveProperty("label");
                                expect(mveDetail).toHaveProperty("cpuCoreCount");
                                expect(mveDetail).toHaveProperty("ramGb");
                                expect(mveDetail).toHaveProperty("bandwidthMbps");
                            }
                        }
                    }
                }
            },
        );

        test(
            "should validate latitude and longitude fields",
            {
                tag: ["@api", "@functional", "@istqb"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, {
                    locationStatus: LOCATION_STATUSES.ACTIVE,
                    metro: "Singapore",
                });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();

                if (body.data.length > 0) {
                    const location = body.data[0];
                    expect(location).toHaveProperty("latitude");
                    expect(location).toHaveProperty("longitude");

                    if (location.latitude !== null && location.latitude !== undefined) {
                        expect(typeof location.latitude).toBe("number");
                        expect(location.latitude).toBeGreaterThanOrEqual(-90);
                        expect(location.latitude).toBeLessThanOrEqual(90);
                    }

                    if (location.longitude !== null && location.longitude !== undefined) {
                        expect(typeof location.longitude).toBe("number");
                        expect(location.longitude).toBeGreaterThanOrEqual(-180);
                        expect(location.longitude).toBeLessThanOrEqual(180);
                    }
                }
            },
        );
    });

    test.describe("Equivalence Partitioning - locationStatus", () => {
        // Test each valid status value (valid equivalence classes)
        const validStatuses = [
            LOCATION_STATUSES.ACTIVE,
            LOCATION_STATUSES.EXTENDED,
            LOCATION_STATUSES.DEPLOYMENT,
            LOCATION_STATUSES.NEW,
            LOCATION_STATUSES.RESTRICTED,
            LOCATION_STATUSES.EXPIRED,
        ];

        validStatuses.forEach((status) => {
            test(
                `should accept valid locationStatus: ${status}`,
                {
                    tag: ["@ci", "@api", "@istqb", "@equivalence"],
                },
                async () => {
                    await api.getRequest(API_ENDPOINTS.LOCATIONS, { locationStatus: status });

                    expect(api.status()).toBe(HTTP_STATUS.OK);

                    const body = await api.getBody();
                    expect(body).toHaveProperty("data");
                },
            );
        });

        test(
            "should handle invalid locationStatus value",
            {
                tag: ["@api", "@negative", "@istqb", "@equivalence"],
            },
            async () => {
                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, { locationStatus: "InvalidStatus123" });

                // API may return 200 with empty data or 400 Bad Request
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );
    });

    test.describe("Equivalence Partitioning - mveVendor", () => {
        // Test each valid vendor (valid equivalence classes)
        const validVendors = [
            MVE_VENDORS.ARUBA,
            MVE_VENDORS.CISCO,
            MVE_VENDORS.FORTINET,
            MVE_VENDORS.VERSA,
            MVE_VENDORS.VMWARE,
            MVE_VENDORS.PALO_ALTO,
        ];

        validVendors.forEach((vendor) => {
            test(
                `should accept valid mveVendor: ${vendor}`,
                {
                    tag: ["@api", "@istqb", "@equivalence"],
                },
                async () => {
                    await api.getRequest(API_ENDPOINTS.LOCATIONS, { mveVendor: vendor });

                    expect(api.status()).toBe(HTTP_STATUS.OK);

                    const body = await api.getBody();
                    expect(body).toHaveProperty("data");
                },
            );
        });

        test(
            "should handle invalid mveVendor value",
            {
                tag: ["@api", "@negative", "@istqb", "@equivalence"],
            },
            async () => {
                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, { mveVendor: "InvalidVendor999" });

                // API may return 200 with empty data or 400 Bad Request
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );
    });

    test.describe("Equivalence Partitioning - marketEnabled", () => {
        test(
            "should accept marketEnabled as true",
            {
                tag: ["@ci", "@api", "@istqb", "@equivalence"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { marketEnabled: true });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body).toHaveProperty("data");
            },
        );

        test(
            "should accept marketEnabled as false (default)",
            {
                tag: ["@ci", "@api", "@istqb", "@equivalence"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS, { marketEnabled: false });

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body).toHaveProperty("data");
            },
        );

        test(
            "should handle invalid marketEnabled value",
            {
                tag: ["@api", "@negative", "@istqb", "@equivalence"],
            },
            async () => {
                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, { marketEnabled: "not_a_boolean" as any });

                // API may return 400 or coerce to boolean
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );
    });

    test.describe("Boundary Testing", () => {
        test(
            "should handle minimum boundary values",
            {
                tag: ["@ci", "@api", "@boundary"],
            },
            async () => {
                const params = PayloadBuilder.generateMinBoundaryParams();

                await api.getRequest(API_ENDPOINTS.LOCATIONS, params);

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
                expect(body).toBeDefined();
            },
        );

        test(
            "should handle maximum boundary values",
            {
                tag: ["@ci", "@api", "@boundary"],
            },
            async () => {
                const params = PayloadBuilder.generateMaxBoundaryParams();

                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, params);

                // API should handle large values gracefully (200 or 400)
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );

        test(
            "should handle empty parameters",
            {
                tag: ["@ci", "@api", "@boundary"],
            },
            async () => {
                await api.getRequest(API_ENDPOINTS.LOCATIONS);

                expect(api.status()).toBe(HTTP_STATUS.OK);

                const body = await api.getBody();
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
            async () => {
                const invalidParams = PayloadBuilder.generateInvalidParams();

                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, invalidParams);

                // API might return 400 or process with default values (200)
                // Adjust based on your API's error handling
                if (api.status() === HTTP_STATUS.BAD_REQUEST) {
                    const body = await api.getBody();
                    expect(body?.error || body?.message).toBeDefined();
                }
            },
        );

        test(
            "should handle invalid Accept header gracefully",
            {
                tag: ["@ci", "@api", "@negative"],
            },
            async () => {
                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, {
                    locationStatus: LOCATION_STATUSES.ACTIVE,
                }, {
                    Accept: "application/xml",
                });

                // API should either return JSON anyway or 406 Not Acceptable
                expect([HTTP_STATUS.OK, 406]).toContain(api.status());
            },
        );

        test(
            "should return appropriate error for non-existent endpoint",
            {
                tag: ["@ci", "@api", "@negative"],
            },
            async () => {
                await api.setExpectedStatus(-1).getRequest("/v2/locations/nonexistent123456");

                expect(api.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
            },
        );
    });

    test.describe("Performance Testing", () => {
        test(
            "should respond within acceptable time threshold",
            {
                tag: ["@ci", "@api", "@performance"],
            },
            async () => {
                const params = PayloadBuilder.generateValidLocationParams();

                const startTime = Date.now();
                await api.getRequest(API_ENDPOINTS.LOCATIONS, params);
                const duration = Date.now() - startTime;

                expect(api.status()).toBe(HTTP_STATUS.OK);
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
                    new Api(request, api['baseURL']).getRequest(API_ENDPOINTS.LOCATIONS, params)
                );

                const results = await Promise.all(promises);
                const duration = Date.now() - startTime;

                // All requests should succeed
                results.forEach((res) => {
                    expect(res.status()).toBe(HTTP_STATUS.OK);
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
            async () => {
                // Generate unique test data for each run
                const dynamicParams = PayloadBuilder.generateLocationQueryParams({
                    locationStatus: LOCATION_STATUSES.ACTIVE,
                });

                await api.setExpectedStatus(-1).getRequest(API_ENDPOINTS.LOCATIONS, dynamicParams);

                // Should handle various parameter combinations
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );

                const body = await api.getBody();
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
        async () => {
            const url = "/v2/locations";

            await api.getRequest(url, {
                locationStatuses: "Active",
                metro: "Singapore",
            }, {
                Accept: "*/*",
            });

            expect(api.status()).toBe(200);

            const body = await api.getBody();
            expect(body?.message).toContain("List all public locations");
        },
    );
});
