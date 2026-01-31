import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/product/:productUid/action/:action",
  method: "POST",
  title: "Delete Megaport Internet (v3)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
