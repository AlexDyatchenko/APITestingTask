import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/v2/product/mcr2/{productUid}/packetFilter/{packetFilterId}",
  method: "GET",
  title: "Get MCR Packet Filter Details",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
