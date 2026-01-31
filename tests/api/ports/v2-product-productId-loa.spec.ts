import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Regenerate LOA for Megaport Service", () => {
  createApiTest({
    endpoint: "/v2/product/{productId}/loa",
    method: "GET",
    title: "Regenerate LOA for Megaport Service",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
