# RV Fitness — API Contract

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "amount", "message": "Amount must be positive" }
    ]
  }
}
```

## Common Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order (asc/desc) |
| search | string | - | Search term |

---

## Auth Endpoints

### POST /auth/login
Login and receive tokens.
- **Body:** `{ email, password }`
- **Response:** `{ accessToken, refreshToken, user: { id, email, fullName, role } }`
- **Auth:** Public

### POST /auth/refresh
Refresh access token.
- **Body:** `{ refreshToken }`
- **Response:** `{ accessToken, refreshToken }`
- **Auth:** Public

### POST /auth/logout
Invalidate refresh token.
- **Auth:** Authenticated

### GET /auth/me
Get current user profile.
- **Auth:** Authenticated

---

## User Management

### POST /users
Create new user (admin-only for ADMIN/TRAINER roles).
- **Body:** `{ email, password, fullName, phone, role }`
- **Auth:** ADMIN
- **Validation:** role must be ADMIN, MEMBER, or TRAINER

### GET /users
List users with pagination.
- **Auth:** ADMIN
- **Filters:** role, isActive, search

### GET /users/:id
Get user by ID.
- **Auth:** ADMIN or self

### PATCH /users/:id
Update user.
- **Auth:** ADMIN or self (role change: ADMIN only)

---

## Member Management (Integration Interface)

### GET /members
List members with pagination.
- **Auth:** ADMIN
- **Filters:** isActive, search

### GET /members/:id
Get member details.
- **Auth:** ADMIN or member-self

### POST /members
Create member profile.
- **Body:** `{ userId, memberCode, dateOfBirth?, gender?, address?, emergencyContact?, joinDate? }`
- **Auth:** ADMIN

---

## Membership Plans (Integration Interface)

### GET /membership-plans
List available plans.
- **Auth:** Authenticated
- **Filters:** isActive

### GET /membership-plans/:id
Get plan details.
- **Auth:** Authenticated

---

## Invoices

### POST /invoices
Create a new invoice.
- **Body:**
```json
{
  "memberId": "uuid",
  "dueDate": "2024-12-31",
  "items": [
    {
      "membershipId": "uuid",
      "description": "Monthly Basic Plan",
      "quantity": 1,
      "unitPricePaisa": 200000,
      "taxRateBps": 1800,
      "discountPaisa": 0
    }
  ],
  "notes": "Optional member-visible notes",
  "internalNotes": "Optional admin-only notes"
}
```
- **Auth:** ADMIN
- **Response:** Created invoice with computed totals

### GET /invoices
List invoices with pagination.
- **Auth:** ADMIN (all), MEMBER (own only)
- **Filters:** status, memberId, dateFrom, dateTo, overdue, search

### GET /invoices/:id
Get invoice details with items, payments, and balance.
- **Auth:** ADMIN or member-owner

### PATCH /invoices/:id
Update draft invoice.
- **Auth:** ADMIN
- **Note:** Only DRAFT invoices can be modified

### POST /invoices/:id/issue
Issue a draft invoice.
- **Auth:** ADMIN
- **State transition:** DRAFT → ISSUED

### POST /invoices/:id/cancel
Cancel an invoice.
- **Auth:** ADMIN
- **State transition:** DRAFT/ISSUED → CANCELLED

### POST /invoices/:id/void
Void a paid invoice (with adjustment).
- **Auth:** ADMIN
- **State transition:** PAID → VOID

---

## Payments

### POST /payments
Record a payment.
- **Body:**
```json
{
  "invoiceId": "uuid",
  "amountPaisa": 200000,
  "method": "CASH",
  "referenceNumber": "optional-txn-ref",
  "paymentDate": "2024-12-15",
  "notes": "Optional notes",
  "idempotencyKey": "unique-client-key"
}
```
- **Auth:** ADMIN
- **Validation:** Amount > 0, ≤ remaining balance, valid invoice state
- **Idempotency:** Duplicate key returns original payment

### GET /payments
List payments with pagination.
- **Auth:** ADMIN (all), MEMBER (own only)
- **Filters:** status, method, invoiceId, memberId, dateFrom, dateTo, search

### GET /payments/:id
Get payment details.
- **Auth:** ADMIN or member-owner

### POST /payments/:id/confirm
Confirm a pending payment.
- **Auth:** ADMIN
- **State transition:** PENDING → CONFIRMED
- **Side effect:** Creates receipt, updates invoice paid amount

### POST /payments/:id/reverse
Reverse a confirmed payment.
- **Auth:** ADMIN
- **State transition:** CONFIRMED → REVERSED
- **Side effect:** Updates invoice paid amount, voids receipt

---

## Receipts

### GET /receipts
List receipts with pagination.
- **Auth:** ADMIN (all), MEMBER (own only)
- **Filters:** memberId, dateFrom, dateTo

### GET /receipts/:id
Get receipt details.
- **Auth:** ADMIN or member-owner

### GET /receipts/:id/pdf
Download receipt as PDF.
- **Auth:** ADMIN or member-owner

---

## Refunds

### POST /refunds
Request a refund.
- **Body:**
```json
{
  "paymentId": "uuid",
  "amountPaisa": 100000,
  "reason": "Member requested cancellation",
  "method": "ORIGINAL_METHOD"
}
```
- **Auth:** ADMIN
- **Validation:** Amount ≤ (original payment - existing refunds)

### GET /refunds
List refunds with pagination.
- **Auth:** ADMIN
- **Filters:** status, memberId, dateFrom, dateTo

### GET /refunds/:id
Get refund details.
- **Auth:** ADMIN

### POST /refunds/:id/approve
Approve a refund request.
- **Auth:** ADMIN
- **State transition:** REQUESTED → APPROVED

### POST /refunds/:id/process
Process an approved refund.
- **Auth:** ADMIN
- **State transition:** APPROVED → PROCESSED

### POST /refunds/:id/reject
Reject a refund request.
- **Auth:** ADMIN
- **State transition:** REQUESTED → REJECTED

---

## Financial Adjustments

### POST /adjustments
Create a financial adjustment.
- **Body:** `{ invoiceId, type, amountPaisa, reason }`
- **Auth:** ADMIN

### GET /adjustments
List adjustments.
- **Auth:** ADMIN
- **Filters:** invoiceId, type, dateFrom, dateTo

---

## Reconciliation

### POST /reconciliation
Create reconciliation record.
- **Body:** `{ reconciliationDate, declaredCashPaisa, declaredDigitalPaisa, notes }`
- **Auth:** ADMIN

### GET /reconciliation
List reconciliation records.
- **Auth:** ADMIN
- **Filters:** status, dateFrom, dateTo

### GET /reconciliation/:id
Get reconciliation details.
- **Auth:** ADMIN

### POST /reconciliation/:id/resolve
Resolve discrepancy.
- **Auth:** ADMIN

---

## Daily Closing

### POST /daily-closings
Create daily closing.
- **Body:** `{ closingDate, declaredCashPaisa, declaredDigitalPaisa, notes }`
- **Auth:** ADMIN

### GET /daily-closings
List daily closings.
- **Auth:** ADMIN

### GET /daily-closings/:id
Get closing details.
- **Auth:** ADMIN

### POST /daily-closings/:id/close
Close the day.
- **Auth:** ADMIN

---

## Reports

### GET /reports/summary
Financial summary (date range).
- **Auth:** ADMIN
- **Query:** dateFrom, dateTo

### GET /reports/collections
Collection totals by method.
- **Auth:** ADMIN

### GET /reports/outstanding
Outstanding balance report with aging.
- **Auth:** ADMIN

### GET /reports/revenue
Revenue breakdown.
- **Auth:** ADMIN

### GET /reports/overdue
Overdue invoice report.
- **Auth:** ADMIN

---

## Audit

### GET /audit-logs
List audit logs.
- **Auth:** ADMIN
- **Filters:** userId, entityType, entityId, action, dateFrom, dateTo

---

## Settings

### GET /settings
Get all billing settings.
- **Auth:** ADMIN

### PATCH /settings
Update settings.
- **Body:** `{ key, value }`
- **Auth:** ADMIN

---

## Health

### GET /health
Health check (public).
- **Response:** `{ status: "ok", timestamp, database: "connected" }`

---

## Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful retrieval or update |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state violation) |
| 422 | Business rule violation |
| 429 | Rate limited |
| 500 | Internal server error |
