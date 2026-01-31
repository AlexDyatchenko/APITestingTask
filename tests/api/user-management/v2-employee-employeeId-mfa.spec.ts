import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Reset Person Multi-Factor Authentication", () => {
  createApiTest({
    endpoint: "/v2/employee/:employeeId/mfa",
    method: "PUT",
    title: "Reset Person Multi-Factor Authentication",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
