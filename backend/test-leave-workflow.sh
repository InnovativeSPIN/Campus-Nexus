#!/bin/bash

# Campus Nexus - Faculty Leave & Alteration Management API Test Script
# This script tests the complete workflow of the leave management system
# Usage: bash test-leave-workflow.sh <baseUrl> <authToken>

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:5000}"
AUTH_TOKEN="${2}"
DEPARTMENT_ID=1
FACULTY_ID=1
SUBSTITUTE_FACULTY_ID=2
TIMETABLE_INCHARGE_ID=3
EXECUTIVE_ADMIN_ID=4

echo "========================================"
echo "Faculty Leave Management - API Test Suite"
echo "========================================"
echo "Base URL: $BASE_URL"
echo ""

# Check if auth token is provided
if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}Error: Auth token not provided${NC}"
  echo "Usage: bash test-leave-workflow.sh <baseUrl> <authToken>"
  exit 1
fi

# Helper function to make requests
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -e "${YELLOW}${description}${NC}"
  echo "Request: $method $BASE_URL/api/v1$endpoint"

  if [ -z "$data" ]; then
    curl -X "$method" \
      "$BASE_URL/api/v1$endpoint" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -w "\nStatus: %{http_code}\n\n"
  else
    echo "Body: $data"
    curl -X "$method" \
      "$BASE_URL/api/v1$endpoint" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      -w "\nStatus: %{http_code}\n\n"
  fi
}

# Test 1: Submit Leave Request
echo -e "${GREEN}=== TEST 1: Submit Leave Request ===${NC}"
LEAVE_DATA='{
  "leaveType": "Medical",
  "startDate": "'$(date -d "+1 day" +%Y-%m-%d)'",
  "endDate": "'$(date -d "+3 days" +%Y-%m-%d)'",
  "reason": "Medical emergency",
  "affectedPeriods": [1, 2, 3],
  "substituteFacultyId": '$SUBSTITUTE_FACULTY_ID'
}'

LEAVE_RESPONSE=$(curl -s -X POST \
  "$BASE_URL/api/v1/faculty/leave-management/submit" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$LEAVE_DATA")

echo "$LEAVE_RESPONSE" | jq '.'
LEAVE_ID=$(echo "$LEAVE_RESPONSE" | jq -r '.data.id // empty')
echo "Leave ID: $LEAVE_ID"
echo ""

# Test 2: Get Leave Applications
echo -e "${GREEN}=== TEST 2: Get My Leave Applications ===${NC}"
make_request "GET" "/faculty/leave-management/my-applications" "" "Fetch faculty's leave applications"

# Test 3: Get Pending Alteration Requests
echo -e "${GREEN}=== TEST 3: Get Pending Alteration Requests ===${NC}"
make_request "GET" "/faculty/leave-management/pending-alterations" "" "Fetch pending alteration requests for substitute"

# Test 4: Accept Alteration (As Substitute)
echo -e "${GREEN}=== TEST 4: Accept Alteration (Substitute Approval) ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  ACCEPT_DATA="{\"leaveId\": $LEAVE_ID}"
  make_request "POST" "/faculty/leave-management/accept-alteration" "$ACCEPT_DATA" "Accept leave alteration as substitute"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

# Test 5: Reject Alteration (As Substitute)
echo -e "${GREEN}=== TEST 5: Reject Alteration (Substitute Rejection) ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  REJECT_DATA="{
    \"leaveId\": $LEAVE_ID,
    \"rejectionReason\": \"Not available during this period\"
  }"
  make_request "POST" "/faculty/leave-management/reject-alteration" "$REJECT_DATA" "Reject leave alteration as substitute"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

# Test 6: Get Timetable Apply Queue
echo -e "${GREEN}=== TEST 6: Get Timetable Apply Queue ===${NC}"
make_request "GET" "/faculty/leave-management/timetable-apply-queue" "" "Fetch pending alterations for timetable incharge"

# Test 7: Apply Timetable Alterations (As Timetable Incharge)
echo -e "${GREEN}=== TEST 7: Apply Timetable Alterations ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  APPLY_DATA="{
    \"leaveId\": $LEAVE_ID,
    \"overlayData\": {
      \"periodIds\": [1, 2, 3],
      \"replacementFacultyId\": $SUBSTITUTE_FACULTY_ID
    }
  }"
  make_request "POST" "/faculty/leave-management/apply-alterations" "$APPLY_DATA" "Apply timetable alterations"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

# Test 8: Get Pending Executive Approvals
echo -e "${GREEN}=== TEST 8: Get Pending Executive Approvals ===${NC}"
make_request "GET" "/faculty/executive/pending-approvals" "" "Fetch pending approvals for executive admin"

# Test 9: Get Rejection Reasons
echo -e "${GREEN}=== TEST 9: Get Rejection Reasons ===${NC}"
make_request "GET" "/faculty/executive/rejection-reasons" "" "Fetch available rejection reasons"

# Test 10: Executive Admin Approve Leave
echo -e "${GREEN}=== TEST 10: Executive Admin Approve Leave ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  EXEC_APPROVE_DATA="{\"leaveId\": $LEAVE_ID}"
  make_request "POST" "/faculty/executive/approve" "$EXEC_APPROVE_DATA" "Approve leave as executive admin"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

# Test 11: Executive Admin Reject Leave
echo -e "${GREEN}=== TEST 11: Executive Admin Reject Leave ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  EXEC_REJECT_DATA="{
    \"leaveId\": $LEAVE_ID,
    \"rejectionReason\": \"Insufficient notice period\"
  }"
  make_request "POST" "/faculty/executive/reject" "$EXEC_REJECT_DATA" "Reject leave as executive admin"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

# Test 12: Get Faculty Colleagues
echo -e "${GREEN}=== TEST 12: Get Department Colleagues ===${NC}"
make_request "GET" "/faculty/leave-management/colleagues" "" "Get list of department colleagues for substitute selection"

# Test 13: Check Faculty Availability
echo -e "${GREEN}=== TEST 13: Check Faculty Availability ===${NC}"
CHECK_AVAILABILITY_DATA="{
  \"facultyId\": $SUBSTITUTE_FACULTY_ID,
  \"startDate\": \"$(date -d "+1 day" +%Y-%m-%d)\",
  \"endDate\": \"$(date -d "+3 days" +%Y-%m-%d)\"
}"
make_request "POST" "/faculty/leave-management/check-availability" "$CHECK_AVAILABILITY_DATA" "Check substitute faculty availability"

# Test 14: Get Leave Request Details
echo -e "${GREEN}=== TEST 14: Get Leave Request Details ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  make_request "GET" "/faculty/leave-management/details/$LEAVE_ID" "" "Get details of a specific leave request"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

# Test 15: Withdraw Leave Request
echo -e "${GREEN}=== TEST 15: Withdraw Leave Request ===${NC}"
if [ ! -z "$LEAVE_ID" ]; then
  WITHDRAW_DATA="{\"leaveId\": $LEAVE_ID}"
  make_request "POST" "/faculty/leave-management/withdraw" "$WITHDRAW_DATA" "Withdraw a pending leave request"
else
  echo -e "${RED}Skipping: No valid leave ID${NC}"
fi
echo ""

echo "========================================"
echo -e "${GREEN}API Test Suite Complete${NC}"
echo "========================================"
