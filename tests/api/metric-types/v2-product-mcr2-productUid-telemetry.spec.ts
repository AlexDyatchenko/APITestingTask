import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get MCR Telemetry", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/telemetry",
    method: "GET",
    title: "Get MCR Telemetry",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
