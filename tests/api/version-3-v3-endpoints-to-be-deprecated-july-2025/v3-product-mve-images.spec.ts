import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for MVE Image Details (v3)", () => {
  createApiTest({
    endpoint: "/v3/product/mve/images",
    method: "GET",
    title: "MVE Image Details (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
