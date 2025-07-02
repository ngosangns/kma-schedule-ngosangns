#!/bin/bash

# KMA Schedule - Complete Test Suite Runner
# This script runs all types of tests and generates comprehensive reports

set -e  # Exit on any error

echo "🚀 KMA Schedule - Complete Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. E2E tests with real data will be skipped."
    print_status "Copy .env.example to .env and configure your KMA credentials to run E2E tests."
fi

# Create reports directory
mkdir -p test-reports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="test-reports/run_${TIMESTAMP}"
mkdir -p "$REPORT_DIR"

print_status "Test reports will be saved to: $REPORT_DIR"

# Function to run tests with error handling
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    local report_file="$3"
    
    print_status "Running $test_name..."
    
    if eval "$test_command" > "$REPORT_DIR/$report_file" 2>&1; then
        print_success "$test_name completed successfully"
        return 0
    else
        print_error "$test_name failed"
        return 1
    fi
}

# Initialize counters
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

# 1. Unit Tests
print_status "Step 1: Running Unit Tests"
TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Unit Tests" "npm test -- --coverage --ci --watchAll=false" "unit-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

# 2. Integration Tests
print_status "Step 2: Running Integration Tests"
TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Integration Tests" "npm test -- --testPathPattern=integration --ci --watchAll=false" "integration-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

# 3. Component Tests
print_status "Step 3: Running Component Tests"
TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Component Tests" "npm test -- --testPathPattern=components --ci --watchAll=false" "component-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

# 4. E2E Tests - Basic
print_status "Step 4: Running Basic E2E Tests"
TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Basic E2E Tests" "npx playwright test homepage.spec.ts --reporter=html --output=$REPORT_DIR/playwright-basic" "e2e-basic.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

# 5. E2E Tests - Real Data (only if .env exists)
if [ -f ".env" ]; then
    print_status "Step 5: Running E2E Tests with Real KMA Data"
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    if run_test_suite "E2E Tests with Real Data" "npx playwright test login-flow-real.spec.ts complete-user-journey.spec.ts --reporter=html --output=$REPORT_DIR/playwright-real" "e2e-real-data.log"; then
        PASSED_SUITES=$((PASSED_SUITES + 1))
    else
        FAILED_SUITES=$((FAILED_SUITES + 1))
    fi
else
    print_warning "Skipping E2E tests with real data (no .env file)"
fi

# 6. Linting
print_status "Step 6: Running Linting"
TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "ESLint" "npm run lint" "lint.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

# 7. Type Checking
print_status "Step 7: Running Type Checking"
TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "TypeScript Check" "npx tsc --noEmit" "typescript.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

# Generate summary report
print_status "Generating summary report..."

cat > "$REPORT_DIR/summary.md" << EOF
# KMA Schedule - Test Suite Summary

**Run Date:** $(date)
**Report Directory:** $REPORT_DIR

## Overview

- **Total Test Suites:** $TOTAL_SUITES
- **Passed:** $PASSED_SUITES
- **Failed:** $FAILED_SUITES
- **Success Rate:** $(( PASSED_SUITES * 100 / TOTAL_SUITES ))%

## Test Suites

| Suite | Status | Report File |
|-------|--------|-------------|
| Unit Tests | $([ -f "$REPORT_DIR/unit-tests.log" ] && echo "✅ Passed" || echo "❌ Failed") | unit-tests.log |
| Integration Tests | $([ -f "$REPORT_DIR/integration-tests.log" ] && echo "✅ Passed" || echo "❌ Failed") | integration-tests.log |
| Component Tests | $([ -f "$REPORT_DIR/component-tests.log" ] && echo "✅ Passed" || echo "❌ Failed") | component-tests.log |
| Basic E2E Tests | $([ -f "$REPORT_DIR/e2e-basic.log" ] && echo "✅ Passed" || echo "❌ Failed") | e2e-basic.log |
| E2E with Real Data | $([ -f "$REPORT_DIR/e2e-real-data.log" ] && echo "✅ Passed" || echo "❌ Failed") | e2e-real-data.log |
| ESLint | $([ -f "$REPORT_DIR/lint.log" ] && echo "✅ Passed" || echo "❌ Failed") | lint.log |
| TypeScript Check | $([ -f "$REPORT_DIR/typescript.log" ] && echo "✅ Passed" || echo "❌ Failed") | typescript.log |

## Coverage Reports

- Unit test coverage: \`coverage/lcov-report/index.html\`
- E2E test reports: \`$REPORT_DIR/playwright-*/index.html\`

## Next Steps

$(if [ $FAILED_SUITES -gt 0 ]; then
    echo "❌ **Some tests failed. Please review the failed test logs above.**"
else
    echo "✅ **All tests passed! Your application is ready for deployment.**"
fi)

### Failed Tests
$(if [ $FAILED_SUITES -gt 0 ]; then
    echo "Review the following log files for details:"
    for log in "$REPORT_DIR"/*.log; do
        if [ -f "$log" ]; then
            echo "- \`$(basename "$log")\`"
        fi
    done
else
    echo "No failed tests."
fi)

### Recommendations

1. **Code Coverage:** Aim for >80% code coverage in unit tests
2. **E2E Tests:** Run E2E tests with real data before major releases
3. **Performance:** Monitor page load times in E2E tests
4. **Accessibility:** Ensure keyboard navigation works in all flows
5. **Mobile:** Test responsive design on various screen sizes

EOF

# Print final summary
echo ""
echo "======================================"
print_status "Test Suite Complete!"
echo "======================================"
echo ""
echo "📊 Summary:"
echo "  Total Suites: $TOTAL_SUITES"
echo "  Passed: $PASSED_SUITES"
echo "  Failed: $FAILED_SUITES"
echo "  Success Rate: $(( PASSED_SUITES * 100 / TOTAL_SUITES ))%"
echo ""
echo "📁 Reports saved to: $REPORT_DIR"
echo "📋 Summary report: $REPORT_DIR/summary.md"
echo ""

if [ $FAILED_SUITES -gt 0 ]; then
    print_error "Some tests failed. Please review the reports."
    exit 1
else
    print_success "All tests passed! 🎉"
    exit 0
fi
