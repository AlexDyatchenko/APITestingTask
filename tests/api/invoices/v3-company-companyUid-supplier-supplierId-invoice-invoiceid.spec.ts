import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Single Invoice (v3)", () => {
  createApiTest({
    endpoint: "/v3/company/{companyUid}/supplier/{supplierId}/invoice/{invoiceid}",
    method: "GET",
    title: "Single Invoice (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
