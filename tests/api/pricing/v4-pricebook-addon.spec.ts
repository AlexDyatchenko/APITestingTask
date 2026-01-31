import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Get Add-on Price (v4)", () => {
  createApiTest({
    endpoint: "/v4/pricebook/addon",
    method: "POST",
    title: "Get Add-on Price (v4)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
