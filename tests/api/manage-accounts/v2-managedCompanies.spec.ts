import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for List Managed Accounts", () => {
  createApiTest({
    endpoint: "/v2/managedCompanies",
    method: "GET",
    title: "List Managed Accounts",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
