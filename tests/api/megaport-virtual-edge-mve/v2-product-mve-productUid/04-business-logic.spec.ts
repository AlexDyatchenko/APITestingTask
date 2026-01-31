import { test } from "@playwright/test";
import { expect } from "../../../../utils/test-extensions";
import { Api } from "../../../../utils/api";
import { HTTP_STATUS } from "../../../../utils/constants";
import { getRequestContext } from "../../../../utils/api-context-manager";
import { PayloadBuilder } from "../../../../modules/data/payload-builder";
import { faker } from "@faker-js/faker";

test.describe(
  "Modify MVE Details - Business Logic",
  { tag: ["@api"] },
  () => {
    let api: Api;
    const endpointBase = "/v2/product/mve";
    const validBody = { name: "Logic Test Name", costCentre: "Logic Test CC" };

    test.beforeEach(async ({ request }) => {
      const baseURL = test.info().project.use.baseURL || "";
      const requestContext = getRequestContext(request);
      api = new Api(requestContext, baseURL);
    });

    test("should return 404 for non-existent productUid", async () => {
      const nonExistentId = faker.string.uuid();
      api.path(`${endpointBase}/${nonExistentId}`);
      await api
        .setToken(PayloadBuilder.generateValidToken())
        .putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.NOT_FOUND);
    });

    test("should return 400/404 for invalid productUid format", async () => {
      api.path(`${endpointBase}/invalid-uuid-format`);
      await api
        .setToken(PayloadBuilder.generateValidToken())
        .putRequest(validBody);
      // Some APIs validation happens before DB lookup (400), some try to find it (404)
      expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.NOT_FOUND]).toContain(
        api.getResponse().status(),
      );
    });

    test("should handle update on a 'deleted' product (if applicable)", async () => {
      // Assuming we can simulate an ID that maps to a deleted product
      const deletedId = "deleted-product-uid";
      api.path(`${endpointBase}/${deletedId}`);
      await api
        .setToken(PayloadBuilder.generateValidToken())
        .putRequest(validBody);
      expect([
        HTTP_STATUS.NOT_FOUND,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ]).toContain(api.getResponse().status());
    });

    test("should verify response time is within acceptable limits", async () => {
      const productUid = "test-uid-123";
      api.path(`${endpointBase}/${productUid}`);
      const start = Date.now();
      await api
        .setToken(PayloadBuilder.generateValidToken())
        .putRequest(validBody);
      const duration = Date.now() - start;
      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      // Assuming 2000ms is the threshold, adjust as per limits
      expect(duration).toBeLessThan(2000);
    });

    test("should handle idempotency correctly", async () => {
      const productUid = "test-uid-123";
      api.path(`${endpointBase}/${productUid}`);
      const token = PayloadBuilder.generateValidToken();

      // First Request
      await api.setToken(token).putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      const firstBody = await api.getBody();

      // Second Request (Same Data)
      await api.setToken(token).putRequest(validBody);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      const secondBody = await api.getBody();

      expect(secondBody.data.name).toBe(firstBody.data.name);
      // Ensure no unwanted side effects happened
    });
  },
);
