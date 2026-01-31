import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/marketplace/providerType",
  method: "GET",
  title: "Get Marketplace Provider Type",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
