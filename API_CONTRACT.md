# RV FITNESS — Complete REST API Contract

**Base URL:** `/api/v1`  
**Data Format:** JSON (`application/json`)  
**Authentication Scheme:** HTTP Bearer JWT (`Authorization: Bearer <token>`)  
**Currency Standard:** Minor units in Paisa (Integer BigInt, ₹1.00 = 100 paisa)  

---

## 1. Global Conventions & Envelope Format

### Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Paginated Response Envelope
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted payload failed schema validation",
    "details": [
      {
        "field": "pricePaisa",
        "message": "Expected positive integer minor units in paisa"
      }
    ]
  }
}
```

### Error Code Taxonomy
- `UNAUTHORIZED` (401): Missing or expired JWT token.
- `FORBIDDEN` (403): User lacks required role permissions.
- `NOT_FOUND` (404): Target entity does not exist.
- `VALIDATION_ERROR` (400): Zod validation failure.
- `BUSINESS_RULE_ERROR` (422): Violates gym operating constraints (e.g. refunding more than paid).
- `CONFLICT` (409): Duplicate code or active unexpired record.
- `INTERNAL_SERVER_ERROR` (500): Unhandled exception.

---

## 2. API Endpoint Matrix

### 2.1 Authentication & Profile (`/auth`, `/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates credentials, returns access & refresh tokens |
| `POST` | `/auth/register` | Public | Registers new member account (strictly `MEMBER` role) |
| `POST` | `/auth/refresh` | Public | Issues new access token via refresh token |
| `GET` | `/auth/me` | Authenticated | Returns current authenticated user and linked profile |
| `POST` | `/auth/logout` | Authenticated | Revokes current session token |
| `GET` | `/users` | `ADMIN` | Lists staff and member user accounts |
| `PATCH`| `/users/:id` | `ADMIN` | Updates user details or toggles active status |

### 2.2 Public Website & CMS (`/public`, `/cms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/public/plans` | Public | Returns published membership plans with ordered benefits |
| `GET` | `/public/trainers` | Public | Returns published trainer profiles, ratings, and bios |
| `GET` | `/public/facilities`| Public | Returns gym facility photos and equipment specifications |
| `GET` | `/public/events` | Public | Lists upcoming gym events and registration links |
| `GET` | `/public/gallery` | Public | Returns categorized gallery photography |
| `GET` | `/public/offers` | Public | Returns active promotional discount codes |
| `POST` | `/public/contact` | Public | Submits a contact inquiry form |
| `GET` | `/cms/inquiries` | `ADMIN` | Lists all received visitor contact inquiries |
| `PATCH`| `/cms/inquiries/:id`| `ADMIN` | Updates inquiry status (`NEW` $\rightarrow$ `READ` $\rightarrow$ `RESPONDED`) |
| `POST` | `/cms/events` | `ADMIN` | Creates a new gym event |
| `POST` | `/cms/gallery` | `ADMIN` | Adds a gallery item with category and image URL |
| `POST` | `/cms/offers` | `ADMIN` | Creates or activates a promotional discount coupon |

### 2.3 Membership Plans & Benefits (`/membership-plans`, `/benefits`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/membership-plans`| `ADMIN` | Lists all configured membership plans |
| `POST` | `/membership-plans`| `ADMIN` | Creates a plan with price, duration, and assigned benefits |
| `GET` | `/membership-plans/:id`| `ADMIN` | Gets plan details with benefits junction |
| `PATCH`| `/membership-plans/:id`| `ADMIN` | Updates price, duration, or benefits order |
| `DELETE`| `/membership-plans/:id`| `ADMIN` | Archives a plan (inactive; preserves historical data) |
| `GET` | `/benefits` | `ADMIN` | Lists reusable benefit catalog items |
| `POST` | `/benefits` | `ADMIN` | Creates a new reusable benefit (e.g. "Locker Facility") |

### 2.4 Memberships Lifecycle (`/memberships`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/memberships` | `ADMIN` | Lists all active/expired memberships with filters |
| `POST` | `/memberships` | `ADMIN` | Enrolls member with **plan snapshot** & generates invoice |
| `GET` | `/memberships/:id`| `ADMIN`, `MEMBER (Own)` | Returns subscription details, freeze logs, and snapshots |
| `POST` | `/memberships/:id/renew` | `ADMIN` | Renews subscription for next period without overwriting history |
| `POST` | `/memberships/:id/freeze`| `ADMIN` | Freezes membership with reason and adjusts `end_date` |
| `POST` | `/memberships/:id/cancel`| `ADMIN` | Cancels subscription with policy rationale |
| `GET` | `/memberships/expiring` | `ADMIN` | Lists memberships expiring in next 30, 15, 7, or 3 days |

### 2.5 Members & Trainers (`/members`, `/trainers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/members` | `ADMIN` | Searchable directory of members with codes and dues |
| `POST` | `/members` | `ADMIN` | Creates member profile linked to existing or new user |
| `GET` | `/members/:id` | `ADMIN`, `TRAINER (Assigned)` | Member profile with full history and goals |
| `PATCH`| `/members/:id` | `ADMIN` | Updates member personal info or notes |
| `POST` | `/members/:id/assign-trainer` | `ADMIN` | Assigns or reassigns personal trainer |
| `GET` | `/trainers` | `ADMIN` | Directory of trainers and workload statistics |
| `POST` | `/trainers` | `ADMIN` | Registers and provisions a trainer profile |
| `GET` | `/trainers/:id/members` | `ADMIN`, `TRAINER (Own)` | Lists members assigned to a specific trainer |

### 2.6 Attendance & Check-in (`/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/check-in` | `ADMIN`, `TRAINER` | Manual desk check-in by member ID |
| `GET` | `/attendance/qr-token` | `MEMBER (Own)` | Generates short-lived, rotating HMAC QR token for check-in |
| `POST` | `/attendance/scan` | `ADMIN`, `TRAINER` | Verifies and consumes QR token, recording check-in |
| `GET` | `/attendance/daily` | `ADMIN` | Daily roll-call log with timestamps and peak-hour analysis |
| `GET` | `/attendance/history/:memberId`| `ADMIN`, `TRAINER`, `MEMBER (Own)` | Attendance history for a member |

### 2.7 Fitness Assessments, Workouts & Diets (`/fitness`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/fitness/assessments` | `ADMIN`, `TRAINER` | Logs body measurements & calculates BMI |
| `GET` | `/fitness/assessments/:memberId`| `ADMIN`, `TRAINER`, `MEMBER (Own)` | Historical progress measurements and trends |
| `POST` | `/fitness/goals` | `ADMIN`, `TRAINER`, `MEMBER (Own)` | Sets or updates member fitness objective |
| `GET` | `/fitness/workouts/:memberId`| `ADMIN`, `TRAINER`, `MEMBER (Own)` | Returns active workout schedule and exercises |
| `POST` | `/fitness/workouts` | `ADMIN`, `TRAINER` | Creates custom workout plan with daily split |
| `GET` | `/fitness/diets/:memberId` | `ADMIN`, `TRAINER`, `MEMBER (Own)` | Returns active nutrition plan and meal splits |
| `POST` | `/fitness/diets` | `ADMIN`, `TRAINER` | Creates custom meal plan with calorie & macro goals |

### 2.8 Billing, Invoices, Payments & Receipts (`/invoices`, `/payments`, `/receipts`, `/refunds`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/invoices` | `ADMIN`, `MEMBER (Own)` | Lists tax invoices with status, dues, and dates |
| `POST` | `/invoices` | `ADMIN` | Creates invoice with dynamic line items & tax |
| `GET` | `/invoices/:id` | `ADMIN`, `MEMBER (Own)` | Full invoice document with GST and payments |
| `POST` | `/invoices/:id/issue`| `ADMIN` | Transitions `DRAFT` $\rightarrow$ `ISSUED` |
| `POST` | `/invoices/:id/cancel`| `ADMIN` | Cancels unpaid invoice |
| `GET` | `/payments` | `ADMIN`, `MEMBER (Own)` | Transaction ledger with method filters |
| `POST` | `/payments` | `ADMIN` | Records cash, UPI, card, or bank collection |
| `GET` | `/payments/:id` | `ADMIN`, `MEMBER (Own)` | Payment voucher with receipt link |
| `POST` | `/payments/:id/reverse` | `ADMIN` | Reverses payment and restores invoice due |
| `GET` | `/receipts` | `ADMIN`, `MEMBER (Own)` | Receipts repository with payment proofs |
| `GET` | `/receipts/:id/pdf` | `ADMIN`, `MEMBER (Own)` | Generates and streams official PDFKit receipt |
| `GET` | `/refunds` | `ADMIN` | Lists refund requests and status |
| `POST` | `/refunds` | `ADMIN` | Initiates refund request with audit reason |
| `POST` | `/refunds/:id/approve` | `ADMIN` | Approves refund request |
| `POST` | `/refunds/:id/process` | `ADMIN` | Disburses refund and updates ledger atomically |

### 2.9 Expenses, Reports & Closings (`/expenses`, `/reports`, `/daily-closings`, `/reconciliation`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/expenses` | `ADMIN` | Filterable log of operational expenses |
| `POST` | `/expenses` | `ADMIN` | Records expense voucher (Rent, Electricity, Maintenance) |
| `GET` | `/reports/summary` | `ADMIN` | Realized revenue, collected cash, refunds, net operating result |
| `GET` | `/reports/collections-by-method`| `ADMIN` | Breakdown by payment channel (Cash vs. UPI vs. Card) |
| `GET` | `/reports/outstanding` | `ADMIN` | Aging report (Current, 1-30d, 31-60d, 61-90d, 90+d) |
| `GET` | `/reports/pnl` | `ADMIN` | Net Operating Income: Collections minus operating expenses |
| `GET` | `/reports/attendance` | `ADMIN` | Attendance metrics, peak hours, and visit frequencies |
| `GET` | `/daily-closings` | `ADMIN` | Historical daily register closings |
| `POST` | `/daily-closings/close` | `ADMIN` | Submits declared cash/digital handovers & calculates variance |
| `POST` | `/reconciliation` | `ADMIN` | Audits system ledger against declared bank accounts |

### 2.10 Notifications, Audit & Settings (`/notifications`, `/audit-logs`, `/settings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | `ADMIN`, `MEMBER`, `TRAINER` | Returns in-app notifications for authenticated user |
| `POST` | `/notifications` | `ADMIN` | Broadcasts targeted alert (`ALL`, `EXPIRING`, `UNPAID`) |
| `PATCH`| `/notifications/:id/read` | Authenticated | Marks notification as read |
| `GET` | `/audit-logs` | `ADMIN` | Chronological audit trail with JSON payload diffs |
| `GET` | `/settings` | `ADMIN` | Returns gym profile, GSTIN, prefixes, and thresholds |
| `PATCH`| `/settings` | `ADMIN` | Updates system configuration parameters |
