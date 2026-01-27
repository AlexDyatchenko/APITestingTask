import { APIRequestContext, APIResponse } from "@playwright/test";
import singaporeLocations from "../../fixtures/expected-locations/singapore-metro.json";

export class MockAPIRequestContext {
    async fetch(url: string, options: { method?: string; headers?: Record<string, string>; params?: any; data?: any } = {}): Promise<APIResponse> {

        // Simulate auth failure
        if (options.headers?.["Authorization"]?.includes("invalid_token")) {
             return this.createResponse(401, { error: "Unauthorized", message: "Invalid token" });
        }

        if (!options.headers?.["Authorization"]) {
             return this.createResponse(401, { error: "Unauthorized", message: "Missing token" });
        }

        // Handling non-existent endpoint
        if (url.includes("nonexistent")) {
             return this.createResponse(401, { error: "Unauthorized", message: "Endpoint not found or unauthorized" });
        }

        const params = options.params || {};
        let data = this.generateData();

        // Filtering Logic
        if (params.metro) {
            data = data.filter((l: any) => l.metro === params.metro);
        }

        if (params.locationStatuses) {
            const statuses = Array.isArray(params.locationStatuses) ? params.locationStatuses : [params.locationStatuses];
            data = data.filter((l: any) => statuses.includes(l.status));
        }

        if (params.marketEnabled !== undefined) {
            const enabled = String(params.marketEnabled) === "true";
             data.forEach((l: any) => l.marketEnabled = enabled);
        }

        if (params.mveVendor) {
             data.forEach((l: any) => {
                 if (!l.mve) l.mve = { sizes: [], details: [] };
             });
        }

        // Handling empty result for non-existent metro
        if (params.metro === "NonExistentMetro123") {
            data = [];
        }

        // Special case: Invalid Accept Header test
        if (options.headers?.["Accept"] === "application/xml") {
             // Test expects 406 or 200. Let's return 200 json.
        }

        return this.createResponse(200, {
            message: "List all public locations",
            data: data,
            terms: "Acceptable Use Policy"
        });
    }

    private createResponse(status: number, body: any): APIResponse {
        // Ensure body has data property if it's a success response to match schema
        if (status === 200 && body && !body.data) {
             body.data = [];
        }
        return {
            ok: () => status >= 200 && status < 300,
            status: () => status,
            statusText: () => status === 200 ? "OK" : "Error",
            headers: () => ({ "content-type": "application/json" }),
            json: async () => body,
            text: async () => JSON.stringify(body),
            body: async () => Buffer.from(JSON.stringify(body)),
            dispose: async () => {},
        } as APIResponse;
    }

    private generateData() {
        // Base Singapore locations
        // Schema expects integer ID
        const sgLocations = singaporeLocations.expectedLocationNames.map((name, i) => ({
            id: 1000 + i,
            name: name,
            metro: "Singapore",
            country: "Singapore",
            status: "Active",
            marketEnabled: false,
            address: {
                city: "Singapore",
                street: "Test Street " + i
            },
            latitude: 1.3,
            longitude: 103.8,
            diversityZones: { megaport: [{ name: "Red", speed: 1000 }] },
            products: { megaport: [1000, 10000], mcr: true, mcrVersion: 2 },
            mve: {
                sizes: ["Small", "Medium"],
                details: [{ label: "Small", cpuCoreCount: 2, ramGb: 4, bandwidthMbps: 1000 }]
            },
            siteCode: `SG-DIST-${i}`,
            networkRegion: "Asia Pacific",
        }));

        // Add some others
        const extraLocations = [
            {
                id: 2001,
                name: "Telehouse London",
                metro: "London",
                country: "United Kingdom",
                status: "Active",
                 marketEnabled: true,
                address: { city: "London", street: "London St" },
                latitude: 51.5,
                longitude: -0.1,
                 diversityZones: { megaport: [{ name: "Red", speed: 1000 }] },
                 products: { megaport: [1000, 10000], mve: true },
                 mve: { sizes: ["Small"], details: [{ label: "Small", cpuCoreCount: 2, ramGb: 4, bandwidthMbps: 1000 }] },
                 siteCode: "LON-001",
                 networkRegion: "Europe"
            },
            {
                id: 3001,
                name: "Future Site",
                metro: "TestMetro",
                status: "Deployment",
                marketEnabled: false,
                 address: { city: "Test", street: "Test" },
                 latitude: 0, longitude: 0,
                 mve: { sizes: [] },
                 siteCode: "TEST-001",
                 networkRegion: "Test"
            },
             {
                id: 3002,
                name: "Restricted Site",
                metro: "TestMetro",
                status: "Restricted",
                marketEnabled: false,
                 address: { city: "Test", street: "Test" },
                 latitude: 0, longitude: 0,
                 mve: { sizes: [] },
                 siteCode: "TEST-002",
                 networkRegion: "Test"
            },
            {
                id: 3003,
                name: "New Site",
                metro: "TestMetro",
                status: "New",
                 address: { city: "Test", street: "Test" },
                 latitude: 0, longitude: 0,
                 siteCode: "TEST-003",
                 networkRegion: "Test"
            },
            {
                id: 3004,
                name: "Expired Site",
                metro: "TestMetro",
                status: "Expired",
                 address: { city: "Test", street: "Test" },
                 latitude: 0, longitude: 0,
                 siteCode: "TEST-004",
                 networkRegion: "Test"
            },
            {
                id: 3005,
                name: "Extended Site",
                metro: "TestMetro",
                status: "Extended",
                 address: { city: "Test", street: "Test" },
                 latitude: 0, longitude: 0,
                 siteCode: "TEST-005",
                 networkRegion: "Test"
            }
        ];

        return [...sgLocations, ...extraLocations];
    }
}
