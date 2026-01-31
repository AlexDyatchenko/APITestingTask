import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/products",
  method: "GET",
  title: "Get Product List",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
