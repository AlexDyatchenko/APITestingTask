import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Update MCR Prefix List", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/prefixList/{id}",
    method: "PUT",
    title: "Update MCR Prefix List",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
