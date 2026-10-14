import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const testDbUrl = process.env.DATABASE_URL_TEST || 'mysql://root:@localhost:3306/rvfitness_test?connection_limit=5';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

describe('MySQL 8.0 / InnoDB Transaction & Financial Integrity Tests', () => {
  let testUserId: string;
  let testMemberId: string;
  let testPlanId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Clean test database tables in reverse dependency order
    await prisma.receipt.deleteMany();
    await prisma.refund.deleteMany();
    await prisma.paymentAllocation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.financialAdjustment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.member.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    // Create base fixtures for test runs
    const user = await prisma.user.create({
      data: {
        email: `mysql.test.${Date.now()}@rvfitness.com`,
        passwordHash: '$2a$12$e8x/yU6yK65f2zU0vU.V5.H0hQzZ/7g4Gf8gE4vQ8j9kL0mN1oP2q',
        fullName: 'MySQL Test Admin',
        role: 'ADMIN',
      },
    });
    testUserId = user.id;

    const member = await prisma.member.create({
      data: {
        userId: testUserId,
        memberCode: `RV-TEST-${Date.now().toString().slice(-4)}`,
        address: 'Narsobawadi, Shirol, Maharashtra',
      },
    });
    testMemberId = member.id;

    const plan = await prisma.membershipPlan.create({
      data: {
        name: 'Quarterly Fitness Plan',
        durationDays: 90,
        pricePaisa: 450000n, // ₹4,500.00
        taxRateBps: 1800,    // 18% GST
      },
    });
    testPlanId = plan.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. commits invoice creation and items atomically inside a MySQL transaction', async () => {
    const invoiceNumber = `INV-MYSQL-${Date.now()}`;
    const subtotal = 450000n;
    const tax = 81000n; // 18% of 4500
    const total = 531000n;

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          memberId: testMemberId,
          status: 'ISSUED',
          subtotalPaisa: subtotal,
          taxPaisa: tax,
          discountPaisa: 0n,
          totalPaisa: total,
          paidPaisa: 0n,
          dueDate: new Date(Date.now() + 7 * 86400000),
          issuedAt: new Date(),
          createdBy: testUserId,
          items: {
            create: [
              {
                description: 'Quarterly Fitness Membership',
                quantity: 1,
                unitPricePaisa: subtotal,
                taxRateBps: 1800,
                taxPaisa: tax,
                discountPaisa: 0n,
                totalPaisa: total,
              },
            ],
          },
        },
        include: { items: true },
      });
      return invoice;
    });

    expect(result.id).toBeDefined();
    expect(result.invoiceNumber).toBe(invoiceNumber);
    expect(result.items).toHaveLength(1);
    expect(result.totalPaisa).toBe(531000n);

    // Verify persisted in MySQL
    const persisted = await prisma.invoice.findUnique({
      where: { id: result.id },
      include: { items: true },
    });
    expect(persisted).not.toBeNull();
    expect(persisted?.items[0].unitPricePaisa).toBe(450000n);
  });

  it('2. rolls back entire transaction if an error occurs mid-stream in MySQL', async () => {
    const doomedInvoiceNumber = `INV-FAIL-${Date.now()}`;

    await expect(
      prisma.$transaction(async (tx) => {
        await tx.invoice.create({
          data: {
            invoiceNumber: doomedInvoiceNumber,
            memberId: testMemberId,
            status: 'DRAFT',
            subtotalPaisa: 100000n,
            taxPaisa: 18000n,
            discountPaisa: 0n,
            totalPaisa: 118000n,
            paidPaisa: 0n,
            dueDate: new Date(),
            createdBy: testUserId,
          },
        });

        // Intentional error inside transaction to force rollback
        throw new Error('Simulated database write failure mid-transaction');
      })
    ).rejects.toThrow('Simulated database write failure mid-transaction');

    // Confirm that the invoice row was rolled back completely and does not exist in MySQL
    const checkInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: doomedInvoiceNumber },
    });
    expect(checkInvoice).toBeNull();
  });

  it('3. enforces unique constraints on invoice numbers in MySQL InnoDB', async () => {
    const duplicateNumber = `INV-UNIQUE-${Date.now()}`;

    // First insert succeeds
    await prisma.invoice.create({
      data: {
        invoiceNumber: duplicateNumber,
        memberId: testMemberId,
        status: 'ISSUED',
        subtotalPaisa: 200000n,
        taxPaisa: 36000n,
        discountPaisa: 0n,
        totalPaisa: 236000n,
        paidPaisa: 0n,
        dueDate: new Date(),
        createdBy: testUserId,
      },
    });

    // Duplicate insert MUST throw unique constraint violation (P2002)
    await expect(
      prisma.invoice.create({
        data: {
          invoiceNumber: duplicateNumber,
          memberId: testMemberId,
          status: 'ISSUED',
          subtotalPaisa: 200000n,
          taxPaisa: 36000n,
          discountPaisa: 0n,
          totalPaisa: 236000n,
          paidPaisa: 0n,
          dueDate: new Date(),
          createdBy: testUserId,
        },
      })
    ).rejects.toThrow();
  });

  it('4. enforces foreign key integrity in MySQL InnoDB (rejects orphaned references)', async () => {
    const bogusMemberId = '00000000-0000-0000-0000-000000000000';

    await expect(
      prisma.invoice.create({
        data: {
          invoiceNumber: `INV-ORPHAN-${Date.now()}`,
          memberId: bogusMemberId,
          status: 'DRAFT',
          subtotalPaisa: 100000n,
          taxPaisa: 0n,
          discountPaisa: 0n,
          totalPaisa: 100000n,
          paidPaisa: 0n,
          dueDate: new Date(),
          createdBy: testUserId,
        },
      })
    ).rejects.toThrow();
  });

  it('5. executes atomic payment recording, invoice balance update, and receipt voucher generation', async () => {
    // Create an invoice with ₹1,000.00 total
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-PMT-${Date.now()}`,
        memberId: testMemberId,
        status: 'ISSUED',
        subtotalPaisa: 100000n,
        taxPaisa: 0n,
        discountPaisa: 0n,
        totalPaisa: 100000n,
        paidPaisa: 0n,
        dueDate: new Date(),
        createdBy: testUserId,
      },
    });

    const paymentNumber = `PAY-MYSQL-${Date.now()}`;
    const receiptNumber = `REC-MYSQL-${Date.now()}`;
    const paymentAmount = 60000n; // Partial payment: ₹600.00

    // Atomic payment workflow in a MySQL transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create payment
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          memberId: testMemberId,
          amountPaisa: paymentAmount,
          method: 'UPI',
          status: 'CONFIRMED',
          referenceNumber: 'UPI-UTR-987654321',
          paymentDate: new Date(),
          recordedBy: testUserId,
          confirmedAt: new Date(),
        },
      });

      // 2. Create allocation
      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          amountPaisa: paymentAmount,
        },
      });

      // 3. Update invoice paid amount and status
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidPaisa: paymentAmount,
          status: 'PARTIALLY_PAID',
        },
      });

      // 4. Generate receipt
      await tx.receipt.create({
        data: {
          receiptNumber,
          paymentId: payment.id,
          invoiceId: invoice.id,
          memberId: testMemberId,
          amountPaisa: paymentAmount,
          issuedAt: new Date(),
          issuedBy: testUserId,
        },
      });
    });

    // Verification from MySQL database
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { payments: true, receipts: true },
    });

    expect(updatedInvoice?.status).toBe('PARTIALLY_PAID');
    expect(updatedInvoice?.paidPaisa).toBe(60000n);
    expect(updatedInvoice?.payments).toHaveLength(1);
    expect(updatedInvoice?.receipts).toHaveLength(1);
    expect(updatedInvoice?.receipts[0].receiptNumber).toBe(receiptNumber);

    const remainingBalance = Number(updatedInvoice!.totalPaisa) - Number(updatedInvoice!.paidPaisa);
    expect(remainingBalance).toBe(40000); // ₹400.00 remaining
  });
});
