import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Company Activity Names", () => {
  createApiTest({
    endpoint: "/v3/companyActivityNames",
    method: "GET",
    title: "Company Activity Names",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
