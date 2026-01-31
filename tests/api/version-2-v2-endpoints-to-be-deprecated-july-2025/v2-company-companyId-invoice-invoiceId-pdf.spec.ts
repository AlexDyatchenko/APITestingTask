import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/company/${companyId}/invoice/${invoiceId}/pdf",
  method: "GET",
  title: "Single Invoice PDF (v2)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
