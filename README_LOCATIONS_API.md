# /v2/locations API Test Suite

Comprehensive Playwright API test suite for the `/v2/locations` endpoint with modular architecture, schema validation, and WireMock pattern support.

## 📁 Project Structure

```
APITestingTask/
├── tests/
│   └── api/
│       └── v2.locations.spec.ts          # Main test suite with describe blocks
├── modules/
│   ├── locations/
│   │   ├── locations.api.ts              # API wrapper class
│   │   └── locations.types.ts            # TypeScript types
│   └── data/
│       └── payload-builder.ts            # Dynamic test data generator
├── utils/
│   ├── api-client.ts                     # Reusable API client wrapper
│   └── constants.ts                      # Shared constants & enums
└── fixtures/
    └── mocks/
        ├── locations-schema.json         # JSON Schema for validation
        └── locations.wiremock.ts         # WireMock pattern implementation
```

## 🚀 Features

### ✅ Modular Architecture

- **Class-based API wrapper** (`LocationsAPI`) for endpoint interactions
- **Type-safe interfaces** for requests and responses
- **Reusable utilities** for common operations
- **Centralized constants** for maintainability

### ✅ Authentication Scenarios

- Valid Bearer token authentication
- Unauthorized access (missing token)
- Invalid token handling

### ✅ Validation & Schema

- **AJV JSON Schema validation** for response structure
- Header validation (Content-Type, etc.)
- Status code assertions (2xx, 4xx, 5xx)

### ✅ Functional Test Cases

- **Success Path**: Valid requests with proper responses
- **Boundary Testing**: Min/max parameter values
- **Error Handling**: Invalid payloads and 400 Bad Request
- **Performance Testing**: Response time threshold (<500ms)
- **Concurrent Request Testing**: Load testing with multiple simultaneous requests

### ✅ Dynamic Data Generation

- **Faker.js integration** for unique test data on each run
- **Payload builders** for consistent test data creation
- **Boundary value generators** for edge case testing

### ✅ WireMock Pattern Support

- Mock API responses for local isolation
- Conditional stubbing based on parameters
- Error scenario simulation
- Slow response testing

## 📦 Installation

```bash
# Install dependencies
npm install

# Dependencies include:
# - @playwright/test: Test framework
# - ajv: JSON schema validation
# - @faker-js/faker: Dynamic test data generation
```

## 🧪 Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test Groups

```bash
# Run only API tests
npx playwright test --grep "@api"

# Run authentication tests
npx playwright test --grep "@auth"

# Run performance tests
npx playwright test --grep "@performance"

# Run schema validation tests
npx playwright test --grep "@schema"

# Run negative tests
npx playwright test --grep "@negative"
```

### Run Individual Test File

```bash
npx playwright test tests/api/v2.locations.spec.ts
```

### Generate HTML Report

```bash
npx playwright test --reporter=html
npx playwright show-report
```

## 📝 Test Coverage

### 1. Authentication Scenarios

- ✅ Valid Bearer token (200 OK)
- ✅ Missing token (401 Unauthorized)
- ✅ Invalid token (401 Unauthorized)

### 2. Validation & Schema

- ✅ JSON Schema validation with AJV
- ✅ Content-Type header validation
- ✅ Status code assertions

### 3. Functional Tests - Success Path

- ✅ Retrieve locations with valid parameters
- ✅ Filter by location status (Active, Inactive, Pending)
- ✅ Filter by metro area
- ✅ Multiple filter parameters

### 4. Boundary Testing

- ✅ Minimum boundary values (limit=1, offset=0)
- ✅ Maximum boundary values (limit=1000, offset=999999)
- ✅ Empty parameters

### 5. Error Handling

- ✅ Invalid parameters (400 Bad Request)
- ✅ Invalid Accept header
- ✅ Non-existent endpoint (404 Not Found)

### 6. Performance Testing

- ✅ Response time < 500ms threshold
- ✅ Concurrent request handling (10 simultaneous)
- ✅ Average response time validation

### 7. Dynamic Data Testing

- ✅ Randomly generated query parameters
- ✅ Unique test data on each run

## 🔧 Usage Examples

### Using the LocationsAPI Class

```typescript
import { test } from "@playwright/test";
import { LocationsAPI } from "../../modules/locations/locations.api";

test("example usage", async ({ request }) => {
  const baseURL = test.info().project.use.baseURL;
  const locationsAPI = new LocationsAPI(request, baseURL);

  // Get locations with filters
  const response = await locationsAPI.getLocations({
    locationStatuses: "Active",
    metro: "Singapore",
    limit: 10,
  });

  // With authentication
  const authResponse = await locationsAPI.getLocations(
    { locationStatuses: "Active" },
    "your-bearer-token-here",
  );
});
```

### Using the PayloadBuilder

```typescript
import { PayloadBuilder } from "../../modules/data/payload-builder";

// Generate valid parameters
const params = PayloadBuilder.generateValidLocationParams();

// Generate random parameters
const randomParams = PayloadBuilder.generateLocationQueryParams();

// Generate boundary test data
const minParams = PayloadBuilder.generateMinBoundaryParams();
const maxParams = PayloadBuilder.generateMaxBoundaryParams();

// Generate authentication tokens
const validToken = PayloadBuilder.generateValidToken();
const invalidToken = PayloadBuilder.generateInvalidToken();
```

### Using WireMock Pattern

```typescript
import { test, expect } from "@playwright/test";
import { LocationsMockServer } from "../../fixtures/mocks/locations.wiremock";

test("mocked test example", async ({ page }) => {
  // Stub successful response
  await LocationsMockServer.stubGetLocationsSuccess(page);

  // Make request
  const response = await page.request.get("/v2/locations");
  expect(response.status()).toBe(200);

  // Stub error response
  await LocationsMockServer.stubGetLocationsUnauthorized(page);
  const errorResponse = await page.request.get("/v2/locations");
  expect(errorResponse.status()).toBe(401);
});
```

### Using APIClient Utility

```typescript
import { APIClient } from "../../utils/api-client";

test("API client example", async ({ request }) => {
  const apiClient = new APIClient(request, process.env.BASE_URL);

  // Make GET request with auth
  const response = await apiClient.get("/v2/locations", {
    params: { locationStatuses: "Active" },
    authToken: "bearer-token-here",
  });

  // Measure response time
  const { response, duration } = await APIClient.getResponseTime(async () => {
    return await apiClient.get("/v2/locations");
  });

  console.log(`Response time: ${duration}ms`);
});
```

## 🔍 Schema Validation

The test suite uses AJV to validate API responses against a JSON schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["message"],
  "properties": {
    "message": { "type": "string" },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "metro": { "type": "string" },
          "status": {
            "type": "string",
            "enum": ["Active", "Inactive", "Pending"]
          }
        }
      }
    }
  }
}
```

## 🎯 Test Tags

Tests are organized with tags for easy filtering:

| Tag            | Description                        |
| -------------- | ---------------------------------- |
| `@ci`          | Tests suitable for CI/CD pipeline  |
| `@api`         | API-specific tests                 |
| `@auth`        | Authentication/authorization tests |
| `@schema`      | Schema validation tests            |
| `@performance` | Performance and load tests         |
| `@negative`    | Negative/error scenario tests      |
| `@boundary`    | Boundary value tests               |
| `@functional`  | Functional behavior tests          |
| `@smoke`       | Critical smoke tests               |

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
BASE_URL=https://your-api-base-url.com
BEARER_TOKEN=your-valid-bearer-token
```

### Playwright Configuration

Configure in `playwright.config.ts`:

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
});
```

## 📊 Performance Thresholds

Configured in `utils/constants.ts`:

```typescript
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 500, // Standard response time
  FAST_API_RESPONSE: 200, // Fast response benchmark
  SLOW_API_RESPONSE: 1000, // Acceptable slow response
};
```

## 🧩 Extension Points

### Adding New Test Cases

1. **Add test to existing describe block**:

```typescript
test.describe("Your Category", () => {
  test("your test case", { tag: ["@api"] }, async ({ request }) => {
    // Your test logic
  });
});
```

2. **Use existing utilities**:

```typescript
import { PayloadBuilder } from "../../modules/data/payload-builder";
import { APIClient } from "../../utils/api-client";
import { HTTP_STATUS } from "../../utils/constants";
```

3. **Add custom mock responses**:

```typescript
await LocationsMockServer.stubGetLocationsSuccess(page, {
  message: "Custom response",
  data: [
    /* your custom data */
  ],
});
```

## 🐛 Debugging

### View Test Output

```bash
npx playwright test --debug
```

### Headed Mode

```bash
npx playwright test --headed
```

### Trace Viewer

```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## 📈 Best Practices

1. **Use describe blocks** to organize related tests
2. **Tag tests appropriately** for selective execution
3. **Generate dynamic test data** using PayloadBuilder
4. **Validate schemas** for all successful responses
5. **Assert response times** for performance-critical endpoints
6. **Use WireMock pattern** for testing error scenarios
7. **Keep tests isolated** - each test should be independent
8. **Use constants** instead of magic strings/numbers

## 🤝 Contributing

When adding new test cases:

1. Follow the existing modular structure
2. Add appropriate type definitions
3. Use PayloadBuilder for test data
4. Include schema validation where applicable
5. Tag tests appropriately
6. Update this README with new features

## 📄 License

[Your License Here]

## 📞 Support

For issues or questions, please contact [your team/contact info].
