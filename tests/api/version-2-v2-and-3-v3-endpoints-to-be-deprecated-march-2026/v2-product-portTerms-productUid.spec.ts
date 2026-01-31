import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Contract Term Details", () => {
  createApiTest({
    endpoint: "/v2/product/portTerms/{productUid}",
    method: "GET",
    title: "Contract Term Details",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
