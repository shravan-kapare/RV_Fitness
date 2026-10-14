import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/config/database';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserRole, Gender, InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { generateInvoiceNumber, generatePaymentNumber, generateReceiptNumber } from '../src/shared/numberGenerator';

async function seedData() {
  console.log('🌱 Starting development seed...');

  // 1. Seed Membership Plans
  const plansData = [
    { name: 'Monthly Basic', description: 'Access to gym equipment and cardio area', durationDays: 30, pricePaisa: 150000n, taxRateBps: 1800 },
    { name: 'Quarterly Standard', description: '3 months access + free locker', durationDays: 90, pricePaisa: 400000n, taxRateBps: 1800 },
    { name: 'Half-Yearly Pro', description: '6 months access + diet consultation', durationDays: 180, pricePaisa: 750000n, taxRateBps: 1800 },
    { name: 'Annual Elite', description: 'Full year access + personal trainer trial + spa', durationDays: 365, pricePaisa: 1300000n, taxRateBps: 1800 },
  ];

  console.log('Seeding membership plans...');
  const plans = [];
  for (const p of plansData) {
    let plan = await prisma.membershipPlan.findFirst({ where: { name: p.name } });
    if (!plan) {
      plan = await prisma.membershipPlan.create({ data: p });
    }
    plans.push(plan);
  }
  console.log(`✅ ${plans.length} plans available.`);

  // 2. Ensure Admin Exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rvfitness.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await AuthService.hashPassword('Admin@123456');
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'RV Admin',
        role: UserRole.ADMIN,
      },
    });
  }

  // 3. Create Sample Members
  const sampleMembers = [
    { email: 'rohit.shinde@example.com', name: 'Rohit Shinde', phone: '9822012345', code: 'RVF-0001', gender: Gender.MALE },
    { email: 'sneha.patil@example.com', name: 'Sneha Patil', phone: '9822054321', code: 'RVF-0002', gender: Gender.FEMALE },
    { email: 'amit.kulkarni@example.com', name: 'Amit Kulkarni', phone: '9822098765', code: 'RVF-0003', gender: Gender.MALE },
  ];

  console.log('Seeding sample members...');
  const memberRecords = [];
  for (const sm of sampleMembers) {
    let user = await prisma.user.findUnique({ where: { email: sm.email } });
    if (!user) {
      const passwordHash = await AuthService.hashPassword('Member@123456');
      user = await prisma.user.create({
        data: {
          email: sm.email,
          passwordHash,
          fullName: sm.name,
          phone: sm.phone,
          role: UserRole.MEMBER,
        },
      });
    }

    let member = await prisma.member.findUnique({ where: { userId: user.id } });
    if (!member) {
      member = await prisma.member.create({
        data: {
          userId: user.id,
          memberCode: sm.code,
          gender: sm.gender,
          address: 'Narsobawadi, Kolhapur District, Maharashtra',
          joinDate: new Date(),
        },
      });
    }
    memberRecords.push(member);
  }
  console.log(`✅ ${memberRecords.length} members ready.`);

  // 4. Create Sample Invoices and Payments if none exist
  const invoiceCount = await prisma.invoice.count();
  if (invoiceCount === 0) {
    console.log('Creating initial sample invoices & payments...');

    // Invoice 1: Paid Annual Plan for Rohit
    const inv1Num = await generateInvoiceNumber();
    const inv1 = await prisma.invoice.create({
      data: {
        invoiceNumber: inv1Num,
        memberId: memberRecords[0].id,
        status: InvoiceStatus.PAID,
        subtotalPaisa: 1300000n,
        taxPaisa: 234000n,
        discountPaisa: 0n,
        totalPaisa: 1534000n,
        paidPaisa: 1534000n,
        dueDate: new Date(Date.now() + 15 * 86400000),
        issuedAt: new Date(),
        createdBy: admin.id,
        items: {
          create: [
            {
              description: 'Annual Elite Membership',
              quantity: 1,
              unitPricePaisa: 1300000n,
              taxRateBps: 1800,
              taxPaisa: 234000n,
              totalPaisa: 1534000n,
            },
          ],
        },
      },
    });

    const pay1Num = await generatePaymentNumber();
    const pay1 = await prisma.payment.create({
      data: {
        paymentNumber: pay1Num,
        invoiceId: inv1.id,
        memberId: memberRecords[0].id,
        amountPaisa: 1534000n,
        method: PaymentMethod.UPI,
        status: PaymentStatus.CONFIRMED,
        referenceNumber: 'UPI/2024/09871234',
        paymentDate: new Date(),
        recordedBy: admin.id,
        confirmedAt: new Date(),
      },
    });

    const rct1Num = await generateReceiptNumber();
    await prisma.receipt.create({
      data: {
        receiptNumber: rct1Num,
        paymentId: pay1.id,
        invoiceId: inv1.id,
        memberId: memberRecords[0].id,
        amountPaisa: 1534000n,
        issuedBy: admin.id,
      },
    });

    // Invoice 2: Partially Paid for Sneha
    const inv2Num = await generateInvoiceNumber();
    const inv2 = await prisma.invoice.create({
      data: {
        invoiceNumber: inv2Num,
        memberId: memberRecords[1].id,
        status: InvoiceStatus.PARTIALLY_PAID,
        subtotalPaisa: 400000n,
        taxPaisa: 72000n,
        discountPaisa: 0n,
        totalPaisa: 472000n,
        paidPaisa: 200000n,
        dueDate: new Date(Date.now() + 7 * 86400000),
        issuedAt: new Date(),
        createdBy: admin.id,
        items: {
          create: [
            {
              description: 'Quarterly Standard Membership',
              quantity: 1,
              unitPricePaisa: 400000n,
              taxRateBps: 1800,
              taxPaisa: 72000n,
              totalPaisa: 472000n,
            },
          ],
        },
      },
    });

    const pay2Num = await generatePaymentNumber();
    const pay2 = await prisma.payment.create({
      data: {
        paymentNumber: pay2Num,
        invoiceId: inv2.id,
        memberId: memberRecords[1].id,
        amountPaisa: 200000n,
        method: PaymentMethod.CASH,
        status: PaymentStatus.CONFIRMED,
        paymentDate: new Date(),
        recordedBy: admin.id,
        confirmedAt: new Date(),
      },
    });

    const rct2Num = await generateReceiptNumber();
    await prisma.receipt.create({
      data: {
        receiptNumber: rct2Num,
        paymentId: pay2.id,
        invoiceId: inv2.id,
        memberId: memberRecords[1].id,
        amountPaisa: 200000n,
        issuedBy: admin.id,
      },
    });

    // Invoice 3: Overdue Invoice for Amit
    const inv3Num = await generateInvoiceNumber();
    await prisma.invoice.create({
      data: {
        invoiceNumber: inv3Num,
        memberId: memberRecords[2].id,
        status: InvoiceStatus.ISSUED,
        subtotalPaisa: 150000n,
        taxPaisa: 27000n,
        discountPaisa: 0n,
        totalPaisa: 177000n,
        paidPaisa: 0n,
        dueDate: new Date(Date.now() - 10 * 86400000), // 10 days ago (overdue)
        issuedAt: new Date(Date.now() - 25 * 86400000),
        createdBy: admin.id,
        items: {
          create: [
            {
              description: 'Monthly Basic Membership',
              quantity: 1,
              unitPricePaisa: 150000n,
              taxRateBps: 1800,
              taxPaisa: 27000n,
              totalPaisa: 177000n,
            },
          ],
        },
      },
    });

    console.log('✅ Sample invoices and payments generated successfully.');
  }

  console.log('✨ Seed complete!');
}

seedData()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
