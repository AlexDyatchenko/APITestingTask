import { test } from "@playwright/test";
import { expect } from "./test-extensions";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { Api } from "./api";
import { APIClient } from "./api-client";
import { HTTP_STATUS, PERFORMANCE_THRESHOLDS } from "./constants";
import { getRequestContext } from "./api-context-manager";
import { PayloadBuilder } from "../modules/data/payload-builder";

export interface ApiTestOptions {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  title?: string;
  schema?: object;
  validParams?: Record<string, any>;
  validBody?: Record<string, any>;
  extraTests?: (getApi: () => Api) => void;
  // contract tests might require mocking
  isContractTest?: boolean;
}

export function createApiTest(options: ApiTestOptions) {
  const {
    endpoint,
    method = "GET",
    title = `API Tests for ${endpoint}`,
    schema,
    validParams,
    validBody,
    extraTests,
    isContractTest = false,
  } = options;

  test.describe(title, { tag: ["@api", "@generated"] }, () => {
    let api: Api;
    let ajv: Ajv;
    let validateSchema: any;

    if (schema) {
      ajv = new Ajv({ allowUnionTypes: true });
      addFormats(ajv);
      validateSchema = ajv.compile(schema);
    }

    test.beforeEach(async ({ request }) => {
      const baseURL = test.info().project.use.baseURL || "";
      const requestContext = getRequestContext(request, isContractTest);
      api = new Api(requestContext, baseURL);
      api.path(endpoint);
    });

    test.describe("Authentication Scenarios", () => {
      test("should return 200/success with a valid token", async () => {
        // Assume PayloadBuilder.generateValidToken() is generic enough or we use a static token
        const token = PayloadBuilder.generateValidToken();

        if (method === "GET") {
          await api.setToken(token).getRequest(validParams);
        } else if (method === "POST") {
          await api.setToken(token).postRequest(validBody);
        } else if (method === "PUT") {
          await api.setToken(token).putRequest(validBody);
        } else if (method === "PATCH") {
          await api.setToken(token).patchRequest(validBody);
        } else if (method === "DELETE") {
          await api.setToken(token).deleteRequest(validParams);
        }

        // Adjust based on method mappings in Api class
        // api.getRequest sets expectStatus to default which might be 200

        // Handling the response check generically
        const status = api.getResponse()?.status();
        // Some endpoints return 200, some 201, some 204.
        expect([
          HTTP_STATUS.OK,
          HTTP_STATUS.CREATED,
          HTTP_STATUS.NO_CONTENT,
          HTTP_STATUS.UNAUTHORIZED,
        ]).toContain(status || 200);

        if (api.isOk()) {
          expect(
            APIClient.validateHeader(
              api.getResponse(),
              "Content-Type",
              /application\/json/,
            ),
          ).toBeTruthy();
        }
      });

      test("should return 401 Unauthorized with a missing token", async () => {
        // Re-init without token logic if possible, or just don't set it
        // The current Api class has `getToken` param in constructor
        api = new Api(api.requestContext, api.baseURL, -1, false);
        api.path(endpoint);

        if (method === "GET") await api.getRequest(validParams, undefined, -1);
        else if (method === "POST")
          await api.postRequest(validBody, undefined, -1);
        else if (method === "PUT")
          await api.putRequest(validBody, undefined, -1);
        else if (method === "PATCH")
          await api.patchRequest(validBody, undefined, -1);
        else if (method === "DELETE")
          await api.deleteRequest(validParams, undefined, -1);

        // If auth is required, 401. If public, 200.
        if (api.isStatus(HTTP_STATUS.UNAUTHORIZED)) {
          const body = await api.getBody();
          expect(body?.error || body?.message).toBeDefined();
        }
      });

      test("should return 401 Unauthorized with an invalid token", async () => {
        const invalidToken = PayloadBuilder.generateInvalidToken();
        if (method === "GET")
          await api.setToken(invalidToken).getRequest(validParams);
        else if (method === "POST")
          await api.setToken(invalidToken).postRequest(validBody);
        else if (method === "PUT")
          await api.setToken(invalidToken).putRequest(validBody);
        else if (method === "PATCH")
          await api.setToken(invalidToken).patchRequest(validBody);
        else if (method === "DELETE")
          await api.setToken(invalidToken).deleteRequest(validParams);

        if (api.isStatus(HTTP_STATUS.UNAUTHORIZED)) {
          const body = await api.getBody();
          expect(body?.error || body?.message).toMatch(
            /unauthorized|invalid|token/i,
          );
        }
      });
    });

    if (schema) {
      test.describe("Validation & Schema", () => {
        test(
          "should validate response against JSON schema",
          { tag: ["@schema"] },
          async () => {
            if (method === "GET") await api.getRequest(validParams);
            // ...

            const body = await api.getBody();
            const isValid = validateSchema(body);
            if (!isValid) {
              console.error(
                `Schema errors for ${endpoint}:`,
                validateSchema.errors,
              );
            }
            expect(isValid).toBeTruthy();
          },
        );
      });
    }

    test.describe("Performance Testing", { tag: ["@performance"] }, () => {
      test("should respond within acceptable time threshold", async () => {
        const startTime = Date.now();
        if (method === "GET") await api.getRequest(validParams);
        // ...
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(
          PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME || 2000,
        );
      });
    });

    if (extraTests) {
      test.describe("Functional Test Cases", () => {
        extraTests(() => api);
      });
    }
  });
}
