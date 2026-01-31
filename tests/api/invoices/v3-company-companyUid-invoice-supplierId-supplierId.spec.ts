import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/company/${companyUid}/invoice/supplierId/{supplierId}",
  method: "GET",
  title: "Invoices (v3)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
