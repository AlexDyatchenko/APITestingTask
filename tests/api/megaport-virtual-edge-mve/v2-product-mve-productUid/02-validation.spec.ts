import { test } from "@playwright/test";
import { expect } from "../../../../utils/test-extensions";
import { Api } from "../../../../utils/api";
import { HTTP_STATUS } from "../../../../utils/constants";
import { getRequestContext } from "../../../../utils/api-context-manager";
import { PayloadBuilder } from "../../../../modules/data/payload-builder";

test.describe(
  "Modify MVE Details - Validation Errors",
  { tag: ["@api", "@negative"] },
  () => {
    let api: Api;
    const productUid = "test-uid-123";
    const endpoint = `/v2/product/mve/${productUid}`;

    test.beforeEach(async ({ request }) => {
      const baseURL = test.info().project.use.baseURL || "";
      const requestContext = getRequestContext(request);
      api = new Api(requestContext, baseURL);
      api.path(endpoint);
    });

    test("should fail when name is empty", async () => {
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: "",
        costCentre: "Valid CC",
      });
      // Assuming API returns 400 for empty string if required
      expect([
        HTTP_STATUS.BAD_REQUEST,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ]).toContain(api.getResponse().status());
    });

    test("should fail when name is null", async () => {
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: null,
        costCentre: "Valid CC",
      });
      expect(api.getResponse().status()).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    test("should fail when sending invalid types for name", async () => {
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: 12345,
        costCentre: "Valid CC",
      });
      expect(api.getResponse().status()).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    test("should handle payload with extra unknown fields", async () => {
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: "Valid Name",
        costCentre: "Valid CC",
        unknownField: "Should be ignored or fail",
      });
      // Generally REST APIs ignore extra fields, so 200 is expected, or strict validation 400
      // Given the task implies robustness, we'll assert it doesn't crash (500)
      // and if ignored, it returns 200.
      const status = api.getResponse().status();
      expect(status).not.toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      if (status === HTTP_STATUS.OK) {
        const body = await api.getBody();
        expect(body.data.name).toBe("Valid Name");
      }
    });

    test("should fail when request body is empty object", async () => {
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({});
      // Assuming at least one field is required or validation kicks in
      expect([
        HTTP_STATUS.BAD_REQUEST,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ]).toContain(api.getResponse().status());
    });
  },
);
