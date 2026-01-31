import { test } from "@playwright/test";
import { createApiTest } from "../../../utils/api-test-factory";


test.describe("Wrapper for List MCR Packet Filter List", () => {
  createApiTest({
    endpoint: "/v2/product/mcr2/{productUid}/packetFilters",
    method: "GET",
    title: "List MCR Packet Filter List",
    // schema: require("./path/to/schema"), 
    validParams: { 
      // TODO: Add required query params
    },
    validBody: {
      // TODO: Add required body params
    }
  });
});
