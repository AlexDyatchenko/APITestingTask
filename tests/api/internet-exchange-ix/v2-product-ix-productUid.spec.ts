import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Update IX", () => {
  createApiTest({
    endpoint: "/v2/product/ix/{productUid}",
    method: "PUT",
    title: "Update IX",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
