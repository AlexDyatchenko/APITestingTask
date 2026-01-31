import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/marketplace/profile",
  method: "GET",
  title: "Get Marketplace Profile",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
