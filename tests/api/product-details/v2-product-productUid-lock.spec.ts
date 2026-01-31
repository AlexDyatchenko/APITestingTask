import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/{productUid}/lock",
  method: "POST",
  title: "Lock Product",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
