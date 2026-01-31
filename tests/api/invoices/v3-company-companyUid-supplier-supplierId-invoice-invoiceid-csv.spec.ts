import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/company/{companyUid}/supplier/{supplierId}/invoice/{invoiceid}/csv",
  method: "GET",
  title: "Single Invoice CSV (v3)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
