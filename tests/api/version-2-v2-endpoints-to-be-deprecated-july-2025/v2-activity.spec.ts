import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/activity",
  method: "GET",
  title: "User Activity",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
