import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/networkdesign/buy",
  method: "POST",
  title: "Buy Port for Managed Account (v3)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
