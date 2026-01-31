import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/employment",
  method: "GET",
  title: "List Company Users",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
