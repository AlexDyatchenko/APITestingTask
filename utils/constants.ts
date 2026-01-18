/**
 * Shared constants and enums for the test suite
 */

export const API_ENDPOINTS = {
  LOCATIONS: "/v2/locations",
  USERS: "/v2/users",
  AUTH: "/v2/auth",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
  XML: "application/xml",
  FORM: "application/x-www-form-urlencoded",
  TEXT: "text/plain",
} as const;

export const LOCATION_STATUSES = {
  ACTIVE: "Active",
  EXTENDED: "Extended",
  DEPLOYMENT: "Deployment",
  NEW: "New",
  RESTRICTED: "Restricted",
  EXPIRED: "Expired",
} as const;

export const MVE_VENDORS = {
  ARUBA: "Aruba",
  CISCO: "Cisco",
  FORTINET: "Fortinet",
  VERSA: "Versa",
  VMWARE: "VMWare",
  PALO_ALTO: "Palo Alto",
} as const;

export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 500, // milliseconds
  FAST_API_RESPONSE: 200, // milliseconds
  SLOW_API_RESPONSE: 1000, // milliseconds
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

export const VALIDATION = {
  MIN_SEARCH_LENGTH: 1,
  MAX_SEARCH_LENGTH: 500,
  MAX_LIMIT: 1000,
  MIN_LIMIT: 1,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  INVALID_TOKEN: "Invalid token",
  MISSING_REQUIRED_FIELD: "Missing required field",
  INVALID_PARAMETER: "Invalid parameter",
  BAD_REQUEST: "Bad Request",
} as const;

export const TEST_TIMEOUTS = {
  API_TEST: 30000, // 30 seconds
  INTEGRATION_TEST: 60000, // 60 seconds
  E2E_TEST: 120000, // 120 seconds
} as const;
