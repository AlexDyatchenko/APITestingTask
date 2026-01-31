import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Cancellation Price (Lifecyle Action Change) (v2)", () => {
  createApiTest({
    endpoint: "/v2/product/{productUid}/action/CANCEL_NOW/charges",
    method: "GET",
    title: "Cancellation Price (Lifecyle Action Change) (v2)",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
