import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/ix/{productUid}",
  method: "PUT",
  title: "Update IX",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
