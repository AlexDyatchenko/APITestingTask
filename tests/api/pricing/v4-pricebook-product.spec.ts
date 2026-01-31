import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v4/pricebook/product",
  method: "POST",
  title: "Get Product Price (v4)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
