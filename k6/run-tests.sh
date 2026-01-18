#!/bin/bash

###############################################################################
# K6 Performance Test Runner
# 
# This script helps run k6 performance tests with proper configuration
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="${SCRIPT_DIR}/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Default values
BASE_URL="${BASE_URL:-https://api-staging.megaport.com}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_k6_installed() {
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed"
        echo ""
        echo "Install k6 from: https://k6.io/docs/getting-started/installation"
        echo ""
        echo "Quick install:"
        echo "  macOS:   brew install k6"
        echo "  Linux:   sudo apt-get install k6"
        echo "  Windows: choco install k6"
        exit 1
    fi
    print_success "k6 is installed ($(k6 version))"
}

create_results_dir() {
    mkdir -p "${RESULTS_DIR}"
    print_success "Results directory: ${RESULTS_DIR}"
}

###############################################################################
# Test Execution Functions
###############################################################################

run_test() {
    local test_file=$1
    local test_name=$2
    local output_file="${RESULTS_DIR}/${test_name}_${TIMESTAMP}.json"
    
    print_header "Running ${test_name}"
    
    echo ""
    print_info "Configuration:"
    echo "  Base URL: ${BASE_URL}"
    echo "  Test File: ${test_file}"
    echo "  Output: ${output_file}"
    echo ""
    
    if [ -z "${AUTH_TOKEN}" ]; then
        print_warning "AUTH_TOKEN not set - using placeholder"
    fi
    
    # Run k6 test
    if k6 run \
        --env BASE_URL="${BASE_URL}" \
        --env AUTH_TOKEN="${AUTH_TOKEN}" \
        --out json="${output_file}" \
        "${SCRIPT_DIR}/${test_file}"; then
        print_success "${test_name} completed successfully"
        echo ""
        print_info "Results saved to: ${output_file}"
        return 0
    else
        print_error "${test_name} failed"
        return 1
    fi
}

run_smoke_test() {
    run_test "smoke.test.js" "smoke_test"
}

run_load_test() {
    run_test "load.test.js" "load_test"
}

run_stress_test() {
    run_test "stress.test.js" "stress_test"
}

run_spike_test() {
    run_test "spike.test.js" "spike_test"
}

run_soak_test() {
    print_warning "Soak test will run for 2 hours"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_test "soak.test.js" "soak_test"
    else
        print_info "Soak test skipped"
    fi
}

run_all_tests() {
    print_header "Running All Performance Tests"
    
    local failed_tests=()
    
    # Run smoke test
    if ! run_smoke_test; then
        failed_tests+=("smoke")
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run load test
    if ! run_load_test; then
        failed_tests+=("load")
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run stress test
    if ! run_stress_test; then
        failed_tests+=("stress")
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run spike test
    if ! run_spike_test; then
        failed_tests+=("spike")
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Ask about soak test
    print_warning "Soak test is skipped in 'all' mode (runs for 2 hours)"
    print_info "Run it separately with: ./run-tests.sh soak"
    
    # Summary
    echo ""
    print_header "Test Summary"
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Failed tests: ${failed_tests[*]}"
        exit 1
    fi
}

###############################################################################
# Usage
###############################################################################

show_usage() {
    cat << EOF
Usage: $0 [TEST_TYPE] [OPTIONS]

Test Types:
  smoke       Run smoke test (1 minute, 1 VU)
  load        Run load test (14 minutes, up to 50 VUs)
  stress      Run stress test (15 minutes, up to 250 VUs)
  spike       Run spike test (10 minutes, up to 300 VUs)
  soak        Run soak test (2 hours, 30 VUs)
  all         Run all tests except soak (recommended order)

Options:
  -h, --help  Show this help message

Environment Variables:
  BASE_URL    Base URL for API (default: https://api-staging.megaport.com)
  AUTH_TOKEN  Bearer token for authentication

Examples:
  # Run smoke test
  $0 smoke

  # Run with custom base URL
  BASE_URL=https://staging.api.com $0 smoke

  # Run with authentication
  AUTH_TOKEN=abc123 $0 load

  # Run all tests
  $0 all

  # Docker example
  docker run --rm -i \\
    -e BASE_URL="https://api-staging.megaport.com" \\
    -e AUTH_TOKEN="your-token" \\
    -v \$(pwd):/scripts \\
    grafana/k6:latest run /scripts/smoke.test.js

EOF
}

###############################################################################
# Main
###############################################################################

main() {
    # Check for help flag
    if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi
    
    # Check k6 installation
    check_k6_installed
    
    # Create results directory
    create_results_dir
    
    echo ""
    
    # Parse test type
    case "${1:-smoke}" in
        smoke)
            run_smoke_test
            ;;
        load)
            run_load_test
            ;;
        stress)
            run_stress_test
            ;;
        spike)
            run_spike_test
            ;;
        soak)
            run_soak_test
            ;;
        all)
            run_all_tests
            ;;
        *)
            print_error "Unknown test type: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
