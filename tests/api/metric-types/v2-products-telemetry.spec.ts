import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/products/telemetry",
  method: "GET",
  title: "Get Available Metric Types",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
