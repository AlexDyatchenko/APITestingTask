import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for List BGP Routes", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/diagnostics/routes/bgp",
    method: "GET",
    title: "List BGP Routes",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
