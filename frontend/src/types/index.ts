// User and Auth Types
export type UserRole = 'ADMIN' | 'MEMBER' | 'TRAINER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Member Types
export interface Member {
  id: string;
  userId: string;
  memberCode: string;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  address?: string | null;
  emergencyContact?: string | null;
  joinDate: string;
  photoUrl?: string | null;
  notes?: string | null;
  isActive: boolean;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Membership Plan Types
export interface MembershipPlan {
  id: string;
  name: string;
  description?: string | null;
  durationDays: number;
  pricePaisa: number;
  taxRateBps: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FROZEN';
  plan?: MembershipPlan;
  createdAt: string;
  updatedAt: string;
}

// Invoice Types
export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'VOID';

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  membershipId?: string | null;
  description: string;
  quantity: number;
  unitPricePaisa: number;
  taxRateBps: number;
  taxPaisa: number;
  discountPaisa: number;
  totalPaisa: number;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId: string;
  status: InvoiceStatus;
  subtotalPaisa: number;
  taxPaisa: number;
  discountPaisa: number;
  totalPaisa: number;
  paidPaisa: number;
  dueDate: string;
  issuedAt?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  createdBy: string;
  member?: Member;
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceItemData {
  membershipId?: string;
  description: string;
  quantity: number;
  unitPricePaisa: number;
  taxRateBps: number;
  discountPaisa?: number;
}

export interface CreateInvoiceData {
  memberId: string;
  dueDate: string;
  items: CreateInvoiceItemData[];
  notes?: string;
  internalNotes?: string;
}

export interface UpdateInvoiceData {
  dueDate?: string;
  items?: CreateInvoiceItemData[];
  notes?: string;
  internalNotes?: string;
}

// Payment Types
export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'CARD'
  | 'OTHER';

export type PaymentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REVERSED';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  memberId: string;
  amountPaisa: number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string | null;
  idempotencyKey?: string | null;
  paymentDate: string;
  notes?: string | null;
  recordedBy: string;
  confirmedAt?: string | null;
  invoice?: Invoice;
  member?: Member;
  receipt?: Receipt;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  invoiceId: string;
  amountPaisa: number;
  method: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  idempotencyKey?: string;
}

// Receipt Types
export interface Receipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  invoiceId: string;
  memberId: string;
  amountPaisa: number;
  issuedAt: string;
  issuedBy: string;
  pdfPath?: string | null;
  payment?: Payment;
  invoice?: Invoice;
  member?: Member;
  createdAt: string;
}

// Refund Types
export type RefundStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PROCESSED'
  | 'REJECTED';

export type RefundMethod =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'CARD'
  | 'ORIGINAL_METHOD'
  | 'OTHER';

export interface Refund {
  id: string;
  refundNumber: string;
  paymentId: string;
  invoiceId: string;
  memberId: string;
  amountPaisa: number;
  reason: string;
  status: RefundStatus;
  method: RefundMethod;
  referenceNumber?: string | null;
  requestedBy: string;
  processedBy?: string | null;
  processedAt?: string | null;
  payment?: Payment;
  invoice?: Invoice;
  member?: Member;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefundData {
  paymentId: string;
  amountPaisa: number;
  reason: string;
  method: RefundMethod;
}

// Financial Adjustments
export type AdjustmentType = 'CREDIT' | 'DEBIT' | 'WRITE_OFF' | 'CORRECTION';

export interface FinancialAdjustment {
  id: string;
  adjustmentNumber: string;
  invoiceId: string;
  type: AdjustmentType;
  amountPaisa: number;
  reason: string;
  performedBy: string;
  invoice?: Invoice;
  createdAt: string;
}

// Reconciliation
export type ReconciliationStatus = 'PENDING' | 'MATCHED' | 'DISCREPANCY' | 'RESOLVED';

export interface ReconciliationRecord {
  id: string;
  reconciliationDate: string;
  periodStart: string;
  periodEnd: string;
  recordedCashPaisa: number;
  recordedUpiPaisa: number;
  recordedCardPaisa: number;
  recordedBankPaisa: number;
  recordedOtherPaisa: number;
  recordedTotalPaisa: number;
  declaredCashPaisa?: number | null;
  declaredDigitalPaisa?: number | null;
  declaredTotalPaisa?: number | null;
  discrepancyPaisa?: number | null;
  status: ReconciliationStatus;
  notes?: string | null;
  performedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReconciliationData {
  reconciliationDate: string;
  declaredCashPaisa: number;
  declaredDigitalPaisa: number;
  notes?: string;
}

// Daily Closing
export type DailyClosingStatus = 'OPEN' | 'CLOSED' | 'VERIFIED';

export interface DailyClosing {
  id: string;
  closingDate: string;
  reconciliationId?: string | null;
  totalCollectionsPaisa: number;
  cashCollectionsPaisa: number;
  digitalCollectionsPaisa: number;
  invoicesIssued: number;
  invoicesPaid: number;
  refundsProcessedPaisa: number;
  declaredCashPaisa?: number | null;
  declaredDigitalPaisa?: number | null;
  discrepancyPaisa?: number | null;
  status: DailyClosingStatus;
  closedBy?: string | null;
  closedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyClosingData {
  closingDate: string;
  declaredCashPaisa: number;
  declaredDigitalPaisa: number;
  notes?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

// Settings
export interface GymSetting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenuePaisa: number;
  totalInvoicedPaisa?: number;
  totalOutstandingPaisa?: number;
  outstandingPaisa?: number;
  overdueCount?: number;
  overdueInvoicesCount?: number;
  overdueAmountPaisa?: number;
  todayCollectionsPaisa: number;
  totalInvoicesCount?: number;
  paidInvoicesCount?: number;
  collectionsByMethod?: {
    method: PaymentMethod;
    amountPaisa: number;
    count: number;
  }[];
  recentInvoices: Invoice[];
  recentPayments: Payment[];
}

export interface ReportSummary {
  dateFrom: string;
  dateTo: string;
  totalBilledPaisa: number;
  totalCollectedPaisa: number;
  totalOutstandingPaisa: number;
  totalRefundedPaisa: number;
  netRevenuePaisa: number;
  invoicesCount: number;
  paymentsCount: number;
  refundsCount: number;
}

export interface CollectionReport {
  dateFrom: string;
  dateTo: string;
  totalCollectionsPaisa: number;
  methods: {
    method: PaymentMethod;
    amountPaisa: number;
    count: number;
    percentage: number;
  }[];
}

export interface OutstandingAgingBucket {
  range: 'Current' | '1-30 days' | '31-60 days' | '61-90 days' | '90+ days';
  amountPaisa: number;
  invoiceCount: number;
  invoices: Invoice[];
}

export interface OutstandingReport {
  totalOutstandingPaisa: number;
  overdueCount: number;
  buckets: OutstandingAgingBucket[];
}

// Common Pagination & API
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

// Domain Extensions: Benefits & Trainers
export interface Benefit {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  category: string;
  createdAt: string;
}

export interface PlanBenefit {
  id: string;
  planId: string;
  benefitId: string;
  displayOrder: number;
  isIncluded: boolean;
  benefit: Benefit;
}

export interface Trainer {
  id: string;
  userId: string;
  specialization: string;
  bio?: string | null;
  experienceYears: number;
  certifications?: string | null;
  photoUrl?: string | null;
  rating: number;
  isAvailable: boolean;
  isPublished: boolean;
  displayOrder: number;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
}

// Attendance Types
export interface Attendance {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string | null;
  method: 'QR_SCAN' | 'MANUAL_DESK' | 'BIOMETRIC';
  status: 'PRESENT' | 'LATE' | 'EXCUSED';
  member?: Member;
}

export interface AttendanceQrToken {
  qrPayload: string;
  expiresAt: string;
  memberCode: string;
  memberName: string;
}

// Fitness Types
export interface FitnessAssessment {
  id: string;
  memberId: string;
  assessmentDate: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPct?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface FitnessGoal {
  id: string;
  memberId: string;
  goalType: string;
  targetValue?: string | null;
  targetDate?: string | null;
  status: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds?: number | null;
  orderIndex: number;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  dayTitle: string;
  restDay: boolean;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  trainerId: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  days: WorkoutDay[];
  trainer?: Trainer;
}

export interface DietMeal {
  id: string;
  mealName: string;
  foodItems: string;
  calories?: number | null;
  orderIndex: number;
}

export interface DietPlan {
  id: string;
  memberId: string;
  trainerId: string;
  title: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  guidelines?: string | null;
  isActive: boolean;
  meals: DietMeal[];
  trainer?: Trainer;
}

// Expenses
export type ExpenseCategory =
  | 'EQUIPMENT'
  | 'MAINTENANCE'
  | 'SALARY'
  | 'RENT'
  | 'UTILITIES'
  | 'MARKETING'
  | 'SUPPLEMENTS'
  | 'OTHER';

export interface Expense {
  id: string;
  expenseNumber: string;
  category: ExpenseCategory;
  title: string;
  description?: string | null;
  amountPaisa: number;
  expenseDate: string;
  paymentMethod: string;
  referenceNumber?: string | null;
  recordedBy: string;
  createdAt: string;
  recorder?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// CMS & Communications
export interface GymEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  location: string;
  bannerUrl?: string | null;
  isPublished: boolean;
}

export interface GalleryPost {
  id: string;
  title: string;
  category: 'TRANSFORMATION' | 'EQUIPMENT' | 'WORKOUT' | 'FACILITY' | 'COMMUNITY';
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export interface OfferCoupon {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface PublicHomeData {
  plans: (MembershipPlan & { planBenefits?: PlanBenefit[] })[];
  trainers: Trainer[];
  events: GymEvent[];
  gallery: GalleryPost[];
  offers: OfferCoupon[];
  settings: Record<string, string>;
}

