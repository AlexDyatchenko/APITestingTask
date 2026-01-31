import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/pricebook/mcr2",
  method: "GET",
  title: "MCR Price",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
