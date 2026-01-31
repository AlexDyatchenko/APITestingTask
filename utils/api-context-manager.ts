import { APIRequestContext } from "@playwright/test";
import { MockAPIRequestContext } from "../tests/api/mock-request-context";

/**
 * Determines whether to use the real APIRequestContext or a MockAPIRequestContext.
 *
 * Default behavior is to use the REAL backend (provided via realRequest).
 * Mocking is enabled if:
 * 1. process.env.USE_MOCK_API is set to 'true'
 * 2. or forceMock parameter is true
 *
 * @param realRequest The Playwright APIRequestContext
 * @param forceMock Optional boolean to force mocking for specific tests
 * @returns APIRequestContext (real or mock)
 */
export function getRequestContext(
  realRequest: APIRequestContext,
  forceMock: boolean = false,
): APIRequestContext {
  const useMock = process.env.USE_MOCK_API === "true" || forceMock;

  if (useMock) {
    // console.log("Using MockAPIRequestContext");
    return new MockAPIRequestContext() as unknown as APIRequestContext;
  }

  return realRequest;
}
