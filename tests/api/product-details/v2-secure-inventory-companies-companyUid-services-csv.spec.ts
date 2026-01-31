import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Service Inventory Report", () => {
  createApiTest({
    endpoint: "/v2/secure/inventory/companies/{companyUid}/services/csv",
    method: "GET",
    title: "Service Inventory Report",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
