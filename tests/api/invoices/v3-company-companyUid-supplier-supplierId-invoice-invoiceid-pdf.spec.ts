import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/company/{companyUid}/supplier/{supplierId}/invoice/{invoiceid}/pdf",
  method: "GET",
  title: "Single Invoice PDF (v3)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
