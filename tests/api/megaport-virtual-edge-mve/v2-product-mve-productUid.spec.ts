import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/mve/test-uid-123",
  method: "PUT",
  title: "Modify MVE Details",
  // schema: require("./path/to/schema"),
  validParams: {},
  validBody: {
    productName: "Updated MVE Name",
    costCentre: "Test Cost Centre",
  },
});
