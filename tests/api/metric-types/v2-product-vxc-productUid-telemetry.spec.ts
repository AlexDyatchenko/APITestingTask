import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get Megaport Internet Telemetry", () => {
  createApiTest({
    endpoint: "/v2/product/vxc/{productUid}/telemetry",
    method: "GET",
    title: "Get Megaport Internet Telemetry",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
