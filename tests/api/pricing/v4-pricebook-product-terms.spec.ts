import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v4/pricebook/product/terms",
  method: "POST",
  title: "Get Product Price for Term Length (v4)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
