import { APIRequestContext, APIResponse } from "@playwright/test";
import { PayloadBuilder } from "../modules/data/payload-builder";
import { expect } from "@playwright/test";
import { SchemaValidator } from "./schema-validator";

let storedToken: string | null = null;

export class Api {
  private response: APIResponse | null = null;
  private authToken: string | null = null;
  private checkStatus: boolean = true;
  private expectErrorToMatch: RegExp | null = null;
  private endpoint: string = "";
  private requestParams: any = undefined;
  private requestBody: any = undefined;
  private requestHeaders: Record<string, string> = {};
  
  // Validation related
  private schemaValidator: SchemaValidator;
  private currentSchema: object | null = null;
  private currentSchemaKey: string = "";

  constructor(
    public requestContext: APIRequestContext,
    public baseURL: string = "",
    private expectedStatus: number = -1,
    private getToken: boolean = true,
  ) {
    this.schemaValidator = new SchemaValidator();
  }

  setAjvSchema(schema: object, key: string): this {
    this.currentSchema = schema;
    this.currentSchemaKey = key;
    return this;
  }

  private getAutoMappedStatus(method: string): number {
    switch (method.toUpperCase()) {
      case "GET":
      case "PUT":
      case "PATCH":
      case "DELETE":
        return 200;
      case "POST":
        return 200; // Mapped to 200 as requested "defaults like 200"
      default:
        return 200;
    }
  }

  setExpectedStatus(status: number): this {
    this.expectedStatus = status;
    return this;
  }

  setToken(token: string): this {
    this.authToken = token;
    return this;
  }

  /**
   * Enable or disable automatic status check (default: true)
   */
  setCheckStatus(check: boolean): this {
    this.checkStatus = check;
    return this;
  }

  /**
   * Set a regex pattern to match error messages in response body
   * Automatically checks body.error or body.message against this pattern
   */
  expectErrorMatching(pattern: RegExp): this {
    this.expectErrorToMatch = pattern;
    return this;
  }

  /**
   * Set the endpoint path (fluent design)
   */
  path(endpoint: string): this {
    this.endpoint = endpoint;
    return this;
  }

  /**
   * Set query parameters (fluent design)
   */
  params(params: any): this {
    this.requestParams = params;
    return this;
  }

  /**
   * Set request body (fluent design)
   */
  body(data: any): this {
    this.requestBody = data;
    return this;
  }

  /**
   * Set custom headers (fluent design)
   */
  headers(headers: Record<string, string>): this {
    this.requestHeaders = { ...this.requestHeaders, ...headers };
    return this;
  }

  private async getAuthToken(): Promise<string | null> {
    if (this.authToken) return this.authToken;
    if (!this.getToken) return null;

    if (!storedToken) {
      storedToken = PayloadBuilder.generateValidToken();
    }
    return storedToken;
  }

  private async fetch(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    endpoint: string,
    options: {
      params?: any;
      data?: any;
      headers?: Record<string, string>;
    } = {},
  ): Promise<this> {
    const token = await this.getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = this.baseURL + endpoint;

    this.response = await this.requestContext.fetch(url, {
      method,
      headers,
      params: options.params,
      data: options.data,
    });

    const targetStatus =
      this.expectedStatus === -1
        ? this.getAutoMappedStatus(method)
        : this.expectedStatus;

    // Auto-check status if checkStatus is enabled and expectedStatus is set
    if (
      this.checkStatus &&
      this.expectedStatus !== -1 &&
      this.response.status() !== targetStatus
    ) {
      throw new Error(
        `Expected status ${targetStatus}, but got ${this.response.status()} for ${method} ${endpoint}`,
      );
    }

    return this;
  }

  /**
   * Automatically perform assertions on the response body
   */
  private async performAutoAssertions(body: any): Promise<void> {
    // Auto-check status if enabled
    if (this.checkStatus && this.expectedStatus !== -1) {
      expect(this.isOk()).toBeTruthy();
    }

    // Auto-check error message pattern if set
    if (this.expectErrorToMatch) {
      const errorMessage = body?.error || body?.message;
      expect(errorMessage).toMatch(this.expectErrorToMatch);
    }
  }

  /**
   * Execute GET request (old pattern - for backward compatibility)
   */
  async getRequest(
    params?: any,
    headers?: Record<string, string>,
    expectedStatus?: number,
  ): Promise<this> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    return await this.fetch("GET", this.endpoint, { params, headers });
  }

  /**
   * Execute POST request (old pattern - for backward compatibility)
   */
  async postRequest(
    data?: any,
    headers?: Record<string, string>,
    expectedStatus?: number,
  ): Promise<this> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    return await this.fetch("POST", this.endpoint, { data, headers });
  }

  /**
   * Execute PUT request (old pattern - for backward compatibility)
   */
  async putRequest(
    data?: any,
    headers?: Record<string, string>,
    expectedStatus?: number,
  ): Promise<this> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    return await this.fetch("PUT", this.endpoint, { data, headers });
  }

  /**
   * Execute DELETE request (old pattern - for backward compatibility)
   */
  async deleteRequest(
    params?: any,
    headers?: Record<string, string>,
    expectedStatus?: number,
  ): Promise<this> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    return await this.fetch("DELETE", this.endpoint, { params, headers });
  }

  /**
   * Execute PATCH request (old pattern - for backward compatibility)
   */
  async patchRequest(
    data?: any,
    headers?: Record<string, string>,
    expectedStatus?: number,
  ): Promise<this> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    return await this.fetch("PATCH", this.endpoint, { data, headers });
  }

  /**
   * Execute GET request using fluent builder pattern
   * Returns response body directly with auto-assertions
   */
  async get<T = any>(expectedStatus?: number): Promise<T> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    await this.fetch("GET", this.endpoint, {
      params: this.requestParams,
      headers: this.requestHeaders,
    });
    return await this.getBodyWithAssertions<T>();
  }

  /**
   * Execute POST request using fluent builder pattern
   * Returns response body directly with auto-assertions
   */
  async post<T = any>(expectedStatus?: number): Promise<T> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    await this.fetch("POST", this.endpoint, {
      data: this.requestBody,
      headers: this.requestHeaders,
    });
    return await this.getBodyWithAssertions<T>();
  }

  /**
   * Execute PUT request using fluent builder pattern
   * Returns response body directly with auto-assertions
   */
  async put<T = any>(expectedStatus?: number): Promise<T> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    await this.fetch("PUT", this.endpoint, {
      data: this.requestBody,
      headers: this.requestHeaders,
    });
    return await this.getBodyWithAssertions<T>();
  }

  /**
   * Execute DELETE request using fluent builder pattern
   * Returns response body directly with auto-assertions
   */
  async delete<T = any>(expectedStatus?: number): Promise<T> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    await this.fetch("DELETE", this.endpoint, {
      params: this.requestParams,
      headers: this.requestHeaders,
    });
    return await this.getBodyWithAssertions<T>();
  }

  /**
   * Execute PATCH request using fluent builder pattern
   * Returns response body directly with auto-assertions
   */
  async patch<T = any>(expectedStatus?: number): Promise<T> {
    if (expectedStatus !== undefined) this.expectedStatus = expectedStatus;
    await this.fetch("PATCH", this.endpoint, {
      data: this.requestBody,
      headers: this.requestHeaders,
    });
    return await this.getBodyWithAssertions<T>();
  }

  getResponse(): APIResponse {
    if (!this.response) {
      throw new Error("No response is available. Make a request first.");
    }
    return this.response;
  }

  async getBody<T = any>(): Promise<T> {
    const body = await this.getResponse().json();
    
    // Auto-validate schema if one is set
    if (this.currentSchema && this.currentSchemaKey) {
      const { isValid, errors } = this.schemaValidator.validate(this.currentSchema, body, this.currentSchemaKey);
      expect(isValid, `Schema validation failed for ${this.currentSchemaKey}:\n ${errors}`).toBeTruthy();
    }
    
    return body;
  }

  /**
   * Get body with automatic assertions
   * Use this instead of getBody() to automatically perform status and error checks
   */
  async getBodyWithAssertions<T = any>(): Promise<T> {
    const body = await this.getBody<T>();
    await this.performAutoAssertions(body);
    return body;
  }

  /**
   * Convenience method: assert that response is OK (200)
   */
  assertOk(): this {
    expect(this.isOk()).toBeTruthy();
    return this;
  }

  /**
   * Convenience method: assert error message matches pattern
   */
  async assertErrorMatches(pattern: RegExp): Promise<this> {
    const body = await this.getBody();
    const errorMessage = body?.error || body?.message;
    expect(errorMessage).toMatch(pattern);
    return this;
  }

  status(): number {
    return this.getResponse().status();
  }

  isOk(): boolean {
    return this.status() === 200; // As requested, based on HTTP_STATUS.OK
  }

  isStatus(expectedStatus: number): boolean {
    return this.status() === expectedStatus;
  }
}
