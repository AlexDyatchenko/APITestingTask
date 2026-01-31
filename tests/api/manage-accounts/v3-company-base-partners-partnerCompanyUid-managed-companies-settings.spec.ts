import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/company/base/partners/:partnerCompanyUid/managed_companies_settings",
  method: "GET",
  title: "List Managed Account Settings",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
