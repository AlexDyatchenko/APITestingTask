import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Company Users", () => {
  createApiTest({
    endpoint: "/v3/companyActivity/users",
    method: "GET",
    title: "Company Users",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
