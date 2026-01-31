import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/password/change",
  method: "POST",
  title: "Change Password",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
