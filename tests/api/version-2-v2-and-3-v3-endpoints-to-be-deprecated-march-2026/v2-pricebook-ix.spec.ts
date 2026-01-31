import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for IX Price", () => {
  createApiTest({
    endpoint: "/v2/pricebook/ix",
    method: "GET",
    title: "IX Price",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
