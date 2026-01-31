import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Locations (v3)", () => {
  createApiTest({
    endpoint: "/v3/locations",
    method: "GET",
    title: "Locations (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
