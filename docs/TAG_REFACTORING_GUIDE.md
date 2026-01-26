# Tag Refactoring Guide

## Objective
Move common tags from individual tests to `test.describe` blocks to reduce duplication and improve maintainability.

## Tag Hierarchy

### Root Level Tags (Apply to ALL tests)
```typescript
test.describe("/v2/locations API Tests", {
    tag: ["@ci", "@api"],
}, () => {
    // All tests inherit: @ci, @api
});
```

### Test Suite Level Tags
Each `test.describe` block adds its own category tags:

```typescript
// Authentication tests
test.describe("Authentication Scenarios", {
    tag: ["@auth"],
}, () => {
    // Tests inherit: @ci, @api, @auth
});

// Validation tests
test.describe("Validation & Schema", {
    tag: ["@schema"],
}, () => {
    // Tests inherit: @ci, @api, @schema
});

// Functional tests
test.describe("Functional Test Cases - Success Path", {
    tag: ["@functional"],
}, () => {
    // Tests inherit: @ci, @api, @functional
});

// Equivalence Partitioning tests
test.describe("Equivalence Partitioning - locationStatus", {
    tag: ["@istqb", "@equivalence"],
}, () => {
    // Tests inherit: @ci, @api, @istqb, @equivalence
});

// Boundary tests
test.describe("Boundary Testing", {
    tag: ["@boundary"],
}, () => {
    // Tests inherit: @ci, @api, @boundary
});

// Error handling tests
test.describe("Error Handling", {
    tag: ["@negative"],
}, () => {
    // Tests inherit: @ci, @api, @negative
});

// Performance tests
test.describe("Performance Testing", {
    tag: ["@performance"],
}, () => {
    // Tests inherit: @ci, @api, @performance
});
```

### Individual Test Tags (Only Unique Tags)
Only add tags that are specific to that test:

```typescript
// ❌ Before (Redundant tags)
test("should validate response against JSON schema", {
    tag: ["@ci", "@api", "@schema"],  // @ci and @api are inherited!
}, async () => {
    // ...
});

// ✅ After (Only unique tag or no config if all inherited)
test("should validate response against JSON schema", async () => {
    // Inherits: @ci, @api, @schema from test.describe
});

// Example with unique tag
test("should successfully retrieve locations", {
    tag: ["@smoke"],  // Only smoke is unique
}, async () => {
    // Inherits: @ci, @api, @functional + adds @smoke
});
```

## Complete Refactoring Pattern

###BEFORE:
```typescript
test.describe("/v2/locations API Tests", {
    tag: ["@ci", "@api", "@auth"],
}, () => {

    test.describe("Authentication Scenarios", () => {
        test("should return 200 with valid token", {
            tag: ["@ci", "@api", "@auth"],  // ❌ Redundant
        }, async () => {
            // ...
        });

        test("should return 401 with missing token", {
            tag: ["@ci", "@api", "@auth", "@negative"],  // ❌ Redundant
        }, async () => {
            // ...
        });
    });

    test.describe("Validation & Schema", () => {
        test("should validate JSON schema", {
            tag: ["@ci", "@api", "@schema"],  // ❌ Redundant
        }, async () => {
            // ...
        });
    });
});
```

### AFTER:
```typescript
test.describe("/v2/locations API Tests", {
    tag: ["@ci", "@api"],  // ✅ Common to ALL tests
}, () => {

    test.describe("Authentication Scenarios", {
        tag: ["@auth"],  // ✅ All auth tests get this
    }, () => {
        test("should return 200 with valid token", async () => {
            // ✅ Inherits: @ci, @api, @auth
        });

        test("should return 401 with missing token", {
            tag: ["@negative"],  // ✅ Only unique tag
        }, async () => {
            // Inherits: @ci, @api, @auth + adds @negative
        });
    });

    test.describe("Validation & Schema", {
        tag: ["@schema"],  // ✅ All schema tests get this
    }, () => {
        test("should validate JSON schema", async () => {
            // ✅ Inherits: @ci, @api, @schema
        });
    });
});
```

## Tag Inheritance Rules

Tags are cumulative through the hierarchy:

```typescript
Root Level: ["@ci", "@api"]
    └─ Suite Level: ["@auth"]
        └─ Test Level: ["@negative"]
           = Final tags: ["@ci", "@api", "@auth", "@negative"]
```

## Complete File Structure

```typescript
test.describe("/v2/locations API Tests", {
    tag: ["@ci", "@api"],
}, () => {
    const endpoint = API_ENDPOINTS.LOCATIONS;

    // AUTH TESTS
    test.describe("Authentication Scenarios", {
        tag: ["@auth"],
    }, () => {
        test("should return 200 with valid token", async () => {});
        test("should return 401 with missing token", {
            tag: ["@negative"],
        }, async () => {});
        test("should return 401 with invalid token", {
            tag: ["@negative"],
        }, async () => {});
    });

    // SCHEMA/VALIDATION TESTS
    test.describe("Validation & Schema", {
        tag: ["@schema"],
    }, () => {
        test("should validate JSON schema", async () => {});
        test("should have correct Content-Type", {
            tag: ["@headers"],
        }, async () => {});
        test("should validate status codes", async () => {});
    });

    // FUNCTIONAL TESTS
    test.describe("Functional Test Cases - Success Path", {
        tag: ["@functional"],
    }, () => {
        test("should retrieve locations", {
            tag: ["@smoke"],
        }, async () => {});
        test("should filter by status", async () => {});
        test("should filter by metro", async () => {});
        test("should filter by marketEnabled", {
            tag: ["@istqb"],
        }, async () => {});
    });

    // EQUIVALENCE PARTITIONING TESTS
    test.describe("Equivalence Partitioning - locationStatus", {
        tag: ["@istqb", "@equivalence"],
    }, () => {
        validStatuses.forEach((status) => {
            test(`should accept valid locationStatus: ${status}`, async () => {});
        });
        test("should handle invalid locationStatus", {
            tag: ["@negative"],
        }, async () => {});
    });

    // BOUNDARY TESTS
    test.describe("Boundary Testing", {
        tag: ["@boundary"],
    }, () => {
        test("should handle minimum boundary", async () => {});
        test("should handle maximum boundary", async () => {});
        test("should handle empty parameters", async () => {});
    });

    // ERROR HANDLING TESTS
    test.describe("Error Handling", {
        tag: ["@negative"],
    }, () => {
        test("should return 400 for invalid parameters", async () => {});
        test("should handle invalid Accept header", async () => {});
        test("should return error for non-existent endpoint", async () => {});
    });

    // PERFORMANCE TESTS
    test.describe("Performance Testing", {
        tag: ["@performance"],
    }, () => {
        test("should respond within threshold", async () => {});
        test("should handle concurrent requests", {
            tag: ["@load"],
        }, async () => {});
    });

    // DYNAMIC/LEGACY TESTS
    test.describe("Dynamic Data Testing", {
        tag: ["@dynamic"],
    }, () => {
        test("should handle dynamic parameters", async () => {});
        test("should generate unique test data", async () => {});
    });

    test("Original: /v2/locations basic test", {
        tag: ["@legacy"],
    }, async () => {});
});
```

## Benefits

✅ **Reduced duplication**: No need to repeat `@ci, @api` on every test
✅ **Easier maintenance**: Change tags in one place
✅ **Clearer structure**: Tag hierarchy matches test organization
✅ **Selective test running**: Run all tests by category
✅ **Better readability**: Only unique tags visible on tests

## Running Tests by Tags

```bash
# Run all API tests
npx playwright test --grep "@api"

# Run only auth tests
npx playwright test --grep "@auth"

# Run auth negative tests
npx playwright test --grep "@auth.*@negative"

# Run functional tests (excluding istqb)
npx playwright test --grep "@functional" --grep-invert "@istqb"

# Run smoke tests only
npx playwright test --grep "@smoke"

# Run all boundary and equivalence tests
npx playwright test --grep "@boundary|@equivalence"
```

## Migration Checklist

For each `test.describe`:
- [ ] Identify common tags shared by ALL tests in that block
- [ ] Add those tags to the `test.describe` config
- [ ] Remove those tags from individual tests
- [ ] Keep only unique tags on individual tests
- [ ] Remove tag config entirely if test has no unique tags
- [ ] Verify tag inheritance works correctly

## Common Tag Categories

| Tag | Purpose |
|-----|---------|
| `@ci` | Tests that run in CI pipeline |
| `@api` | API tests (vs UI tests) |
| `@auth` | Authentication/authorization tests |
| `@schema` | Schema validation tests |
| `@headers` | HTTP header tests |
| `@functional` | Functional/feature tests |
| `@istqb` | ISTQB standard coverage tests |
| `@equivalence` | Equivalence partitioning tests |
| `@boundary` | Boundary value analysis tests |
| `@negative` | Negative/error case tests |
| `@performance` | Performance tests |
| `@load` | Load/stress tests |
| `@smoke` | Smoke tests (critical path) |
| `@dynamic` | Tests with dynamic data |
| `@legacy` | Legacy/backward compatibility tests |
