import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/{productUid}/action/CANCEL_NOW/charges",
  method: "GET",
  title: "Cancellation Price (Lifecyle Action Change) (v2)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
