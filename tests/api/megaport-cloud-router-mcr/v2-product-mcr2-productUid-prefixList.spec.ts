import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for Create MCR Prefix List", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/prefixList",
    method: "POST",
    title: "Create MCR Prefix List",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
