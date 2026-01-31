import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for List IP Routes", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/diagnostics/routes/ip",
    method: "GET",
    title: "List IP Routes",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
