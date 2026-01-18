# ISTQB Test Coverage Report

## /v2/locations API Test Suite

### Test Coverage Summary

This document outlines the test coverage for the `/v2/locations` endpoint following **ISTQB (International Software Testing Qualifications Board)** standards.

---

## API Specification

**Endpoint:** `/v2/locations`  
**Method:** GET  
**Description:** Returns a list of data centers where you can order Megaport, MCR, or MVE.

### Request Parameters

| Parameter        | Type         | Description                                                 | Values                                                 |
| ---------------- | ------------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| `locationStatus` | string/array | Filter by location status (can be added multiple times)     | Extended, Deployment, Active, New, Restricted, Expired |
| `metro`          | string       | Filter results to only include locations in the named metro | Any metro name                                         |
| `marketEnabled`  | boolean      | Return only locations in enabled markets                    | true/false (default: false)                            |
| `mveVendor`      | string       | Filter by MVE vendor name                                   | Aruba, Cisco, Fortinet, Versa, VMWare, Palo Alto       |

### Response Structure

- `id` - Unique identifier for the location
- `name`, `country`, `metro`, `city` - Location details
- `latitude`, `longitude` - Geographical coordinates
- `diversityZones` - Object with supported Port speeds for each zone
- `mve.sizes` - Array of available MVE sizes (empty = none available)
- `mve.details` - Array with MVE details (label, cpuCoreCount, ramGb, bandwidthMbps)

---

## ISTQB Test Design Techniques Applied

### 1. Equivalence Partitioning (EP)

**Definition:** Dividing input data into valid and invalid partitions where all elements are expected to behave similarly.

#### Test Coverage:

**locationStatus Parameter:**

- ✅ Valid Equivalence Classes: Each valid status tested individually
  - Active
  - Extended
  - Deployment
  - New
  - Restricted
  - Expired
- ✅ Invalid Equivalence Class: Invalid status value ("InvalidStatus123")

**mveVendor Parameter:**

- ✅ Valid Equivalence Classes: Each valid vendor tested
  - Aruba
  - Cisco
  - Fortinet
  - Versa
  - VMWare
  - Palo Alto
- ✅ Invalid Equivalence Class: Invalid vendor name ("InvalidVendor999")

**marketEnabled Parameter:**

- ✅ Valid Equivalence Classes:
  - true
  - false (default)
- ✅ Invalid Equivalence Class: Non-boolean value ("not_a_boolean")

**metro Parameter:**

- ✅ Valid Equivalence Class: Valid metro name ("Singapore")
- ✅ Implicit test for invalid metro (may return empty data)

---

### 2. Boundary Value Analysis (BVA)

**Definition:** Testing at the boundaries between partitions.

#### Test Coverage:

- ✅ **Minimum Boundary Values:**
  - marketEnabled: false (minimum/default value)
  - Single locationStatus value
  - Minimal valid parameters

- ✅ **Maximum Boundary Values:**
  - marketEnabled: true
  - Multiple locationStatus values (array)
  - Maximum string length for metro parameter
  - All parameters combined

- ✅ **Empty/Null Values:**
  - No parameters (empty query)
  - Invalid parameter types

---

### 3. Positive Testing

**Definition:** Testing with valid inputs to ensure the system works as expected.

#### Test Coverage:

- ✅ Successfully retrieve locations with valid parameters
- ✅ Filter locations by each valid status
- ✅ Filter locations by metro
- ✅ Filter by marketEnabled (true/false)
- ✅ Filter by each valid mveVendor
- ✅ Handle multiple filter parameters simultaneously
- ✅ Handle multiple locationStatus values
- ✅ Validate response structure (diversityZones)
- ✅ Validate MVE sizes and details
- ✅ Validate latitude/longitude fields
- ✅ Validate Content-Type header
- ✅ Validate status codes for success (200 OK)

---

### 4. Negative Testing

**Definition:** Testing with invalid inputs to ensure proper error handling.

#### Test Coverage:

- ✅ Return 401 Unauthorized with missing token
- ✅ Return 401 Unauthorized with invalid token
- ✅ Handle 400 Bad Request for invalid parameters
- ✅ Handle invalid Accept header gracefully
- ✅ Handle invalid locationStatus values
- ✅ Handle invalid mveVendor values
- ✅ Handle invalid marketEnabled values
- ✅ Return appropriate error for non-existent endpoint

---

### 5. Schema Validation

**Definition:** Ensuring the API response conforms to the expected JSON schema.

#### Test Coverage:

- ✅ Validate response against JSON schema using AJV
- ✅ Validate response structure (message, data, terms)
- ✅ Validate location object structure
- ✅ Validate address object structure
- ✅ Validate diversityZones structure
- ✅ Validate MVE sizes and details structure
- ✅ Validate data types (latitude/longitude as numbers)

---

### 6. State Transition Testing

**Definition:** Testing different states of the system.

#### Test Coverage:

- ✅ Authentication states:
  - Valid token
  - Invalid token
  - Missing token

---

### 7. Performance Testing

**Definition:** Ensuring the API meets performance requirements.

#### Test Coverage:

- ✅ Response time within acceptable threshold (< 500ms)
- ✅ Handle concurrent requests efficiently (10 concurrent)
- ✅ Average response time validation

---

### 8. Dynamic Testing

**Definition:** Testing with dynamically generated data.

#### Test Coverage:

- ✅ Handle dynamically generated query parameters
- ✅ Generate unique test data on each run
- ✅ Test with random valid parameters

---

## Test Organization

### Test Tags

Tests are organized with the following tags for easy filtering:

- `@ci` - Critical tests for CI/CD pipeline
- `@api` - All API tests
- `@smoke` - Smoke tests (basic functionality)
- `@functional` - Functional tests
- `@negative` - Negative test cases
- `@schema` - Schema validation tests
- `@boundary` - Boundary value tests
- `@performance` - Performance tests
- `@istqb` - Tests specifically designed for ISTQB coverage
- `@equivalence` - Equivalence partitioning tests
- `@auth` - Authentication tests
- `@headers` - Header validation tests
- `@dynamic` - Dynamic data tests

---

## Minimal ISTQB Coverage Achieved

### ✅ Checklist

- [x] **Equivalence Partitioning** - All valid and invalid partitions tested
- [x] **Boundary Value Analysis** - Min, max, and edge cases covered
- [x] **Positive Testing** - All happy paths validated
- [x] **Negative Testing** - Error scenarios and invalid inputs tested
- [x] **State Transition Testing** - Different system states verified
- [x] **Decision Table Testing** - Multiple parameter combinations tested
- [x] **Schema Validation** - Response structure verified
- [x] **Performance Testing** - Response time and load tested

---

## Test Metrics

### Coverage by Category

| Category                                  | Test Count | Status      |
| ----------------------------------------- | ---------- | ----------- |
| Authentication                            | 3          | ✅ Complete |
| Schema Validation                         | 3          | ✅ Complete |
| Functional - Success Path                 | 14         | ✅ Complete |
| Equivalence Partitioning - locationStatus | 7          | ✅ Complete |
| Equivalence Partitioning - mveVendor      | 7          | ✅ Complete |
| Equivalence Partitioning - marketEnabled  | 3          | ✅ Complete |
| Boundary Testing                          | 3          | ✅ Complete |
| Error Handling                            | 4          | ✅ Complete |
| Performance Testing                       | 2          | ✅ Complete |
| Dynamic Data Testing                      | 2          | ✅ Complete |

**Total Tests:** 48+

---

## API Parameter Testing Matrix

| Parameter      | Valid Values Tested | Invalid Values Tested | Boundary Tests       |
| -------------- | ------------------- | --------------------- | -------------------- |
| locationStatus | ✅ All 6 values     | ✅ Invalid string     | ✅ Single & Multiple |
| metro          | ✅ Singapore        | ✅ Implicit           | ✅ Long string       |
| marketEnabled  | ✅ true, false      | ✅ Non-boolean        | ✅ Both boundaries   |
| mveVendor      | ✅ All 6 vendors    | ✅ Invalid vendor     | ✅ N/A               |

---

## Response Field Validation

| Field          | Validated | Notes                                                        |
| -------------- | --------- | ------------------------------------------------------------ |
| id             | ✅        | Presence check                                               |
| name           | ✅        | Presence check                                               |
| country        | ✅        | Presence check                                               |
| metro          | ✅        | Presence & filter check                                      |
| city           | ✅        | Presence check                                               |
| status         | ✅        | Presence & value check                                       |
| latitude       | ✅        | Type & range (-90 to 90)                                     |
| longitude      | ✅        | Type & range (-180 to 180)                                   |
| address        | ✅        | Object structure                                             |
| diversityZones | ✅        | Array & structure                                            |
| mve.sizes      | ✅        | Array presence                                               |
| mve.details    | ✅        | Object structure (label, cpuCoreCount, ramGb, bandwidthMbps) |
| products       | ✅        | Array presence                                               |

---

## Recommendations

### Additional Testing (Optional)

1. **Load Testing** - Test with K6 for high volume scenarios (already available in k6/ directory)
2. **Security Testing** - SQL injection, XSS attempts in parameters
3. **Localization Testing** - Metro names in different languages/character sets
4. **Data Integrity** - Verify returned data matches expected database values

### CI/CD Integration

Run critical tests with:

```bash
npx playwright test --grep "@ci"
```

Run ISTQB-specific tests with:

```bash
npx playwright test --grep "@istqb"
```

---

## Conclusion

The test suite provides **comprehensive minimal coverage** according to ISTQB standards, covering:

- All specified query parameters
- All valid status and vendor values
- Boundary conditions
- Error scenarios
- Response structure validation
- Performance requirements

The tests are well-organized, maintainable, and provide confidence in the `/v2/locations` API functionality.
