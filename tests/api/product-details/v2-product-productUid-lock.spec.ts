import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Lock Product", () => {
  createApiTest({
    endpoint: "/v2/product/{productUid}/lock",
    method: "POST",
    title: "Lock Product",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
