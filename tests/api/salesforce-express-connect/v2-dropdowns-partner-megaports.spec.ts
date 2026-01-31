import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/dropdowns/partner/megaports",
  method: "GET",
  title: "Look Up Salesforce Location",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
