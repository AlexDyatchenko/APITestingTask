import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Look Up Oracle Circuit ID", () => {
  createApiTest({
    endpoint: "/v2/secure/oracle/{circuitId}",
    method: "GET",
    title: "Look Up Oracle Circuit ID",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
