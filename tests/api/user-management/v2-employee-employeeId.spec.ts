import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";

test.describe("Wrapper for Show User Details", () => {
  createApiTest({
    endpoint: "/v2/employee/123",
    method: "GET",
    title: "Show User Details",
    // schema: require("./path/to/schema"),
    validParams: {},
    validBody: {},
  });
});
