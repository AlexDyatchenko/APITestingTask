/**
 * Type definitions for Locations API
 */

export interface LocationsQueryParams {
  locationStatuses?: string | string[];
  metro?: string;
  country?: string;
  limit?: number;
  offset?: number;
  search?: string;
  [key: string]: string | string[] | number | undefined;
}

export interface Location {
  id: string;
  name: string;
  metro?: string;
  country?: string;
  status: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationsResponse {
  message: string;
  data?: Location[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
