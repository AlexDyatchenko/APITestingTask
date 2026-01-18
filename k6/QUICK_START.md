# K6 Performance Testing - Quick Reference

## 🚀 Quick Commands

### Run Individual Tests

```bash
# Smoke test (1 min)
./run-tests.sh smoke

# Load test (14 min)
./run-tests.sh load

# Stress test (15 min)
./run-tests.sh stress

# Spike test (10 min)
./run-tests.sh spike

# Soak test (2 hours)
./run-tests.sh soak

# All tests (except soak)
./run-tests.sh all
```

### With Environment Variables

```bash
# Set auth token
export AUTH_TOKEN="your-token-here"
./run-tests.sh smoke

# Or inline
BASE_URL=https://staging.api.com AUTH_TOKEN=abc123 ./run-tests.sh load
```

### Direct k6 Commands

```bash
# Run test directly
k6 run smoke.test.js

# With custom options
k6 run --vus 10 --duration 30s smoke.test.js

# With environment variables
k6 run --env BASE_URL=https://api.com --env AUTH_TOKEN=abc123 smoke.test.js

# Save results to JSON
k6 run --out json=results.json smoke.test.js

# Run in quiet mode
k6 run --quiet smoke.test.js
```

## 📊 Test Comparison

| Test       | VUs    | Duration | When to Use                        |
| ---------- | ------ | -------- | ---------------------------------- |
| **Smoke**  | 1      | 1 min    | After deployment, quick validation |
| **Load**   | 1→50   | 14 min   | Regular performance baseline       |
| **Stress** | 1→250  | 15 min   | Find system limits                 |
| **Spike**  | 10↔300 | 10 min   | Test sudden traffic spikes         |
| **Soak**   | 30     | 2 hrs    | Detect memory leaks                |

## 🎯 Key Metrics

### Response Time Targets

| Test Type | p95 Target | p99 Target |
| --------- | ---------- | ---------- |
| Smoke     | <500ms     | <1000ms    |
| Load      | <500ms     | <1000ms    |
| Stress    | <2000ms    | <5000ms    |
| Spike     | <3000ms    | <8000ms    |
| Soak      | <800ms     | <1500ms    |

### Success Criteria

- ✅ Status code 200 for all requests
- ✅ Response time within thresholds
- ✅ Error rate < 1% (higher for stress/spike)
- ✅ All validation checks pass
- ✅ Business logic validation successful

## 🔍 Interpreting Results

### Good Results ✅

```
✓ checks........................: 99.8%
✓ http_req_duration.............: avg=245ms p(95)=450ms p(99)=850ms
✓ http_req_failed...............: 0.05%
✓ locations_api_latency.........: avg=240ms p(95)=445ms
```

### Warning Signs ⚠️

```
✓ checks........................: 97.5%  (below 99%)
✗ http_req_duration.............: p(95)=1200ms (above threshold)
✓ http_req_failed...............: 1.5%   (above 1%)
```

### Critical Issues 🚨

```
✗ checks........................: 85.2%  (many failures)
✗ http_req_duration.............: p(95)=5000ms (very slow)
✗ http_req_failed...............: 15.8%  (high failure rate)
```

## 🛠️ Troubleshooting

### Test Fails Immediately

- Check BASE_URL is accessible
- Verify AUTH_TOKEN is valid
- Ensure endpoint exists

### High Error Rates

- Check server logs
- Verify rate limiting settings
- Monitor server resources

### Slow Response Times

- Check database performance
- Review server resource usage
- Check network latency

## 📝 Custom Metrics

Each test tracks:

- **locations_api_latency** - API-specific latency tracking
- **custom_business_errors** - Business logic validation failures
- **http_req_duration** - Total request duration
- **http_req_waiting** - Time to first byte (TTFB)
- **http_req_failed** - Failed request rate
- **checks** - Validation check pass rate

## 🔗 Integration Examples

### GitHub Actions

```yaml
- name: Run K6 Performance Tests
  run: |
    cd k6
    ./run-tests.sh smoke
  env:
    BASE_URL: ${{ secrets.API_URL }}
    AUTH_TOKEN: ${{ secrets.API_TOKEN }}
```

### Jenkins

```groovy
stage('Performance Test') {
  steps {
    sh 'cd k6 && ./run-tests.sh load'
  }
}
```

### GitLab CI

```yaml
performance-test:
  script:
    - cd k6
    - ./run-tests.sh smoke
  artifacts:
    paths:
      - k6/results/
```

## 📚 Resources

- Full documentation: [k6/README.md](./README.md)
- k6 Official Docs: https://k6.io/docs/
- Test configuration: [config.js](./config.js)
- Environment setup: [.env.example](./.env.example)
