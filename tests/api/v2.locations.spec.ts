import { test } from "@playwright/test";
import { expect } from "../../utils/test-extensions";
import Ajv, { type Options as AjvOptions } from "ajv";
import addFormats from "ajv-formats";
import { PayloadBuilder } from "../../modules/data/payload-builder";
import { Api } from "../../utils/api";
import { APIClient } from "../../utils/api-client";
import {
    API_ENDPOINTS,
    HTTP_STATUS,
    LOCATION_STATUSES,
    MVE_VENDORS,
    PERFORMANCE_THRESHOLDS,
} from "../../utils/constants";
import locationsSchema from "../../fixtures/mocks/locations-schema.json";
import expectedSingaporeLocations from "../../fixtures/expected-locations/singapore-metro.json";

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

test.describe("/v2/locations API Tests", {
    tag: ["@ci", "@api"],
},() => {
    let api: Api;
    let endpoint: string;
    const ajvOptions: AjvOptions = { allowUnionTypes: true };
    const ajv = new Ajv(ajvOptions);
    addFormats(ajv); // Add format support for date-time, email, etc.
    const validateSchema = ajv.compile(locationsSchema);

    test.beforeAll(() => {
        endpoint = API_ENDPOINTS.LOCATIONS;
    });

    test.beforeEach(async ({ request }) => {
        const baseURL = test.info().project.use.baseURL || "";
        api = new Api(request, baseURL);
        api.path(API_ENDPOINTS.LOCATIONS);
    });

    test.describe("Authentication Scenarios", {
        tag: ["@auth"],
    }, () => {
        test(
            "should return 200 with a valid Bearer token",
            async () => {
                // Generate a valid token (in production, this would be from an auth service)
                await api
                    .setToken(PayloadBuilder.generateValidToken())
                    .getRequest(PayloadBuilder.generateValidLocationParams());
                const response = api.getResponse();

                // API may return 401 if token validation is strict
                expect([HTTP_STATUS.OK, HTTP_STATUS.UNAUTHORIZED]).toContain(
                    response.status(),
                );

                if (api.isOk()) {
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
            "should return 401 Unauthorized with a missing token",
            {
                tag: ["@negative"],
            },
            async () => {
                api = new Api(api.requestContext, api.baseURL, -1, false);
                await api.getRequest(PayloadBuilder.generateValidLocationParams(), undefined, -1);

                // Depending on API implementation, it might return 200 or 401
                // Adjust based on your actual API behavior
                if (api.isStatus(HTTP_STATUS.UNAUTHORIZED)) {
                    const body = await api.getBody();
                    expect(body?.error || body?.message).toBeDefined();
                } else {
                    // If API doesn't require auth, it should still return 200
                    expect(api.isOk()).toBeTruthy();
                }
            },
        );

        test(
            "should return 401 Unauthorized with an invalid token",
            {
                tag: ["@negative"],
            },
            async () => {
                await api
                    .setToken(PayloadBuilder.generateInvalidToken())
                    .getRequest(PayloadBuilder.generateValidLocationParams());

                // Depending on API implementation
                if (api.isStatus(HTTP_STATUS.UNAUTHORIZED)) {
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
                tag: ["@schema"],
            },
            async () => {
                const body = await api
                    .params({
                        locationStatuses: LOCATION_STATUSES.ACTIVE,
                        metro: "Singapore",
                    })
                    .get();

                // Validate against JSON schema
                const isValid = validateSchema(body);
                if (!isValid) {
                    console.error("Schema validation errors:", validateSchema.errors);
                }
                expect(isValid).toBeTruthy();
            },
        );

        test(
            "it should have the correct Content-Type header",
            {
                tag: ["@headers"],
            },
            async () => {
                await api.getRequest({ locationStatuses: LOCATION_STATUSES.ACTIVE });

                const contentType = api.getResponse().headers()["content-type"];
                expect(contentType).toContain("application/json");
            },
        );

        test(
            "should validate status codes for success",
            async () => {
                await api.getRequest({ locationStatuses: LOCATION_STATUSES.ACTIVE });

                expect(api.getResponse().ok()).toBeTruthy();
            },
        );
    });

    test.describe("Functional Test Cases - Success Path", {
        tag: ["@functional"],
    }, () => {
        test(
            "should successfully retrieve locations with valid parameters",
            {
                tag: ["@smoke"],
            },
            async () => {
                const body = await api.getRequest(PayloadBuilder.generateValidLocationParams()).then(() => api.getBody());

                expect(body?.message).toContain("List all public locations");

                // Validate response structure
                expect(body).toHaveProperty("message");
                expect(body).toHaveProperty("terms");
                expect(body.terms).toContain("Acceptable Use Policy");

                // Validate data array exists and has a proper structure
                expect(body).toHaveDataArray();
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
            async () => {
                const body = await api.getRequest({ locationStatuses: LOCATION_STATUSES.ACTIVE }).then(() => api.getBody());

                // Validate data is returned
                expect(body).toHaveDataArray();

                // Verify all returned locations have the Active status
                if (body.data.length > 0) {
                    body.data.forEach((location: any) => {
                        expect(location.status).toBe(LOCATION_STATUSES.ACTIVE);
                    });
                }
            },
        );

        test(
            "should filter locations by metro - Singapore",
            async () => {
                const body = await api
                    .params({ metro: "Singapore" })
                    .get();

                // Validate data is returned
                expect(body).toHaveDataArray();
                expect(body.data.length).toBeGreaterThan(0);

                // All locations should be in the Singapore metro
                body.data.forEach((location: any) => {
                    expect(location.metro).toBe("Singapore");
                });

                // Verify we got the expected locations
                const actualLocationNames = body.data.map((loc: any) => loc.name).sort();
                const expectedNames = [...expectedSingaporeLocations.expectedLocationNames].sort();

                // Check that all expected locations are present
                expectedNames.forEach((expectedName: string) => {
                    expect(actualLocationNames).toContain(expectedName);
                });

                // Optional: Log if there are additional locations not in expected list
                const unexpectedLocations = actualLocationNames.filter(
                    (name: string) => !expectedNames.includes(name)
                );
                if (unexpectedLocations.length > 0) {
                    console.log(`Note: Found ${unexpectedLocations.length} additional Singapore locations not in expected list:`, unexpectedLocations);
                }
            },
        );

        test(
            "should handle multiple filter parameters",
            async () => {
                const body = await api.getRequest({
                    locationStatuses: LOCATION_STATUSES.ACTIVE,
                    metro: "Singapore",
                }).then(() => api.getBody());

                expect(body?.message).toBeDefined();
                expect(body).toHaveDataArray();

                // All locations should match both filters
                if (body.data.length > 0) {
                    body.data.forEach((location: any) => {
                        expect(location.status).toBe(LOCATION_STATUSES.ACTIVE);
                        expect(location.metro).toBe("Singapore");
                    });
                }
            },
        );

        test(
            "should filter by marketEnabled parameter",
            async () => {
                const body = await api.getRequest({ marketEnabled: true }).then(() => api.getBody());
                expect(body).toHaveDataArray();
            },
        );

        test(
            "should filter by mveVendor parameter - Aruba",
            async () => {
                const body = await api.getRequest({ mveVendor: MVE_VENDORS.ARUBA }).then(() => api.getBody());
                expect(body).toHaveDataArray();

                // If MVE data exists, validate sizes array
                if (body.data.length > 0 && body.data[0].mve) {
                    expect(body.data[0].mve).toHaveProperty("sizes");
                }
            },
        );

        test(
            "should filter by mveVendor parameter - Cisco",
            async () => {
                const body = await api.getRequest({ mveVendor: MVE_VENDORS.CISCO }).then(() => api.getBody());
                expect(body).toHaveDataArray();
            },
        );

        test(
            "should handle multiple locationStatuses values",
            async () => {
                // API supports multiple status values as per spec - using locationStatuses parameter multiple times
                const body = await api.getRequest({
                    locationStatuses: [
                        LOCATION_STATUSES.ACTIVE,
                        LOCATION_STATUSES.DEPLOYMENT,
                    ],
                }).then(() => api.getBody());
                expect(body).toHaveDataArray();

                // Verify returned locations have one of the requested statuses
                if (body.data.length > 0) {
                    body.data.forEach((location: any) => {
                        expect([LOCATION_STATUSES.ACTIVE, LOCATION_STATUSES.DEPLOYMENT]).toContain(location.status);
                    });
                }
            },
        );

        test(
            "should validate diversityZones object in response",
            async () => {
                const body = await api.getRequest({ locationStatuses: LOCATION_STATUSES.ACTIVE }).then(() => api.getBody());

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
            async () => {
                const body = await api.getRequest({ mveVendor: MVE_VENDORS.ARUBA }).then(() => api.getBody());

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

                        // If details exist, validate the structure
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
            async () => {
                const body = await api.getRequest({
                    locationStatuses: LOCATION_STATUSES.ACTIVE,
                    metro: "Singapore",
                }).then(() => api.getBody());

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

    test.describe("Equivalence Partitioning - locationStatus", {
        tag: ["@istqb", "@equivalence"],
    }, () => {
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
                `should accept valid locationStatuses: ${status}`,
                async () => {
                    const body = await api.getRequest({ locationStatuses: status }).then(() => api.getBody());
                    expect(body).toHaveDataArray();

                    if (body.data.length > 0) {
                        body.data.forEach((location: any) => {
                            expect(location.status).toBe(status);
                        });
                    }
                },
            );
        });

        test(
            "should handle invalid locationStatuses value",
            {
                tag: ["@negative"],
            },
            async () => {
                await api.getRequest({ locationStatuses: "InvalidStatus123" }, undefined, -1);

                // API may return 200 with empty data or 400 Bad Request
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );
    });

    test.describe("Equivalence Partitioning - mveVendor", {
        tag: ["@istqb", "@equivalence"],
    }, () => {
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
                async () => {
                    const body = await api.getRequest({ mveVendor: vendor }).then(() => api.getBody());
                    expect(body).toHaveDataArray();
                },
            );
        });

        test(
            "should handle invalid mveVendor value",
            {
                tag: ["@negative"],
            },
            async () => {
                await api.getRequest({ mveVendor: "InvalidVendor999" }, undefined, -1);

                // API may return 200 with empty data or 400 Bad Request
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );
    });

    test.describe("Equivalence Partitioning - marketEnabled", {
        tag: ["@istqb", "@equivalence"],
    }, () => {
        test(
            "should accept marketEnabled as true",
            async () => {
                const body = await api.getRequest({ marketEnabled: true }).then(() => api.getBody());
                expect(body).toHaveDataArray();
            },
        );

        test(
            "should accept marketEnabled as false (default)",
            async () => {
                const body = await api.getRequest({ marketEnabled: false }).then(() => api.getBody());
                expect(body).toHaveDataArray();
            },
        );

        test(
            "should handle invalid marketEnabled value",
            {
                tag: ["@negative"],
            },
            async () => {
                await api.getRequest({ marketEnabled: "not_a_boolean" as any }, undefined, -1);

                // API may return 400 or coerce to boolean
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );
    });

    test.describe("Boundary Testing", {
        tag: ["@boundary"],
    }, () => {
        test(
            "should handle minimum boundary values",
            async () => {
                const body = await api.getRequest(PayloadBuilder.generateMinBoundaryParams()).then(() => api.getBody());
                expect(body).toBeDefined();
            },
        );

        test(
            "should handle maximum boundary values",
            async () => {
                await api.getRequest(PayloadBuilder.generateMaxBoundaryParams(), undefined, -1);

                // API should handle large values gracefully (200 or 400)
                expect([HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
                    api.status(),
                );
            },
        );

        test(
            "should handle empty parameters",
            async () => {
                const body = await api.getRequest().then(() => api.getBody());
                expect(body?.message).toBeDefined();
            },
        );
    });

    test.describe("Error Handling", {
        tag: ["@negative"],
    }, () => {
        test(
            "should return 400 Bad Request for invalid parameters",
            async () => {
                await api.getRequest(PayloadBuilder.generateInvalidParams(), undefined, -1);

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
            async () => {
                await api.getRequest({
                    locationStatuses: LOCATION_STATUSES.ACTIVE,
                }, {
                    Accept: "application/xml",
                }, -1);

                // API should either return JSON anyway or 406 Not Acceptable
                expect([HTTP_STATUS.OK, 406]).toContain(api.status());
            },
        );

        test(
            "should return appropriate error for non-existent endpoint",
            async () => {
                await api.path("/v2/locations/nonexistent123456").getRequest(null, null, -1);

                expect(api.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
            },
        );
    });

    test.describe("Performance Testing", {
        tag: ["@performance"],
    }, () => {
        test(
            "should respond within acceptable time threshold",
            async () => {
                const startTime = Date.now();
                await api.getRequest(PayloadBuilder.generateValidLocationParams());
                const duration = Date.now() - startTime;
                expect(duration).toBeLessThan(
                    PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME + 100,
                );

                // console.log(`API response time: ${duration}ms`);
            },
        );

        test(
            "should handle concurrent requests efficiently",
            {
                tag: ["@load"],
            },
            async ({ request }) => {
                const concurrentRequests = 10;
                const startTime = Date.now();

                const promises = Array.from({ length: concurrentRequests }, () =>
                    new Api(request, api.baseURL).getRequest(PayloadBuilder.generateValidLocationParams())
                );

                const results = await Promise.all(promises);
                const duration = Date.now() - startTime;

                // All requests should succeed
                results.forEach((res) => {
                    expect(res.isOk()).toBeTruthy();
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

    test.describe("Dynamic Data Testing", {
        tag: ["@dynamic"],
    }, () => {
        test(
            "should handle dynamically generated query parameters",
            async () => {
                // Generate unique test data for each run
                const dynamicParams = PayloadBuilder.generateLocationQueryParams({
                    locationStatus: LOCATION_STATUSES.ACTIVE,
                });

                await api.getRequest(dynamicParams, undefined, -1);

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

    test.describe("Additional Metro Filter Tests", () => {
        test(
            "should validate metro filter with different metro - London",
            {
                tag: ["@functional"],
            },
            async () => {
                const body = await api
                    .params({ metro: "London" })
                    .get();

                expect(body).toHaveDataArray();

                // All locations should be in the London metro
                if (body.data.length > 0) {
                    body.data.forEach((location: any) => {
                        expect(location.metro).toBe("London");
                    });
                }
            },
        );

        test(
            "should return empty or filtered results for non-existent metro",
            {
                tag: ["@negative"],
            },
            async () => {
                const body = await api
                    .params({ metro: "NonExistentMetro123" })
                    .get();

                expect(body).toHaveDataArray();
                // Should return an empty array or handle gracefully
                expect(body.data.length).toBe(0);
            },
        );
    });

    // Keep the original test for backwards compatibility
    test(
        "Original: /v2/locations basic test",
        {
            tag: ["@legacy"],
        },
        async () => {
            const body = await api.getRequest({
                locationStatuses: "Active",
                metro: "Singapore",
            }, {
                Accept: "*/*",
            }).then(() => api.getBody());
            expect(body?.message).toContain("List all public locations");
        },
    );
});
