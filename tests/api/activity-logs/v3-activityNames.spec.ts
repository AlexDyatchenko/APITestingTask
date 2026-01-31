import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/activityNames",
  method: "GET",
  title: "User Activity Names",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
