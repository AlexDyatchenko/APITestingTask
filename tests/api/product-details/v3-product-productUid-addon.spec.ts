import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Add Add-on to Existing Product", () => {
  createApiTest({
    endpoint: "/v3/product/{productUid}/addon",
    method: "POST",
    title: "Add Add-on to Existing Product",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
