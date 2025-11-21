#!/bin/bash

# AquaDex Debug Test Script
# This script performs comprehensive checks on the AquaDex application
# to identify issues and validate the current state

echo "========================================="
echo "   AquaDex Application Debug Test"
echo "========================================="
echo ""
echo "Starting comprehensive application audit..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    local message=$3
    
    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        if [ -n "$message" ]; then
            echo "         $message"
        fi
        ((PASS_COUNT++))
    elif [ "$status" == "FAIL" ]; then
        echo -e "${RED}✗ FAIL${NC} - $test_name"
        if [ -n "$message" ]; then
            echo "         $message"
        fi
        ((FAIL_COUNT++))
    else
        echo -e "${YELLOW}⚠ WARN${NC} - $test_name"
        if [ -n "$message" ]; then
            echo "         $message"
        fi
        ((WARN_COUNT++))
    fi
    echo ""
}

echo "========================================="
echo "1. ENVIRONMENT CHECKS"
echo "========================================="
echo ""

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_result "Node.js Installation" "PASS" "Version: $NODE_VERSION"
else
    print_result "Node.js Installation" "FAIL" "Node.js not found"
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_result "npm Installation" "PASS" "Version: $NPM_VERSION"
else
    print_result "npm Installation" "FAIL" "npm not found"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(ls -1 node_modules | wc -l)
    print_result "Dependencies Installed" "PASS" "$MODULE_COUNT packages installed"
else
    print_result "Dependencies Installed" "FAIL" "node_modules directory not found. Run 'npm install'"
fi

# Check for environment files
if [ -f ".env.local" ]; then
    print_result "Environment Configuration" "PASS" ".env.local file exists"
elif [ -f ".env" ]; then
    print_result "Environment Configuration" "PASS" ".env file exists"
else
    print_result "Environment Configuration" "WARN" "No .env.local or .env file found. Application may not connect to services."
fi

echo "========================================="
echo "2. FILE INTEGRITY CHECKS"
echo "========================================="
echo ""

# Check critical files exist
CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "next.config.ts"
    "src/app/layout.tsx"
    "src/app/page.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_result "File: $file" "PASS" "Exists"
    else
        print_result "File: $file" "FAIL" "Missing"
    fi
done

# Check for syntax errors in specific problematic file
if [ -f "src/components/dashboard/ImageUploadForm.tsx" ]; then
    # Count braces
    OPEN_BRACES=$(grep -o '{' src/components/dashboard/ImageUploadForm.tsx | wc -l)
    CLOSE_BRACES=$(grep -o '}' src/components/dashboard/ImageUploadForm.tsx | wc -l)
    
    if [ "$OPEN_BRACES" -eq "$CLOSE_BRACES" ]; then
        print_result "ImageUploadForm.tsx Brace Balance" "PASS" "Braces are balanced ($OPEN_BRACES opening, $CLOSE_BRACES closing)"
    else
        print_result "ImageUploadForm.tsx Brace Balance" "FAIL" "Unbalanced braces ($OPEN_BRACES opening, $CLOSE_BRACES closing)"
    fi
fi

echo "========================================="
echo "3. SECURITY AUDIT"
echo "========================================="
echo ""

# Run npm audit
echo "Running npm audit..."
if npm audit --audit-level=moderate > /tmp/audit_output.txt 2>&1; then
    print_result "Security Vulnerabilities" "PASS" "No moderate or higher vulnerabilities found"
else
    VULNERABILITIES=$(grep -E "found [0-9]+ vulnerabilities" /tmp/audit_output.txt | head -1)
    print_result "Security Vulnerabilities" "FAIL" "$VULNERABILITIES"
    
    # Show summary
    echo "   Vulnerability Summary:"
    grep -E "Severity: (critical|high|moderate)" /tmp/audit_output.txt | sort | uniq -c | while read line; do
        echo "   $line"
    done
    echo ""
fi

echo "========================================="
echo "4. TYPESCRIPT TYPE CHECKING"
echo "========================================="
echo ""

# Run TypeScript type checking
echo "Running TypeScript type check..."
if npm run typecheck > /tmp/typecheck_output.txt 2>&1; then
    print_result "TypeScript Type Checking" "PASS" "No type errors found"
else
    ERROR_COUNT=$(grep "Found [0-9]* error" /tmp/typecheck_output.txt | grep -o "[0-9]*" | head -1)
    if [ -n "$ERROR_COUNT" ]; then
        print_result "TypeScript Type Checking" "FAIL" "Found $ERROR_COUNT type errors"
        
        # Show first few errors
        echo "   First 5 errors:"
        grep "error TS[0-9]*:" /tmp/typecheck_output.txt | head -5 | while read line; do
            echo "   $line"
        done
    else
        print_result "TypeScript Type Checking" "FAIL" "Type checking failed"
    fi
    echo ""
fi

echo "========================================="
echo "5. LINTING"
echo "========================================="
echo ""

# Check if ESLint is configured
if [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ] || [ -f "eslint.config.mjs" ]; then
    print_result "ESLint Configuration" "PASS" "ESLint is configured"
    
    # Run linting (skip for now due to config issues)
    # Note: ESLint check disabled due to circular reference issue
    print_result "ESLint Execution" "WARN" "Skipped due to configuration issues"
else
    print_result "ESLint Configuration" "WARN" "ESLint not configured"
fi

echo "========================================="
echo "6. BUILD TEST"
echo "========================================="
echo ""

# Attempt to build
echo "Attempting to build the application..."
echo "This may take a while..."
echo ""

if npm run build > /tmp/build_output.txt 2>&1; then
    print_result "Next.js Build" "PASS" "Build completed successfully"
else
    BUILD_ERROR=$(grep -E "Error:|Failed to" /tmp/build_output.txt | head -3)
    print_result "Next.js Build" "FAIL" "Build failed"
    
    # Show build errors
    echo "   Build errors:"
    echo "$BUILD_ERROR" | while read line; do
        echo "   $line"
    done
    echo ""
fi

# Check build warnings
if [ -f "/tmp/build_output.txt" ]; then
    WARNING_COUNT=$(grep -c "⚠" /tmp/build_output.txt || echo "0")
    if [ "$WARNING_COUNT" -gt 0 ]; then
        print_result "Build Warnings" "WARN" "Found $WARNING_COUNT warning sections"
    fi
fi

echo "========================================="
echo "7. DEPENDENCY ANALYSIS"
echo "========================================="
echo ""

# Check for outdated packages
echo "Checking for outdated packages (this may take a moment)..."
if npm outdated > /tmp/outdated.txt 2>&1; then
    print_result "Package Updates" "PASS" "All packages are up to date"
else
    OUTDATED_COUNT=$(wc -l < /tmp/outdated.txt)
    if [ "$OUTDATED_COUNT" -gt 1 ]; then  # Header line doesn't count
        print_result "Package Updates" "WARN" "$((OUTDATED_COUNT - 1)) packages have updates available"
    fi
fi

# Check package.json scripts
if grep -q "\"test\":" package.json; then
    print_result "Test Script Configured" "PASS" "Test script is defined"
else
    print_result "Test Script Configured" "WARN" "No test script configured in package.json"
fi

echo "========================================="
echo "8. SOURCE CODE ANALYSIS"
echo "========================================="
echo ""

# Count components
COMPONENT_COUNT=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
print_result "React Components" "PASS" "Found $COMPONENT_COUNT component files"

# Count pages
PAGE_COUNT=$(find src/app -name "page.tsx" 2>/dev/null | wc -l)
print_result "Next.js Pages" "PASS" "Found $PAGE_COUNT page files"

# Count AI flows
FLOW_COUNT=$(find src/ai/flows -name "*.ts" 2>/dev/null | wc -l)
print_result "Genkit AI Flows" "PASS" "Found $FLOW_COUNT AI flow files"

# Check for TODOs and FIXMEs
TODO_COUNT=$(grep -r "TODO:" src/ 2>/dev/null | wc -l)
FIXME_COUNT=$(grep -r "FIXME:" src/ 2>/dev/null | wc -l)

if [ "$TODO_COUNT" -gt 0 ] || [ "$FIXME_COUNT" -gt 0 ]; then
    print_result "Code Comments" "WARN" "Found $TODO_COUNT TODOs and $FIXME_COUNT FIXMEs"
else
    print_result "Code Comments" "PASS" "No TODOs or FIXMEs found"
fi

echo "========================================="
echo "9. CONFIGURATION FILES"
echo "========================================="
echo ""

# Check TypeScript config
if [ -f "tsconfig.json" ]; then
    if grep -q "\"strict\": true" tsconfig.json; then
        print_result "TypeScript Strict Mode" "PASS" "Strict mode is enabled"
    else
        print_result "TypeScript Strict Mode" "WARN" "Strict mode not enabled"
    fi
fi

# Check Next.js config
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    print_result "Next.js Configuration" "PASS" "Next.js config file exists"
else
    print_result "Next.js Configuration" "FAIL" "No Next.js config file found"
fi

# Check Tailwind config
if [ -f "tailwind.config.ts" ] || [ -f "tailwind.config.js" ]; then
    print_result "Tailwind Configuration" "PASS" "Tailwind config file exists"
else
    print_result "Tailwind Configuration" "WARN" "No Tailwind config file found"
fi

echo "========================================="
echo "10. DOCUMENTATION CHECK"
echo "========================================="
echo ""

# Check for documentation files
DOC_FILES=(
    "README.md"
    "docs/ProjectDocumentation.md"
    "docs/NEON_SETUP.md"
    ".specify/memory/constitution.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        print_result "Documentation: $doc" "PASS" "Exists"
    else
        print_result "Documentation: $doc" "WARN" "Missing"
    fi
done

echo ""
echo "========================================="
echo "           TEST SUMMARY"
echo "========================================="
echo ""
echo -e "${GREEN}Passed:${NC}  $PASS_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARN_COUNT"
echo -e "${RED}Failed:${NC}  $FAIL_COUNT"
echo ""

TOTAL=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))
if [ "$TOTAL" -gt 0 ]; then
    PASS_PERCENT=$((PASS_COUNT * 100 / TOTAL))
    echo "Overall Success Rate: $PASS_PERCENT%"
fi

echo ""
echo "========================================="
echo "           RECOMMENDATIONS"
echo "========================================="
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}CRITICAL:${NC} Address all failed checks before deployment"
fi

if [ "$WARN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}WARNING:${NC} Review warnings for potential issues"
fi

if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
    echo -e "${GREEN}SUCCESS:${NC} All checks passed! Application is in good shape."
else
    echo ""
    echo "Next steps:"
    echo "1. Review the AUDIT_REPORT.md in docs/ for detailed findings"
    echo "2. Address critical failures first"
    echo "3. Run 'npm audit fix' to address security vulnerabilities"
    echo "4. Fix TypeScript type errors with 'npm run typecheck'"
    echo "5. Re-run this script after fixes to verify improvements"
fi

echo ""
echo "========================================="
echo "Debug test completed!"
echo "========================================="
echo ""

# Save detailed output
echo "Full test output saved to: debug_test_results.txt"
{
    echo "AquaDex Debug Test Results"
    echo "Date: $(date)"
    echo ""
    echo "Test Summary:"
    echo "  Passed: $PASS_COUNT"
    echo "  Warnings: $WARN_COUNT"
    echo "  Failed: $FAIL_COUNT"
    echo ""
    echo "See AUDIT_REPORT.md for detailed analysis"
} > debug_test_results.txt

# Exit with error code if there are failures
if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
else
    exit 0
fi
