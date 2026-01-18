import { APIRequestContext, APIResponse } from "@playwright/test";

/**
 * Reusable API client wrapper with common functionality
 */
export class APIClient {
  private context: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(
    context: APIRequestContext,
    baseURL?: string,
    defaultHeaders?: Record<string, string>,
  ) {
    this.context = context;
    this.baseURL = baseURL || process.env.BASE_URL || "";
    this.defaultHeaders = defaultHeaders || {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Make a GET request
   */
  async get(
    endpoint: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      authToken?: string;
    },
  ): Promise<APIResponse> {
    const headers = this.buildHeaders(options?.headers, options?.authToken);

    return await this.context.get(`${this.baseURL}${endpoint}`, {
      headers,
      params: options?.params,
    });
  }

  /**
   * Make a POST request
   */
  async post(
    endpoint: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      authToken?: string;
    },
  ): Promise<APIResponse> {
    const headers = this.buildHeaders(options?.headers, options?.authToken);

    return await this.context.post(`${this.baseURL}${endpoint}`, {
      headers,
      data: options?.data,
    });
  }

  /**
   * Make a PUT request
   */
  async put(
    endpoint: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      authToken?: string;
    },
  ): Promise<APIResponse> {
    const headers = this.buildHeaders(options?.headers, options?.authToken);

    return await this.context.put(`${this.baseURL}${endpoint}`, {
      headers,
      data: options?.data,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      authToken?: string;
    },
  ): Promise<APIResponse> {
    const headers = this.buildHeaders(options?.headers, options?.authToken);

    return await this.context.delete(`${this.baseURL}${endpoint}`, {
      headers,
    });
  }

  /**
   * Make a PATCH request
   */
  async patch(
    endpoint: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      authToken?: string;
    },
  ): Promise<APIResponse> {
    const headers = this.buildHeaders(options?.headers, options?.authToken);

    return await this.context.patch(`${this.baseURL}${endpoint}`, {
      headers,
      data: options?.data,
    });
  }

  /**
   * Build headers with auth token if provided
   */
  private buildHeaders(
    customHeaders?: Record<string, string>,
    authToken?: string,
  ): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  }

  /**
   * Validate response status code
   */
  static validateStatusCode(
    response: APIResponse,
    expectedStatus: number,
  ): void {
    if (response.status() !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, got ${response.status()}`,
      );
    }
  }

  /**
   * Get response time in milliseconds
   */
  static async getResponseTime(
    apiCall: () => Promise<APIResponse>,
  ): Promise<{ response: APIResponse; duration: number }> {
    const startTime = Date.now();
    const response = await apiCall();
    const duration = Date.now() - startTime;

    return { response, duration };
  }

  /**
   * Parse JSON response
   */
  static async parseJSON<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }

  /**
   * Check if response header matches expected value
   */
  static validateHeader(
    response: APIResponse,
    headerName: string,
    expectedValue: string | RegExp,
  ): boolean {
    const headerValue = response.headers()[headerName.toLowerCase()];

    if (typeof expectedValue === "string") {
      return headerValue === expectedValue;
    }

    return expectedValue.test(headerValue || "");
  }
}
