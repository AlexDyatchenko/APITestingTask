import { test } from "@playwright/test";
import { expect } from "../../../../utils/test-extensions";
import { Api } from "../../../../utils/api";
import { APIClient } from "../../../../utils/api-client";
import { HTTP_STATUS } from "../../../../utils/constants";
import mveSchema from "../../../../fixtures/schemas/megaport-virtual-edge-mve/modify-mve-details.schema.json";
import { getRequestContext } from "../../../../utils/api-context-manager";
import { PayloadBuilder } from "../../../../modules/data/payload-builder";
import { faker } from "@faker-js/faker";

test.describe(
  "Modify MVE Details - Valid Updates",
  { tag: ["@api"] },
  () => {
    let api: Api;
    const productUid = "test-uid-123";
    const endpoint = `/v2/product/mve/${productUid}`;
    const MVE_SCHEMA_KEY = "modify-mve-details-schema";

    test.beforeEach(async ({ request }) => {
      const baseURL = test.info().project.use.baseURL || "";
      const requestContext = getRequestContext(request);
      api = new Api(requestContext, baseURL);
      api.path(endpoint).setAjvSchema(mveSchema, MVE_SCHEMA_KEY);
    });

    test("should successfully update MVE name", async () => {
      const newName = `MVE-Update-${faker.string.alphanumeric(8)}`;
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: newName,
        costCentre: "Existing Cost Centre",
      });

      const response = api.getResponse();
      expect(response.status()).toBe(HTTP_STATUS.OK);
      expect(
        APIClient.validateHeader(response, "Content-Type", /application\/json/),
      ).toBeTruthy();

      const body = await api.getBody();
      expect(body.data.name).toBe(newName);
    });

    test("should successfully update Cost Centre", async () => {
      const newCostCentre = `CC-${faker.finance.accountNumber()}`;
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: "Existing MVE Name",
        costCentre: newCostCentre,
      });

      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      const body = await api.getBody();
      expect(body.data.costCentre).toBe(newCostCentre);
    });

    test("should successfully update both Name and Cost Centre", async () => {
      const newName = faker.commerce.productName();
      const newCC = faker.finance.currencyCode();
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: newName,
        costCentre: newCC,
      });

      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      const body = await api.getBody();
      expect(body.data.name).toBe(newName);
      expect(body.data.costCentre).toBe(newCC);
    });

    test("should handle no changes in update payload", async () => {
      const payload = { name: "Same Name", costCentre: "Same CC" };
      await api
        .setToken(PayloadBuilder.generateValidToken())
        .putRequest(payload);
      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      const body = await api.getBody();
      expect(body.data.name).toBe(payload.name);
    });

    test("should accept max length strings", async () => {
      const longName = "A".repeat(100); // Assuming 100 is safe max
      const longCC = "B".repeat(50);
      await api.setToken(PayloadBuilder.generateValidToken()).putRequest({
        name: longName,
        costCentre: longCC,
      });
      expect(api.getResponse().status()).toBe(HTTP_STATUS.OK);
      const body = await api.getBody();
      expect(body.data.name).toBe(longName);
    });
  },
);
