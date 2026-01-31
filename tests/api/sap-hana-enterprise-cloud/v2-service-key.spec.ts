import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Look Up SAP Service Key", () => {
  createApiTest({
    endpoint: "/v2/service/key",
    method: "GET",
    title: "Look Up SAP Service Key",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
