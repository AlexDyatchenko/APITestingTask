# K6 Performance Tests - /v2/locations API

This directory contains comprehensive k6 performance test scripts for the `/v2/locations` API endpoint.

## 📋 Test Suite Overview

| Test Type  | Duration   | Max VUs | Purpose                                            |
| ---------- | ---------- | ------- | -------------------------------------------------- |
| **Smoke**  | 1 minute   | 1       | Verify basic functionality with minimal load       |
| **Load**   | 14 minutes | 50      | Test performance under expected normal load        |
| **Stress** | 15 minutes | 250     | Find breaking point beyond normal capacity         |
| **Spike**  | 10 minutes | 300     | Test sudden extreme load spikes                    |
| **Soak**   | 2 hours    | 30      | Detect memory leaks and long-term stability issues |

## 🚀 Quick Start

### Prerequisites

1. Install k6:

   ```bash
   # macOS (using Homebrew)
   brew install k6

   # Linux (Debian/Ubuntu)
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6

   # Windows (using Chocolatey)
   choco install k6

   # Docker
   docker pull grafana/k6:latest
   ```

2. Set environment variables:
   ```bash
   export BASE_URL="https://api.equinix.com"
   export AUTH_TOKEN="your-bearer-token-here"
   ```

### Running Tests

#### 1. Smoke Test (Quick validation)

```bash
k6 run smoke.test.js
```

#### 2. Load Test (Normal conditions)

```bash
k6 run load.test.js
```

#### 3. Stress Test (Breaking point)

```bash
k6 run stress.test.js
```

#### 4. Spike Test (Sudden load spikes)

```bash
k6 run spike.test.js
```

#### 5. Soak Test (Long-running stability)

```bash
# WARNING: This runs for 2 hours
k6 run soak.test.js
```

### Running with Custom Configuration

```bash
# Override base URL
k6 run --env BASE_URL=https://staging.api.equinix.com smoke.test.js

# Override auth token
k6 run --env AUTH_TOKEN=abc123 smoke.test.js

# Run with custom VUs and duration
k6 run --vus 10 --duration 30s smoke.test.js
```

### Running with Docker

```bash
docker run --rm -i \
  -e BASE_URL="https://api.equinix.com" \
  -e AUTH_TOKEN="your-token" \
  -v $(pwd):/scripts \
  grafana/k6:latest run /scripts/smoke.test.js
```

## 📊 Understanding Results

### Key Metrics

- **http_req_duration**: Total request time (includes DNS lookup, connection, TLS handshake, request, response)
- **http_req_waiting**: Time to first byte (TTFB)
- **http_req_failed**: Percentage of failed requests
- **checks**: Percentage of successful validation checks
- **locations_api_latency**: Custom metric tracking API-specific latency
- **custom_business_errors**: Custom metric for business logic validation failures

### Thresholds

Each test has predefined thresholds. Test **fails** if thresholds are not met:

```
✓ checks.........................: 99.5% (pass - above 99%)
✗ http_req_duration...............: p(95)=1200ms (fail - above 500ms threshold)
```

### Output Formats

#### Console Output (default)

```bash
k6 run smoke.test.js
```

#### JSON Output

```bash
k6 run --out json=results.json smoke.test.js
```

#### HTML Report (requires xk6-reporter)

```bash
k6 run --out web-dashboard smoke.test.js
```

#### InfluxDB + Grafana (recommended for production)

```bash
k6 run --out influxdb=http://localhost:8086/k6 smoke.test.js
```

## 🎯 Test Scenarios Explained

### 1. Smoke Test

- **Purpose**: Verify the system works with minimal load
- **Use Case**: After deployments, quick sanity check
- **Load Profile**: 1 VU for 1 minute
- **Pass Criteria**: All checks pass, p95 < 500ms

### 2. Load Test

- **Purpose**: Validate performance under expected normal load
- **Use Case**: Regular performance baseline verification
- **Load Profile**: Ramp to 50 VUs over 7 minutes, hold 5 minutes
- **Pass Criteria**: p95 < 500ms, p99 < 1000ms, failure rate < 1%

### 3. Stress Test

- **Purpose**: Find the breaking point of the system
- **Use Case**: Capacity planning, understanding limits
- **Load Profile**: Gradually increase to 250 VUs
- **Pass Criteria**: p95 < 2000ms, failure rate < 10%
- **Expected**: Some failures are acceptable

### 4. Spike Test

- **Purpose**: Test recovery from sudden traffic spikes
- **Use Case**: Handling viral content, DDoS preparation
- **Load Profile**: 10 → 200 → 10 → 300 → 10 VUs
- **Pass Criteria**: p95 < 3000ms, failure rate < 15%
- **Focus**: System recovery and rate limiting

### 5. Soak Test

- **Purpose**: Detect memory leaks, connection leaks, performance degradation
- **Use Case**: Before major releases, quarterly validation
- **Load Profile**: 30 VUs sustained for 2 hours
- **Pass Criteria**: p95 < 800ms, failure rate < 1%
- **Focus**: Performance stability over time

## 🔧 Customization

### Modifying Load Profiles

Edit the `options.stages` array in each test file:

```javascript
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp-up
    { duration: "5m", target: 50 }, // Peak load
    { duration: "2m", target: 0 }, // Ramp-down
  ],
};
```

### Adding Custom Metrics

```javascript
import { Trend, Counter, Rate, Gauge } from "k6/metrics";

const myCustomMetric = new Trend("my_custom_metric", true);

export default function () {
  const duration = myCustomMetric.add(duration); // ... your measurement
}
```

### Modifying Thresholds

```javascript
export const options = {
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};
```

## 📈 Interpreting Results

### Success Indicators

- ✅ All checks pass > 99%
- ✅ Response times within thresholds
- ✅ Error rate < 1%
- ✅ Consistent performance throughout test

### Warning Signs

- ⚠️ Response time gradually increasing (memory leak)
- ⚠️ Spike in errors during high load
- ⚠️ Connection errors or timeouts
- ⚠️ Check failures > 1%

### Critical Issues

- 🚨 Response time > 5x baseline
- 🚨 Error rate > 10%
- 🚨 Complete service unavailable (503)
- 🚨 Connection pool exhaustion

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Refused

```
WARN[0001] Request Failed error="Get \"...\": dial tcp: connect: connection refused"
```

**Solution**: Verify BASE_URL is correct and service is running

#### 2. Authentication Failures

```
✗ Status is 200
  ↳ 0% — got 401 Unauthorized
```

**Solution**: Set valid AUTH_TOKEN environment variable

#### 3. Rate Limiting

```
WARN[0045] status: 429, body: {"error":"Rate limit exceeded"}
```

**Solution**: Expected during stress/spike tests, verify rate limiting works correctly

#### 4. Timeout Errors

```
WARN[0120] Request Failed error="request timeout"
```

**Solution**: Increase timeout in test or investigate slow endpoint

## 📝 Best Practices

1. **Start with Smoke Tests**: Always run smoke test first
2. **Baseline First**: Establish baseline with load test before stress testing
3. **Monitor Systems**: Watch server resources during tests
4. **Gradual Load**: Don't jump directly to stress tests
5. **Document Results**: Keep records of test runs for comparison
6. **Test in Stages**: Run tests in non-production environments first
7. **Schedule Soak Tests**: Run overnight or on weekends

## 🔗 Integration

### CI/CD Pipeline

```yaml
# GitHub Actions example
name: Performance Tests
on: [push]
jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run k6 smoke test
        uses: grafana/k6-action@v0.3.0
        with:
          filename: k6/smoke.test.js
        env:
          BASE_URL: ${{ secrets.API_BASE_URL }}
          AUTH_TOKEN: ${{ secrets.API_TOKEN }}
```

### Jenkins Pipeline

```groovy
stage('Performance Test') {
  steps {
    sh '''
      k6 run \
        --env BASE_URL=${API_URL} \
        --env AUTH_TOKEN=${API_TOKEN} \
        --out json=results.json \
        k6/smoke.test.js
    '''
  }
}
```

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)

## 🤝 Contributing

When adding new tests:

1. Follow the existing naming convention
2. Include comprehensive checks
3. Document thresholds and expected behavior
4. Add test to this README

## 📄 License

Same as parent project.
