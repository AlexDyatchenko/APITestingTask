import { test } from "@playwright/test";
import { expect } from "../../../../utils/test-extensions";
import { Api } from "../../../../utils/api";
import { HTTP_STATUS } from "../../../../utils/constants";
import { getRequestContext } from "../../../../utils/api-context-manager";
import { PayloadBuilder } from "../../../../modules/data/payload-builder";

test.describe(
  "Modify MVE Details - Auth Scenarios",
  { tag: ["@api", "@auth"] },
  () => {
    let api: Api;
    const productUid = "test-uid-123";
    const endpoint = `/v2/product/mve/${productUid}`;
    const validBody = { name: "Auth Test Name", costCentre: "Auth Test CC" };

    test.beforeEach(async ({ request }) => {
      const baseURL = test.info().project.use.baseURL || "";
      const requestContext = getRequestContext(request);
      api = new Api(requestContext, baseURL, -1, false); // Disable auto-token generation
      api.path(endpoint);
    });

    test("should return 401 when no token is provided", async () => {
      await api.putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    test("should return 401 when invalid token is provided", async () => {
      await api.setToken("invalid-token-123").putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    test("should return 401/403 for expired token", async () => {
      // Simulating expired by using a specific invalid string or expecting mock to handle it
      // In a real env, we'd generate an expired JWT
      await api.setToken("expired-token").putRequest(validBody);
      expect([HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN]).toContain(
        api.getResponse().status(),
      );
    });

    test("should return 403 when user does not own the product", async () => {
      // This usually requires setup of a different user or specific mock response
      await api.setToken("other-user-token").putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.FORBIDDEN);
    });

    test("should return 401 when token is malformed", async () => {
      await api.setToken("Bearer: malformed").putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    });
  },
);
