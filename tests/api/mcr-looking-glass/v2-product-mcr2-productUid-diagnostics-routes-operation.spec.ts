import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/mcr2/{productUid}/diagnostics/routes/operation",
  method: "GET",
  title: "MCR IP / BGP / BGP Neighbor Routes in Asynchronous Mode",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
