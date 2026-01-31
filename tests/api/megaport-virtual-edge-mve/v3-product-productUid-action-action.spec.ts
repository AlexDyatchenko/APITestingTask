import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Delete Megaport Internet (v3)", () => {
  createApiTest({
    endpoint: "/v3/product/:productUid/action/:action",
    method: "POST",
    title: "Delete Megaport Internet (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
