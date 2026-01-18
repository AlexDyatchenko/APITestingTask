# Quick Reference Guide - /v2/locations API Test Suite

## 🗂️ Created Files

### Core Test Suite

- **tests/api/v2.locations.spec.ts** - Main test file with 21 comprehensive tests organized in describe blocks

### Modules

- **modules/locations/locations.api.ts** - Class-based API wrapper with methods for all endpoint interactions
- **modules/locations/locations.types.ts** - TypeScript type definitions for requests/responses
- **modules/data/payload-builder.ts** - Dynamic test data generator using Faker.js

### Utilities

- **utils/api-client.ts** - Reusable API client with common HTTP methods and helper functions
- **utils/constants.ts** - Centralized constants (status codes, endpoints, thresholds)

### Fixtures & Mocks

- **fixtures/mocks/locations-schema.json** - JSON Schema for AJV validation
- **fixtures/mocks/locations.wiremock.ts** - WireMock pattern implementation for API mocking

### Documentation

- **README_LOCATIONS_API.md** - Comprehensive documentation with examples and usage

## 📊 Test Statistics

**Total Tests:** 21 comprehensive test cases

### Test Categories:

1. **Authentication Scenarios** (3 tests)
   - Valid Bearer token
   - Missing token
   - Invalid token

2. **Validation & Schema** (3 tests)
   - JSON Schema validation with AJV
   - Content-Type header validation
   - Status code validation

3. **Functional Tests - Success Path** (4 tests)
   - Retrieve locations with valid params
   - Filter by status
   - Filter by metro
   - Multiple filters

4. **Boundary Testing** (3 tests)
   - Minimum boundary values
   - Maximum boundary values
   - Empty parameters

5. **Error Handling** (3 tests)
   - Invalid parameters (400)
   - Invalid Accept header
   - Non-existent endpoint (404)

6. **Performance Testing** (2 tests)
   - Response time threshold
   - Concurrent requests

7. **Dynamic Data Testing** (2 tests)
   - Dynamically generated parameters
   - Unique test data generation

8. **Legacy** (1 test)
   - Original basic test maintained for compatibility

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run specific test groups
npx playwright test --grep "@auth"
npx playwright test --grep "@performance"
npx playwright test --grep "@schema"

# Run just the locations tests
npx playwright test tests/api/v2.locations.spec.ts

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## 🏷️ Available Test Tags

```bash
@ci              # CI/CD pipeline tests
@api             # API tests
@auth            # Authentication tests
@schema          # Schema validation
@performance     # Performance tests
@negative        # Negative scenarios
@boundary        # Boundary testing
@functional      # Functional tests
@smoke           # Critical smoke tests
@dynamic         # Dynamic data tests
@legacy          # Legacy tests
@load            # Load tests
```

## 💡 Code Examples

### Using LocationsAPI

```typescript
const locationsAPI = new LocationsAPI(request, baseURL);
const response = await locationsAPI.getLocations(
  {
    locationStatuses: "Active",
    metro: "Singapore",
  },
  "bearer-token",
);
```

### Using PayloadBuilder

```typescript
const params = PayloadBuilder.generateValidLocationParams();
const token = PayloadBuilder.generateValidToken();
```

### Using APIClient

```typescript
const apiClient = new APIClient(request, baseURL);
const response = await apiClient.get("/v2/locations", {
  params: { metro: "Singapore" },
  authToken: "bearer-token",
});
```

### Schema Validation

```typescript
const ajv = new Ajv();
addFormats(ajv);
const validateSchema = ajv.compile(locationsSchema);
const isValid = validateSchema(responseBody);
```

### WireMock Pattern

```typescript
await LocationsMockServer.stubGetLocationsSuccess(page);
await LocationsMockServer.stubGetLocationsUnauthorized(page);
```

## 📁 Complete File Structure

```
APITestingTask/
├── tests/
│   └── api/
│       └── v2.locations.spec.ts          ✅ 21 tests
├── modules/
│   ├── locations/
│   │   ├── locations.api.ts              ✅ API wrapper
│   │   └── locations.types.ts            ✅ Types
│   └── data/
│       └── payload-builder.ts            ✅ Test data generator
├── utils/
│   ├── api-client.ts                     ✅ API client
│   └── constants.ts                      ✅ Constants
├── fixtures/
│   └── mocks/
│       ├── locations-schema.json         ✅ JSON Schema
│       └── locations.wiremock.ts         ✅ WireMock mocks
├── README_LOCATIONS_API.md               ✅ Documentation
├── QUICK_REFERENCE.md                    ✅ This file
├── package.json                          ✅ Updated
└── playwright.config.ts                  ⚠️  Configure as needed
```

## ✅ Implementation Checklist

- ✅ Modular architecture with class-based API wrapper
- ✅ TypeScript type definitions
- ✅ Authentication scenarios (valid/invalid tokens)
- ✅ AJV JSON Schema validation
- ✅ Header validation (Content-Type)
- ✅ Status code assertions
- ✅ Success path tests
- ✅ Boundary testing (min/max values)
- ✅ Error handling (400, 401, 404)
- ✅ Performance testing (<500ms threshold)
- ✅ Concurrent request testing
- ✅ WireMock pattern for mocking
- ✅ Dynamic data generation with Faker.js
- ✅ Comprehensive documentation
- ✅ Test tags for filtering
- ✅ Organized with describe blocks

## 🔧 Configuration Required

1. **Set BASE_URL** in playwright.config.ts or .env
2. **Configure authentication** if API requires tokens
3. **Adjust performance thresholds** in utils/constants.ts if needed
4. **Update schema** in fixtures/mocks/locations-schema.json to match actual API

## 🎯 Next Steps

1. Configure your API base URL
2. Update authentication logic if needed
3. Run tests: `npx playwright test`
4. Review HTML report: `npx playwright show-report`
5. Add more test cases as needed
6. Integrate with CI/CD pipeline

## 📞 Support

For detailed documentation, see [README_LOCATIONS_API.md](README_LOCATIONS_API.md)
