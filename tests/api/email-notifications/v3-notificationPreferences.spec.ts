import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for List Notification Settings", () => {
  createApiTest({
    endpoint: "/v3/notificationPreferences",
    method: "GET",
    title: "List Notification Settings",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
