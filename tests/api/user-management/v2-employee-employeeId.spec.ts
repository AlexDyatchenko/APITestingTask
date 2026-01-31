import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/employee/123",
  method: "GET",
  title: "Show User Details",
  // schema: require("./path/to/schema"), 
  validParams: {},
  validBody: {}
});
