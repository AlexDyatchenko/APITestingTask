import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get IX Telemetry", () => {
  createApiTest({
    endpoint: "/v2/product/ix/{productUid}/telemetry",
    method: "GET",
    title: "Get IX Telemetry",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
