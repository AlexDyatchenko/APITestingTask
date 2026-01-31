import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/mcr2/{productUid}/diagnostics/routes/bgp/neighbor",
  method: "GET",
  title: "List BGP Neighbor Routes",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
