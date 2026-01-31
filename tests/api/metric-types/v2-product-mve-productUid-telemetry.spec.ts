import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get MVE Telemetry", () => {
  createApiTest({
    endpoint: "/v2/product/mve/{productUid}/telemetry",
    method: "GET",
    title: "Get MVE Telemetry",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
