import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Company Activity", () => {
  createApiTest({
    endpoint: "/v3/companyActivity",
    method: "GET",
    title: "Company Activity",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
