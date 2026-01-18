import { faker } from "@faker-js/faker";
import { LocationsQueryParams } from "../locations/locations.types";

/**
 * Payload builder for dynamic test data generation
 */
export class PayloadBuilder {
  /**
   * Generate random location query parameters
   * @param overrides Optional overrides for specific fields
   * @returns LocationsQueryParams object
   */
  static generateLocationQueryParams(
    overrides?: Partial<LocationsQueryParams>,
  ): LocationsQueryParams {
    return {
      locationStatus: faker.helpers.arrayElement([
        "Active",
        "Extended",
        "Deployment",
        "New",
        "Restricted",
        "Expired",
      ]),
      metro: faker.location.city(),
      marketEnabled: faker.datatype.boolean(),
      mveVendor: faker.helpers.arrayElement([
        "Aruba",
        "Cisco",
        "Fortinet",
        "Versa",
        "VMWare",
        "Palo Alto",
      ]),
      ...overrides,
    };
  }

  /**
   * Generate valid location query params for success scenarios
   */
  static generateValidLocationParams(): LocationsQueryParams {
    return {
      locationStatus: "Active",
      metro: "Singapore",
    };
  }

  /**
   * Generate boundary test data for minimum values
   */
  static generateMinBoundaryParams(): LocationsQueryParams {
    return {
      locationStatus: "Active",
      marketEnabled: false,
    };
  }

  /**
   * Generate boundary test data for maximum values
   */
  static generateMaxBoundaryParams(): LocationsQueryParams {
    return {
      locationStatus: "Active",
      metro: "A".repeat(100),
      marketEnabled: true,
    };
  }

  /**
   * Generate invalid parameters for error testing
   */
  static generateInvalidParams(): Record<string, any> {
    return {
      locationStatus: faker.number.int(), // Invalid type
      metro: 12345, // Invalid type (should be string)
      marketEnabled: "invalid", // Invalid type (should be boolean)
      mveVendor: "InvalidVendor123", // Invalid vendor name
    };
  }

  /**
   * Generate a valid Bearer token (mock)
   * In production, this would come from your auth service
   */
  static generateValidToken(): string {
    return faker.string.alphanumeric(64);
  }

  /**
   * Generate an invalid Bearer token
   */
  static generateInvalidToken(): string {
    return "invalid_token_" + faker.string.alphanumeric(10);
  }

  /**
   * Generate dynamic test data for location name
   */
  static generateLocationName(): string {
    return `${faker.location.city()} ${faker.word.adjective()} Center`;
  }

  /**
   * Generate random coordinates
   */
  static generateCoordinates() {
    return {
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
    };
  }
}
