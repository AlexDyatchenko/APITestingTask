import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Megaport Internet Price (v3)", () => {
  createApiTest({
    endpoint: "/v3/pricebook/vxc",
    method: "GET",
    title: "Megaport Internet Price (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
