import { APIRequestContext } from "@playwright/test";
import { LocationsQueryParams, LocationsResponse } from "./locations.types";

/**
 * API wrapper class for /v2/locations endpoint
 * Provides methods to interact with the locations API
 */
export class LocationsAPI {
  private baseURL: string;
  private context: APIRequestContext;

  constructor(context: APIRequestContext, baseURL?: string) {
    this.context = context;
    this.baseURL = baseURL || process.env.BASE_URL || "";
  }

  /**
   * Get all locations with optional filters
   * @param params Query parameters for filtering locations
   * @param authToken Optional Bearer token for authentication
   * @returns API response
   */
  async getLocations(params?: LocationsQueryParams, authToken?: string) {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return await this.context.get(`${this.baseURL}/v2/locations`, {
      headers,
      params: params as any,
    });
  }

  /**
   * Get locations with custom headers
   * @param params Query parameters
   * @param headers Custom headers
   * @returns API response
   */
  async getLocationsWithCustomHeaders(
    params?: LocationsQueryParams,
    headers?: Record<string, string>,
  ) {
    return await this.context.get(`${this.baseURL}/v2/locations`, {
      headers: {
        Accept: "application/json",
        ...headers,
      },
      params: params as any,
    });
  }

  /**
   * Get location by ID (if supported)
   * @param locationId Location ID
   * @param authToken Optional Bearer token
   * @returns API response
   */
  async getLocationById(locationId: string, authToken?: string) {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return await this.context.get(
      `${this.baseURL}/v2/locations/${locationId}`,
      {
        headers,
      },
    );
  }

  /**
   * Validate response structure
   * @param response Response object
   * @returns Parsed JSON body
   */
  async validateAndParseResponse(response: any): Promise<LocationsResponse> {
    const body = await response.json();
    return body as LocationsResponse;
  }
}
