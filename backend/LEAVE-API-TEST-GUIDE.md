# Campus Nexus - Faculty Leave Management API - Manual Test Examples

## Prerequisites
- Export variables:
```bash
export BASE_URL="http://localhost:5000"
export AUTH_TOKEN="your_jwt_token_here"
export LEAVE_ID="1"
export FACULTY_ID="1"
export SUBSTITUTE_FACULTY_ID="2"
```

## Test Cases

### 1. Submit Leave Request (Faculty)
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/submit" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "Medical",
    "startDate": "2024-02-10",
    "endDate": "2024-02-12",
    "reason": "Medical emergency",
    "affectedPeriods": [1, 2, 3],
    "substituteFacultyId": 2
  }'
```

### 2. Get My Leave Applications (Faculty)
```bash
curl -X GET "$BASE_URL/api/v1/faculty/leave-management/my-applications" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Get Pending Alteration Requests (Substitute Faculty)
```bash
curl -X GET "$BASE_URL/api/v1/faculty/leave-management/pending-alterations" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Accept Alteration (Substitute Faculty)
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/accept-alteration" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID'
  }'
```

### 5. Reject Alteration (Substitute Faculty)
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/reject-alteration" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID',
    "rejectionReason": "Not available during this period"
  }'
```

### 6. Get Timetable Apply Queue (Timetable Incharge)
```bash
curl -X GET "$BASE_URL/api/v1/faculty/leave-management/timetable-apply-queue" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 7. Apply Timetable Alterations (Timetable Incharge)
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/apply-alterations" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID',
    "overlayData": {
      "periodIds": [1, 2, 3],
      "replacementFacultyId": 2
    }
  }'
```

### 8. Get Pending Executive Approvals (Executive Admin)
```bash
curl -X GET "$BASE_URL/api/v1/faculty/executive/pending-approvals" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 9. Executive Admin Approve Leave
```bash
curl -X POST "$BASE_URL/api/v1/faculty/executive/approve" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID'
  }'
```

### 10. Executive Admin Reject Leave
```bash
curl -X POST "$BASE_URL/api/v1/faculty/executive/reject" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID',
    "rejectionReason": "Insufficient notice period"
  }'
```

### 11. Get Rejection Reasons (Executive Admin)
```bash
curl -X GET "$BASE_URL/api/v1/faculty/executive/rejection-reasons" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 12. Get Department Colleagues (Faculty - for substitute selection)
```bash
curl -X GET "$BASE_URL/api/v1/faculty/leave-management/colleagues" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 13. Check Faculty Availability
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/check-availability" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": '$SUBSTITUTE_FACULTY_ID',
    "startDate": "2024-02-10",
    "endDate": "2024-02-12"
  }'
```

### 14. Get Leave Request Details
```bash
curl -X GET "$BASE_URL/api/v1/faculty/leave-management/details/$LEAVE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 15. Withdraw Leave Request (Faculty)
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/withdraw" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID'
  }'
```

### 16. Revert Alteration (Timetable Incharge)
```bash
curl -X POST "$BASE_URL/api/v1/faculty/leave-management/revert" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveId": '$LEAVE_ID'
  }'
```

## Response Format

All endpoints return JSON responses in the following format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Error details
  ]
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Workflow Example

### Complete Workflow:
1. **Faculty submits leave request** → Status: `pending`
2. **Substitute accepts/rejects** → Status: `substitute_pending` → `substitute_approved` or `substitute_rejected`
3. **Timetable incharge applies alteration** → Status: `timetable_pending` → `timetable_approved`
4. **IF totalDays > 2**: Executive admin approves/rejects → Status: `executive_pending` → `executive_approved` or `executive_rejected`
5. **Final status**: `approved` or `rejected`

### Multi-day Leave (> 2 days) Example Workflow:
- Total Days: 3 (Feb 10-12)
- Triggers: `executive_pending` after timetable approval
- Requires: Executive admin approval
- Final statuses: `approved` or `rejected` (at executive level)

### Short Leave (≤ 2 days) Example Workflow:
- Total Days: 2 (Feb 10-11)
- Does NOT trigger: Executive approval
- Final statuses: `approved` (after timetable incharge approval) or `rejected` (at any level)

## Notes
- Replace `$BASE_URL` with your actual server URL
- Replace `$AUTH_TOKEN` with valid JWT token from login
- Use actual `$LEAVE_ID` values from previous requests
- Dates must be in `YYYY-MM-DD` format
- All timestamps are in UTC
