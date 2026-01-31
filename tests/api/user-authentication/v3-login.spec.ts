import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Log in With Username and Password (v3)", () => {
  createApiTest({
    endpoint: "/v3/login",
    method: "POST",
    title: "Log in With Username and Password (v3)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
