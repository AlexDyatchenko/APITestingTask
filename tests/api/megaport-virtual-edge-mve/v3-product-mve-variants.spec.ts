import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Available MVE Sizes (v3)", () => {
  createApiTest({
    endpoint: "/v3/product/mve/variants",
    method: "GET",
    title: "Available MVE Sizes (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
