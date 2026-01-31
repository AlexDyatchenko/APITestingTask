import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Update Managed Company Details", () => {
  createApiTest({
    endpoint: "/v2/managedCompanies/{managedCompanyUid}",
    method: "PUT",
    title: "Update Managed Company Details",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
