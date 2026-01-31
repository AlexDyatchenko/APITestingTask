import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Speed Change Price (v2)", () => {
  createApiTest({
    endpoint: "/v2/product/{productUid}/rating/{year}/{month}",
    method: "GET",
    title: "Speed Change Price (v2)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
