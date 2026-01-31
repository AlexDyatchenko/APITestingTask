import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Look Up AWS Hosted Connection Port Details", () => {
  createApiTest({
    endpoint: "/v2/secure/awshc",
    method: "GET",
    title: "Look Up AWS Hosted Connection Port Details",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
