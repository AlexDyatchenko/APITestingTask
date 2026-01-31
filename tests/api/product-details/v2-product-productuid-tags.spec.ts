import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/{productuid}/tags",
  method: "GET",
  title: "Get Resource Tags for Product",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
