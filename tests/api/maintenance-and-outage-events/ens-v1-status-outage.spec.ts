import { createApiTest } from "../../../utils/api-test-factory";

createApiTest({
  endpoint: "/ens/v1/status/outage",
  method: "GET",
  title: "Outage Events",
  // schema: require("./path/to/schema"), 
  validParams: { 
    // TODO: Add required query params
  },
  validBody: {
    // TODO: Add required body params
  }
});
