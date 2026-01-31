import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Port Price", () => {
  createApiTest({
    endpoint: "/v2/pricebook/megaport",
    method: "GET",
    title: "Port Price",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
