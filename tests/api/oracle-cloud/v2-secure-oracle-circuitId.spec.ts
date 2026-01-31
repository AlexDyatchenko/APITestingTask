import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/secure/oracle/{circuitId}",
  method: "GET",
  title: "Look Up Oracle Circuit ID",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
