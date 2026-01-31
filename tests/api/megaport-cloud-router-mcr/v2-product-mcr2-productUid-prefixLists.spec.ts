import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for List MCR Prefix Lists", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/prefixLists",
    method: "GET",
    title: "List MCR Prefix Lists",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
