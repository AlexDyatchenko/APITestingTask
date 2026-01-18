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
      locationStatuses: faker.helpers.arrayElement([
        "Active",
        "Inactive",
        "Pending",
      ]),
      metro: faker.location.city(),
      country: faker.location.country(),
      limit: faker.number.int({ min: 1, max: 100 }),
      offset: faker.number.int({ min: 0, max: 1000 }),
      search: faker.word.sample(),
      ...overrides,
    };
  }

  /**
   * Generate valid location query params for success scenarios
   */
  static generateValidLocationParams(): LocationsQueryParams {
    return {
      locationStatuses: "Active",
      metro: "Singapore",
      limit: 10,
      offset: 0,
    };
  }

  /**
   * Generate boundary test data for minimum values
   */
  static generateMinBoundaryParams(): LocationsQueryParams {
    return {
      locationStatuses: "Active",
      limit: 1,
      offset: 0,
      search: "a", // Minimum search length
    };
  }

  /**
   * Generate boundary test data for maximum values
   */
  static generateMaxBoundaryParams(): LocationsQueryParams {
    return {
      locationStatuses: "Active",
      limit: 1000,
      offset: 999999,
      search: "a".repeat(500), // Maximum search length
    };
  }

  /**
   * Generate invalid parameters for error testing
   */
  static generateInvalidParams(): Record<string, any> {
    return {
      locationStatuses: faker.number.int(), // Invalid type
      metro: null,
      limit: -1, // Invalid negative number
      offset: "invalid", // Invalid type
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
