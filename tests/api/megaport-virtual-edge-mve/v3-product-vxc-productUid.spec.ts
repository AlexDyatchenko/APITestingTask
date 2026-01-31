import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v3/product/vxc/{productUid}",
  method: "PUT",
  title: "Update VXC for MVE (v3)",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
