import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Look Up Salesforce Location", () => {
  createApiTest({
    endpoint: "/v2/dropdowns/partner/megaports",
    method: "GET",
    title: "Look Up Salesforce Location",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
