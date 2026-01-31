import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Invoices (v2)", () => {
  createApiTest({
    endpoint: "/v2/company/${companyUid}/invoice/supplierId/{supplierId}",
    method: "GET",
    title: "Invoices (v2)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
