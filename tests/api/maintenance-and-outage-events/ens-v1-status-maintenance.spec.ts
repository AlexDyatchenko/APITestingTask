import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Maintenance Events", () => {
  createApiTest({
    endpoint: "/ens/v1/status/maintenance",
    method: "GET",
    title: "Maintenance Events",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
