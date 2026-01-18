/**
 * Type definitions for Locations API
 */

export interface LocationsQueryParams {
  locationStatus?: string | string[];
  metro?: string;
  marketEnabled?: boolean;
  mveVendor?: string;
  [key: string]: string | string[] | number | boolean | undefined;
}

export interface DiversityZone {
  id: string;
  name: string;
  supportedPortSpeeds: number[];
}

export interface MveSize {
  id: string;
  label: string;
  cpuCoreCount: number;
  ramGb: number;
  bandwidthMbps: number;
}

export interface Location {
  id: string;
  name: string;
  metro?: string;
  country?: string;
  city?: string;
  status: string;
  siteCode?: string;
  networkRegion?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  latitude?: number;
  longitude?: number;
  diversityZones?: DiversityZone[];
  products?: string[];
  mve?: {
    sizes?: string[];
    details?: MveSize[];
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
