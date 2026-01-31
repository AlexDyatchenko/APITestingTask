import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/service/key",
  method: "GET",
  title: "Look Up SAP Service Key",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
