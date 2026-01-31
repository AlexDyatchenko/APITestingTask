import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/market",
  method: "GET",
  title: "Get Billing Markets",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
