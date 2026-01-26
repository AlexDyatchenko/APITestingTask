# Fluent API Design - Complete Guide

## Overview

The API class now supports a fully fluent builder pattern, eliminating the need for `.then()` chains and making tests more readable and maintainable.

## Key Changes

### 1. **Endpoint Declaration**
Declare endpoint once in the test suite:
```typescript
const endpoint = API_ENDPOINTS.LOCATIONS;
```

### 2. **Fluent Builder Methods**
- `path(endpoint)` - Set the API endpoint
- `params(queryParams)` - Set query parameters
- `body(data)` - Set request body
- `headers(headers)` - Set custom headers
- `setToken(token)` - Set auth token
- `setCheckStatus(boolean)` - Enable/disable auto-checks
- `expectErrorMatching(regex)` - Set error pattern matching

### 3. **HTTP Methods**
All return `Promise<T>` with body directly:
- `get<T>(expectedStatus?)` - Execute GET request
- `post<T>(expectedStatus?)` - Execute POST request
- `put<T>(expectedStatus?)` - Execute PUT request
- `delete<T>(expectedStatus?)` - Execute DELETE request
- `patch<T>(expectedStatus?)` - Execute PATCH request

## Usage Examples

### ✅ New Fluent Pattern (Recommended)

#### Basic GET Request
```typescript
const body = await api
    .path(endpoint)
    .params({ metro: "Singapore" })
    .get();
```

#### POST Request with Body
```typescript
const response = await api
    .path('/users/login')
    .body({
        user: {
            email: config.userEmail,
            password: config.userPassword
        }
    })
    .post(200);

console.log(response.user.token);
```

#### With Multiple Params
```typescript
const body = await api
    .path(endpoint)
    .params({
        locationStatus: LOCATION_STATUSES.ACTIVE,
        metro: "Singapore",
    })
    .get();
```

#### With Custom Headers
```typescript
const body = await api
    .path(endpoint)
    .headers({ "Accept": "*/*" })
    .params({ metro: "Singapore" })
    .get();
```

#### With Authentication
```typescript
const body = await api
    .setToken(authToken)
    .path(endpoint)
    .params({ status: "Active" })
    .get();
```

#### With Error Pattern Matching
```typescript
const body = await api
    .setToken(invalidToken)
    .expectErrorMatching(/unauthorized|invalid|token/i)
    .path(endpoint)
    .get(401);
```

### ❌ Old Pattern (Deprecated)

```typescript
// OLD: Using .then()
const body = await api
    .getRequest(API_ENDPOINTS.LOCATIONS, {
        locationStatus: LOCATION_STATUSES.ACTIVE,
        metro: "Singapore",
    })
    .then(() => api.getBody());
```

```typescript
// OLD: Multiple variables
const params = {
    locationStatus: LOCATION_STATUSES.ACTIVE,
    metro: "Singapore",
};
await api.getRequest(API_ENDPOINTS.LOCATIONS, params);
const body = await api.getBody();
expect(api.isOk()).toBeTruthy();
```

## Complete Test Examples

### Example 1: Schema Validation
```typescript
test("should validate response against JSON schema", async () => {
    const body = await api
        .path(endpoint)
        .params({
            locationStatus: LOCATION_STATUSES.ACTIVE,
            metro: "Singapore",
        })
        .get();

    const isValid = validateSchema(body);
    expect(isValid).toBeTruthy();
});
```

### Example 2: Filter by Metro
```typescript
test("should filter locations by metro", async () => {
    const body = await api
        .path(endpoint)
        .params({ metro: "Singapore" })
        .get();

    expect(body).toHaveProperty("data");
    body.data.forEach((location: any) => {
        expect(location.metro).toBe("Singapore");
    });
});
```

### Example 3: Authentication Test
```typescript
test("should return 401 with invalid token", async () => {
    const body = await api
        .setToken(PayloadBuilder.generateInvalidToken())
        .path(endpoint)
        .get(401);

    // Auto-assertion for error pattern if set
});
```

### Example 4: POST Request
```typescript
test("should create new resource", async () => {
    const response = await api
        .path("/api/resources")
        .body({
            name: "Test Resource",
            status: "active"
        })
        .post(201);

    expect(response.id).toBeDefined();
});
```

## beforeAll Setup Example

```typescript
test.describe("/v2/locations API Tests", () => {
    let api: Api;
    const endpoint = API_ENDPOINTS.LOCATIONS;
    let authToken: string;

    test.beforeAll("Get Token", async ({ request }) => {
        const baseURL = test.info().project.use.baseURL || "";
        const tempApi = new Api(request, baseURL);

        const tokenResponse = await tempApi
            .path('/users/login')
            .body({
                user: {
                    email: config.userEmail,
                    password: config.userPassword
                }
            })
            .post(200);

        authToken = 'Token ' + tokenResponse.user.token;
        console.log(tokenResponse.user);
    });

    test.beforeEach(async ({ request }) => {
        const baseURL = test.info().project.use.baseURL || "";
        api = new Api(request, baseURL);
    });

    test("should get locations with auth", async () => {
        const body = await api
            .setToken(authToken)
            .path(endpoint)
            .params({ status: "Active" })
            .get();

        expect(body.data).toBeDefined();
    });
});
```

## Comparison: Old vs New

### Before (Old Pattern)
```typescript
test("should filter locations", async () => {
    const params = {
        locationStatus: LOCATION_STATUSES.ACTIVE,
        metro: "Singapore",
    };

    await api.getRequest(API_ENDPOINTS.LOCATIONS, params);

    expect(api.isOk()).toBeTruthy();

    const body = await api.getBody();

    expect(body).toHaveProperty("data");
});
```

**Lines of code: 11**
**Readability: Medium**
**Uses `.then()`: No (but requires manual getBody)**

### After (New Pattern)
```typescript
test("should filter locations", async () => {
    const body = await api
        .path(endpoint)
        .params({
            locationStatus: LOCATION_STATUSES.ACTIVE,
            metro: "Singapore",
        })
        .get();

    expect(body).toHaveProperty("data");
});
```

**Lines of code: 9**
**Readability: High**
**Uses `.then()`: No**
**Auto-assertions: Yes**

## Benefits

✅ **No `.then()` chains** - Cleaner async/await syntax
✅ **Direct body access** - `.get()` returns body automatically
✅ **Automatic assertions** - Built-in status and error checking
✅ **Method chaining** - Fluent builder pattern
✅ **Type safety** - Full TypeScript support with generics
✅ **Endpoint reuse** - Declare once, use everywhere
✅ **Less boilerplate** - ~30% reduction in test code
✅ **Better readability** - Intent is clearer

## Migration Checklist

- [ ] Declare `endpoint` constant in test suite
- [ ] Replace `getRequest()` with `.path().params().get()`
- [ ] Replace `postRequest()` with `.path().body().post()`
- [ ] Remove `.then(() => api.getBody())` patterns
- [ ] Remove intermediate variable declarations
- [ ] Remove manual `expect(api.isOk())` calls
- [ ] Use `expectErrorMatching()` for error validation
- [ ] Test all changes

## Backward Compatibility

The old methods are still available:
- `getRequest(endpoint, params, headers, expectedStatus)`
- `postRequest(endpoint, data, headers, expectedStatus)`
- `getBody()`
- `getResponse()`

But **new tests should use the fluent pattern**.
