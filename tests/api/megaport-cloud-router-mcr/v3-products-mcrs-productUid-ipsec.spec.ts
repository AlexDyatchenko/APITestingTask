import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/products/mcrs/{productUid}/ipsec",
  method: "GET",
  title: "Get IPsec Details for MCR",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
