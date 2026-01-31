import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/pricebook/ix",
  method: "GET",
  title: "IX Price",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
