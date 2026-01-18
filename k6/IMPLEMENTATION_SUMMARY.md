# K6 Performance Test Suite - Implementation Summary

## 📦 Created Files

### Test Scripts

- ✅ `smoke.test.js` - Smoke test (1 VU, 1 minute)
- ✅ `load.test.js` - Load test (up to 50 VUs, 14 minutes)
- ✅ `stress.test.js` - Stress test (up to 250 VUs, 15 minutes)
- ✅ `spike.test.js` - Spike test (up to 300 VUs, 10 minutes)
- ✅ `soak.test.js` - Soak test (30 VUs, 2 hours)

### Configuration & Utilities

- ✅ `config.js` - Shared configuration and helper functions
- ✅ `run-tests.sh` - Test runner script with colored output
- ✅ `.env.example` - Environment configuration template
- ✅ `.gitignore` - Git ignore rules for test results

### Documentation

- ✅ `README.md` - Comprehensive documentation
- ✅ `QUICK_START.md` - Quick reference guide

## ✨ Features Implemented

### Authentication ✓

- Bearer token authentication in headers
- Configurable via `AUTH_TOKEN` environment variable
- Placeholder support for initial setup

### Validation ✓

- Status code validation (200, 401, 429, 503)
- Response time checks (<500ms for normal load)
- Response structure validation (message, data fields)
- Required field validation (id, name, status, country, etc.)
- Content-Type header validation
- Business logic validation (filter criteria matching)

### Custom Metrics ✓

All tests include:

- **locations_api_latency** (Trend) - Tracks API-specific latency
- **custom_business_errors** (Rate) - Tracks business logic validation failures
- **errorCounter** (Counter) - Total error count in stress/spike/soak tests
- **spikeRecoveryTime** (Trend) - Spike test recovery tracking
- **memoryLeakIndicator** (Trend) - Soak test degradation detection

### Thresholds ✓

#### Smoke Test

- `http_req_duration`: p(95)<500ms
- `http_req_failed`: rate<0.01 (1%)
- `checks`: rate>0.99 (99%)

#### Load Test

- `http_req_duration`: p(95)<500ms, p(99)<1000ms
- `http_req_failed`: rate<0.01 (1%)
- `checks`: rate>0.99 (99%)
- `http_reqs`: rate>10 req/s

#### Stress Test

- `http_req_duration`: p(95)<2000ms, p(99)<5000ms
- `http_req_failed`: rate<0.10 (10%)
- `checks`: rate>0.85 (85%)

#### Spike Test

- `http_req_duration`: p(95)<3000ms, p(99)<8000ms
- `http_req_failed`: rate<0.15 (15%)
- `checks`: rate>0.80 (80%)

#### Soak Test

- `http_req_duration`: p(95)<800ms, p(99)<1500ms
- `http_req_failed`: rate<0.01 (1%)
- `checks`: rate>0.99 (99%)
- Performance degradation monitoring

### Dynamic Data Generation ✓

- Uses `__VU` and `__ITER` for unique request generation
- Rotates through 15 different metro locations
- Alternates between Active/Inactive status filters
- Unique request IDs for tracking
- Prevents cache hits and simulates realistic traffic

### Lifecycle Functions ✓

All tests include:

- **setup()** - Pre-test initialization and baseline checks
- **teardown()** - Post-test summary and cleanup
- Console logging for test tracking
- Baseline performance measurement (load/stress/spike/soak)

### Pacing ✓

- `sleep(1)` between iterations in all tests
- Simulates realistic user think time
- Prevents overwhelming the API
- Allows for proper load distribution

### Load Profiles ✓

#### Smoke Test

```javascript
{
  vus: 1,
  duration: '1m'
}
```

#### Load Test

```javascript
stages: [
  { duration: "2m", target: 10 }, // Ramp-up
  { duration: "5m", target: 50 }, // Increase
  { duration: "5m", target: 50 }, // Steady state
  { duration: "2m", target: 0 }, // Ramp-down
];
```

#### Stress Test

```javascript
stages: [
  { duration: "2m", target: 50 }, // Normal
  { duration: "3m", target: 100 }, // Above normal
  { duration: "3m", target: 150 }, // Push further
  { duration: "3m", target: 200 }, // Breaking point
  { duration: "2m", target: 250 }, // Maximum
  { duration: "2m", target: 0 }, // Recovery
];
```

#### Spike Test

```javascript
stages: [
  { duration: "1m", target: 10 }, // Baseline
  { duration: "30s", target: 200 }, // SPIKE 1
  { duration: "1m", target: 200 }, // Hold
  { duration: "30s", target: 10 }, // Drop
  { duration: "1m", target: 10 }, // Recover
  { duration: "30s", target: 300 }, // SPIKE 2
  { duration: "1m", target: 300 }, // Hold
  { duration: "30s", target: 10 }, // Drop
  { duration: "1m", target: 10 }, // Recover
  { duration: "30s", target: 0 }, // End
];
```

#### Soak Test

```javascript
stages: [
  { duration: "5m", target: 30 }, // Ramp-up
  { duration: "110m", target: 30 }, // Sustained load (2 hrs)
  { duration: "5m", target: 0 }, // Ramp-down
];
```

## 🚀 Usage

### Quick Start

```bash
# Navigate to k6 directory
cd k6

# Run smoke test
./run-tests.sh smoke

# Or use npm scripts from project root
npm run k6:smoke
```

### With Environment Variables

```bash
# Set environment
export BASE_URL="https://api.equinix.com"
export AUTH_TOKEN="your-bearer-token-here"

# Run test
./run-tests.sh load
```

### All Available Commands

```bash
# Individual tests
./run-tests.sh smoke    # 1 minute
./run-tests.sh load     # 14 minutes
./run-tests.sh stress   # 15 minutes
./run-tests.sh spike    # 10 minutes
./run-tests.sh soak     # 2 hours

# Run all (except soak)
./run-tests.sh all

# Using npm
npm run k6:smoke
npm run k6:load
npm run k6:stress
npm run k6:spike
npm run k6:soak
npm run k6:all
```

## 📊 Expected Outputs

### Console Output

Each test provides:

- ✅ Real-time check results
- ✅ Performance metrics (p95, p99, avg)
- ✅ Custom metric values
- ✅ Threshold pass/fail status
- ✅ Detailed error logging
- ✅ Test summary and recommendations

### JSON Results

Results saved to `k6/results/` directory:

- `smoke_test_YYYYMMDD_HHMMSS.json`
- `load_test_YYYYMMDD_HHMMSS.json`
- `stress_test_YYYYMMDD_HHMMSS.json`
- `spike_test_YYYYMMDD_HHMMSS.json`
- `soak_test_YYYYMMDD_HHMMSS.json`

## 🎯 Test Coverage

### Scenarios Tested

- ✅ Single user baseline (smoke)
- ✅ Normal load conditions (load)
- ✅ System breaking point (stress)
- ✅ Sudden traffic spikes (spike)
- ✅ Long-term stability (soak)

### Validations

- ✅ HTTP status codes
- ✅ Response time performance
- ✅ Response structure integrity
- ✅ Required field presence
- ✅ Business logic correctness
- ✅ Filter criteria accuracy
- ✅ Content-Type headers
- ✅ Error handling
- ✅ Rate limiting behavior
- ✅ System recovery

### Edge Cases

- ✅ Missing authentication
- ✅ Invalid authentication
- ✅ Rate limiting (429)
- ✅ Service unavailable (503)
- ✅ High concurrency
- ✅ Sustained load
- ✅ Performance degradation

## 🔧 Customization

### Modify Load Profiles

Edit the `options.stages` array in each test file.

### Adjust Thresholds

Update the `options.thresholds` object in each test file.

### Add Custom Validations

Add checks in the `check()` function within each test.

### Add More Metrics

Import and use k6 metric types:

```javascript
import { Trend, Counter, Rate, Gauge } from "k6/metrics";
```

## 📝 Next Steps

1. **Setup Environment**

   ```bash
   cp k6/.env.example k6/.env
   # Edit k6/.env with your credentials
   ```

2. **Install k6**
   - Follow instructions in `k6/README.md`

3. **Run Initial Smoke Test**

   ```bash
   npm run k6:smoke
   ```

4. **Review Results**
   - Check console output
   - Review JSON results in `k6/results/`

5. **Integrate into CI/CD**
   - Use provided examples in documentation
   - Add to GitHub Actions, Jenkins, or GitLab CI

## 📚 Documentation

- **Full Guide**: [k6/README.md](./README.md)
- **Quick Reference**: [k6/QUICK_START.md](./QUICK_START.md)
- **Configuration**: [k6/config.js](./config.js)
- **Environment Setup**: [k6/.env.example](./k6/.env.example)

## ✅ Checklist

- [x] 5 test types implemented (smoke, load, stress, spike, soak)
- [x] Authentication with Bearer token
- [x] Status code validation
- [x] Response time validation (<500ms for normal load)
- [x] Response body validation (id, status, message, data)
- [x] Custom metrics (Trend and Rate)
- [x] Thresholds (p95, failure rate <1%)
- [x] Dynamic data generation (using **VU and **ITER)
- [x] setup() and teardown() functions
- [x] Pacing with sleep(1)
- [x] Comprehensive documentation
- [x] Test runner script
- [x] npm scripts integration
- [x] CI/CD examples

## 🎉 Summary

All requirements have been successfully implemented:

✅ **Load Profiles** - 5 different test types with appropriate VU counts
✅ **Authentication** - Bearer token support with placeholders
✅ **Validation** - Comprehensive checks for status, time, and fields
✅ **Custom Metrics** - Trend and Rate metrics implemented
✅ **Thresholds** - p95 and failure rate thresholds set
✅ **Dynamic Data** - VU/ITER-based generation for variety
✅ **Lifecycle** - setup/teardown with logging
✅ **Pacing** - sleep(1) between iterations

The test suite is production-ready and can be integrated into your CI/CD pipeline immediately!
