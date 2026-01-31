import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/oauth2/token",
  method: "POST",
  title: "Generate Access Token - Production",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
