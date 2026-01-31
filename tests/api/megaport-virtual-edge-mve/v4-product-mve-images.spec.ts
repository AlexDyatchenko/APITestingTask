import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for MVE Image Details (v4)", () => {
  createApiTest({
    endpoint: "/v4/product/mve/images",
    method: "GET",
    title: "MVE Image Details (v4)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
