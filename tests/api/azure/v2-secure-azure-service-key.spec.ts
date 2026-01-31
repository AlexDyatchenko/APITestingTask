import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/secure/azure/{service_key}",
  method: "GET",
  title: "Look Up Azure Service Key",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
