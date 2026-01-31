import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/locations",
  method: "GET",
  title: "Locations (v2)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
