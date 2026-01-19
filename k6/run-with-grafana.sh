#!/bin/bash

###############################################################################
# K6 Test Runner with InfluxDB Output
# 
# This script runs k6 tests and sends metrics to InfluxDB for Grafana visualization
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="${BASE_URL:-https://api-staging.megaport.com}"
INFLUXDB_URL="${INFLUXDB_URL:-http://localhost:8086/k6}"

# Print header
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  K6 Load Testing with InfluxDB & Grafana${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if test file is provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 <test-file> [options]${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 smoke.test1.js"
    echo "  $0 load.test.js"
    echo "  $0 stress.test.js"
    echo ""
    echo "Available tests:"
    ls -1 "${SCRIPT_DIR}"/*.js | xargs -n1 basename
    exit 1
fi

TEST_FILE="$1"
shift

# Check if test file exists
if [ ! -f "${SCRIPT_DIR}/${TEST_FILE}" ]; then
    echo -e "${RED}Error: Test file '${TEST_FILE}' not found${NC}"
    exit 1
fi

# Display configuration
echo -e "${GREEN}Configuration:${NC}"
echo "  Test File:     ${TEST_FILE}"
echo "  Base URL:      ${BASE_URL}"
echo "  InfluxDB URL:  ${INFLUXDB_URL}"
echo "  Grafana:       http://localhost:3000"
echo ""

# Run k6 test with InfluxDB output
echo -e "${BLUE}Running k6 test...${NC}"
echo ""

k6 run \
  --out influxdb="${INFLUXDB_URL}" \
  -e BASE_URL="${BASE_URL}" \
  "$@" \
  "${SCRIPT_DIR}/${TEST_FILE}"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Test completed! View results in Grafana:${NC}"
echo -e "${GREEN}  http://localhost:3000${NC}"
echo -e "${GREEN}  (admin/admin)${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
