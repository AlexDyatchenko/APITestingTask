import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get Marketplace Provider Type", () => {
  createApiTest({
    endpoint: "/v2/marketplace/providerType",
    method: "GET",
    title: "Get Marketplace Provider Type",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
