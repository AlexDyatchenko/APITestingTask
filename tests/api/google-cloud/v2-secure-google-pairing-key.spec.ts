import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Look Up Google Pairing Key", () => {
  createApiTest({
    endpoint: "/v2/secure/google/{pairing_key}",
    method: "GET",
    title: "Look Up Google Pairing Key",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
