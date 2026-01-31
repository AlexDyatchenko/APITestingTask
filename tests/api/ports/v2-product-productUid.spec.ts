import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get Product Details", () => {
  createApiTest({
    endpoint: "/v2/product/{productUid}",
    method: "GET",
    title: "Get Product Details",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
