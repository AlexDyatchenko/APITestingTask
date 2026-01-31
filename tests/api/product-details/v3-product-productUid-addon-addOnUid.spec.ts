import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Update IPsec Add-On", () => {
  createApiTest({
    endpoint: "/v3/product/{productUid}/addon/{addOnUid}",
    method: "PUT",
    title: "Update IPsec Add-On",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
