import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/config/database';
import { AuthService } from '../src/modules/auth/auth.service';
import {
  UserRole,
  Gender,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  AttendanceMethod,
  GoalType,
  GoalStatus,
  ExpenseCategory,
  GalleryCategory,
  DiscountType,
} from '@prisma/client';
import { generateInvoiceNumber, generatePaymentNumber, generateReceiptNumber } from '../src/shared/numberGenerator';

async function seedData() {
  console.log('🌱 Starting comprehensive RV Fitness platform seed...');

  // ==========================================
  // 1. Seed Reusable Benefits
  // ==========================================
  console.log('Seeding benefits catalog...');
  const benefitsCatalog = [
    { title: 'Full Gym Floor Access', description: 'Unlimited access to all equipment zones', iconName: 'Dumbbell' },
    { title: 'Cardio Theater & Treadmills', description: 'Commercial cardio equipment access', iconName: 'Activity' },
    { title: 'Free Locker & Key Facility', description: 'Secure day locker during workout', iconName: 'Lock' },
    { title: 'RO Pure Drinking Water', description: 'Clean chilled and room temperature water', iconName: 'Droplets' },
    { title: 'Personalized Workout Plan', description: 'Customized routine tailored to your goals', iconName: 'FileText' },
    { title: 'Diet & Nutrition Guidance', description: 'Macronutrient targets and meal splits', iconName: 'Apple' },
    { title: 'Monthly Body Composition & BMI', description: 'Weight, measurements, and progress audit', iconName: 'Scale' },
    { title: 'Steam Bath & Recovery Lounge', description: 'Post-workout recovery sessions', iconName: 'Sparkles' },
    { title: 'Priority Trainer Support', description: 'Dedicated personal trainer supervision', iconName: 'UserCheck' },
  ];

  const createdBenefits = [];
  for (const b of benefitsCatalog) {
    let benefit = await prisma.benefit.findFirst({ where: { title: b.title } });
    if (!benefit) {
      benefit = await prisma.benefit.create({ data: b });
    }
    createdBenefits.push(benefit);
  }
  console.log(`✅ ${createdBenefits.length} benefits ready.`);

  // ==========================================
  // 2. Seed Membership Plans & PlanBenefits
  // ==========================================
  console.log('Seeding membership plans & dynamic benefits...');
  const plansData = [
    {
      name: 'Monthly Basic',
      slug: 'monthly-basic',
      description: 'Ideal for short-term visitors and routine gym goers',
      durationDays: 30,
      pricePaisa: 150000n,
      taxRateBps: 1800,
      isPopular: false,
      displayOrder: 1,
      isPublished: true,
      benefitIndexes: [0, 1, 2, 3],
    },
    {
      name: 'Six Month Transformation',
      slug: 'six-month-transformation',
      description: 'Our most popular commitment for visible body recomposition',
      durationDays: 180,
      pricePaisa: 750000n,
      promotionalPricePaisa: 699900n,
      taxRateBps: 1800,
      isPopular: true,
      displayOrder: 2,
      isPublished: true,
      benefitIndexes: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      name: 'Yearly Elite Athlete',
      slug: 'yearly-elite-athlete',
      description: 'Comprehensive 12-month program with personal trainer support & steam',
      durationDays: 365,
      pricePaisa: 1300000n,
      promotionalPricePaisa: 1199900n,
      taxRateBps: 1800,
      isPopular: false,
      displayOrder: 3,
      isPublished: true,
      benefitIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
  ];

  const seededPlans = [];
  for (const p of plansData) {
    let plan = await prisma.membershipPlan.findUnique({ where: { slug: p.slug } });
    if (!plan) {
      plan = await prisma.membershipPlan.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          durationDays: p.durationDays,
          pricePaisa: p.pricePaisa,
          promotionalPricePaisa: p.promotionalPricePaisa,
          taxRateBps: p.taxRateBps,
          isPopular: p.isPopular,
          displayOrder: p.displayOrder,
          isPublished: p.isPublished,
        },
      });

      // Link benefits
      for (let i = 0; i < p.benefitIndexes.length; i++) {
        const bIdx = p.benefitIndexes[i];
        await prisma.planBenefit.create({
          data: {
            planId: plan.id,
            benefitId: createdBenefits[bIdx].id,
            displayOrder: i + 1,
            isIncluded: true,
          },
        });
      }
    }
    seededPlans.push(plan);
  }
  console.log(`✅ ${seededPlans.length} published membership plans configured.`);

  // ==========================================
  // 3. Ensure Admin Exists
  // ==========================================
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rvfitness.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await AuthService.hashPassword('Admin@123456');
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: 'RV Fitness Admin',
        phone: '9876543210',
        role: UserRole.ADMIN,
      },
    });
  }
  console.log(`✅ Admin account confirmed: ${admin.email}`);

  // ==========================================
  // 4. Seed Trainer Profile
  // ==========================================
  console.log('Seeding certified trainers...');
  const trainerEmail = 'trainer@rvfitness.com';
  let trainerUser = await prisma.user.findUnique({ where: { email: trainerEmail } });
  if (!trainerUser) {
    const passwordHash = await AuthService.hashPassword('Trainer@123456');
    trainerUser = await prisma.user.create({
      data: {
        email: trainerEmail,
        passwordHash,
        fullName: 'Vikram Salunkhe',
        phone: '9822199887',
        role: UserRole.TRAINER,
      },
    });
  }

  let trainer = await prisma.trainer.findUnique({ where: { userId: trainerUser.id } });
  if (!trainer) {
    trainer = await prisma.trainer.create({
      data: {
        userId: trainerUser.id,
        specialization: 'Strength & Conditioning, Hypertrophy & Powerlifting',
        bio: 'Senior trainer with 7+ years guiding athletes and lifestyle clients in Kolhapur district.',
        experienceYears: 7,
        certifications: 'K11 Master Trainer, CPR/AED Certified, Sports Nutritionist',
        photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        rating: 4.95,
        displayOrder: 1,
      },
    });
  }
  console.log(`✅ Trainer profile ready: ${trainerUser.fullName}`);

  // ==========================================
  // 5. Seed Members
  // ==========================================
  console.log('Seeding members...');
  const sampleMembers = [
    { email: 'rohit.shinde@example.com', name: 'Rohit Shinde', phone: '9822012345', code: 'RV-2026-0001', gender: Gender.MALE },
    { email: 'sneha.patil@example.com', name: 'Sneha Patil', phone: '9822054321', code: 'RV-2026-0002', gender: Gender.FEMALE },
    { email: 'amit.kulkarni@example.com', name: 'Amit Kulkarni', phone: '9822098765', code: 'RV-2026-0003', gender: Gender.MALE },
  ];

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
          trainerId: trainer.id,
          gender: sm.gender,
          address: 'Narsobawadi, Shirol, Kolhapur, Maharashtra 416104',
          joinDate: new Date(),
        },
      });
    }
    memberRecords.push(member);
  }
  console.log(`✅ ${memberRecords.length} members ready with trainer assignment.`);

  // ==========================================
  // 6. Seed Subscriptions with Plan Snapshots
  // ==========================================
  console.log('Seeding memberships with historical snapshots...');
  const activePlanYearly = seededPlans[2];
  const activePlanQuarterly = seededPlans[1];

  // Rohit's Yearly Membership
  const rohitMembership = await prisma.membership.create({
    data: {
      memberId: memberRecords[0].id,
      planId: activePlanYearly.id,
      planSnapshot: {
        name: activePlanYearly.name,
        pricePaisa: Number(activePlanYearly.pricePaisa),
        durationDays: activePlanYearly.durationDays,
        benefits: ['Full Gym Access', 'Locker', 'Diet Plan', 'Trainer Support'],
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 86400000),
      notes: 'Annual athlete registration',
    },
  });

  // Sneha's 6-Month Membership
  const snehaMembership = await prisma.membership.create({
    data: {
      memberId: memberRecords[1].id,
      planId: activePlanQuarterly.id,
      planSnapshot: {
        name: activePlanQuarterly.name,
        pricePaisa: Number(activePlanQuarterly.pricePaisa),
        durationDays: activePlanQuarterly.durationDays,
        benefits: ['Full Gym Access', 'Locker', 'Diet Guidance'],
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 86400000),
      notes: 'Transformation package',
    },
  });

  // ==========================================
  // 7. Seed Invoices, Payments & Receipts
  // ==========================================
  console.log('Seeding invoices and payment vouchers...');

  // Invoice 1: Rohit Paid in Full
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
            membershipId: rohitMembership.id,
            description: 'Yearly Elite Athlete Membership (12 Months)',
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
      referenceNumber: 'UPI/2026/8940210',
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

  // Invoice 2: Sneha Partially Paid
  const inv2Num = await generateInvoiceNumber();
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: inv2Num,
      memberId: memberRecords[1].id,
      status: InvoiceStatus.PARTIALLY_PAID,
      subtotalPaisa: 750000n,
      taxPaisa: 135000n,
      discountPaisa: 50100n, // promo discount
      totalPaisa: 834900n,
      paidPaisa: 400000n,
      dueDate: new Date(Date.now() + 7 * 86400000),
      issuedAt: new Date(),
      createdBy: admin.id,
      items: {
        create: [
          {
            membershipId: snehaMembership.id,
            description: 'Six Month Transformation Package',
            quantity: 1,
            unitPricePaisa: 750000n,
            taxRateBps: 1800,
            taxPaisa: 135000n,
            discountPaisa: 50100n,
            totalPaisa: 834900n,
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
      amountPaisa: 400000n,
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
      amountPaisa: 400000n,
      issuedBy: admin.id,
    },
  });

  // Invoice 3: Amit Overdue
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
      dueDate: new Date(Date.now() - 5 * 86400000), // 5 days overdue
      issuedAt: new Date(Date.now() - 20 * 86400000),
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

  // ==========================================
  // 8. Seed Attendance & QR Tokens
  // ==========================================
  console.log('Seeding attendance & QR check-in data...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.attendance.create({
    data: {
      memberId: memberRecords[0].id,
      date: today,
      checkInTime: new Date(Date.now() - 2 * 3600000),
      method: AttendanceMethod.QR_CODE,
      verifiedBy: admin.id,
      notes: 'Morning workout session',
    },
  });

  await prisma.attendance.create({
    data: {
      memberId: memberRecords[1].id,
      date: today,
      checkInTime: new Date(Date.now() - 1 * 3600000),
      method: AttendanceMethod.MANUAL_DESK,
      verifiedBy: admin.id,
      notes: 'Front counter verification',
    },
  });

  // ==========================================
  // 9. Seed Fitness Assessment & Workout / Diet
  // ==========================================
  console.log('Seeding fitness assessments & workout routines...');
  await prisma.fitnessAssessment.create({
    data: {
      memberId: memberRecords[0].id,
      recordedBy: admin.id,
      assessmentDate: new Date(),
      weightKg: 78.5,
      heightCm: 176.0,
      bmi: 25.34,
      bodyFatPct: 16.5,
      chestCm: 104.0,
      waistCm: 84.0,
      armsCm: 39.5,
      thighsCm: 59.0,
      notes: 'Good baseline strength. Focus on core stability and progressive overload.',
    },
  });

  await prisma.fitnessGoal.create({
    data: {
      memberId: memberRecords[0].id,
      goalType: GoalType.STRENGTH,
      targetValue: '120 kg Squat, 100 kg Bench Press',
      targetDate: new Date(Date.now() + 90 * 86400000),
      status: GoalStatus.IN_PROGRESS,
    },
  });

  const workout = await prisma.workoutPlan.create({
    data: {
      memberId: memberRecords[0].id,
      trainerId: trainer.id,
      title: 'Power & Hypertrophy 4-Day Split',
      description: 'Focus on heavy compound lifts followed by hypertrophy accessory exercises.',
      startDate: new Date(),
    },
  });

  const day1 = await prisma.workoutDay.create({
    data: {
      planId: workout.id,
      dayNumber: 1,
      dayTitle: 'Monday — Upper Body Strength',
      restDay: false,
    },
  });

  await prisma.workoutExercise.createMany({
    data: [
      { dayId: day1.id, exerciseName: 'Barbell Incline Bench Press', sets: 4, reps: '6-8 reps', restSeconds: 120, orderIndex: 1 },
      { dayId: day1.id, exerciseName: 'Barbell Bent Over Row', sets: 4, reps: '8-10 reps', restSeconds: 90, orderIndex: 2 },
      { dayId: day1.id, exerciseName: 'Overhead Dumbbell Shoulder Press', sets: 3, reps: '8-10 reps', restSeconds: 90, orderIndex: 3 },
      { dayId: day1.id, exerciseName: 'EZ-Bar Bicep Curls', sets: 3, reps: '10-12 reps', restSeconds: 60, orderIndex: 4 },
    ],
  });

  const diet = await prisma.dietPlan.create({
    data: {
      memberId: memberRecords[0].id,
      trainerId: trainer.id,
      title: 'High Protein Muscle Building Plan',
      dailyCalories: 2650,
      proteinGrams: 165,
      carbsGrams: 300,
      fatsGrams: 70,
      guidelines: 'Drink at least 4 liters of water daily. Take creatine monohydrate post-workout.',
    },
  });

  await prisma.dietMeal.createMany({
    data: [
      { dietPlanId: diet.id, mealName: 'Breakfast (8:00 AM)', foodItems: '4 whole eggs, 80g oats with milk, 1 banana, handful of almonds', calories: 650, orderIndex: 1 },
      { dietPlanId: diet.id, mealName: 'Lunch (1:30 PM)', foodItems: '200g grilled chicken/paneer, 1.5 cup brown rice, green salad, 1 bowl dal', calories: 750, orderIndex: 2 },
      { dietPlanId: diet.id, mealName: 'Pre-Workout (5:30 PM)', foodItems: '2 brown bread slices with peanut butter, black coffee', calories: 350, orderIndex: 3 },
      { dietPlanId: diet.id, mealName: 'Dinner (9:00 PM)', foodItems: '3 multigrain rotis, 150g grilled fish/soya chunks, steamed vegetables', calories: 600, orderIndex: 4 },
    ],
  });

  // ==========================================
  // 10. Seed Expenses, Events & Gallery
  // ==========================================
  console.log('Seeding operational expenses and public CMS data...');
  await prisma.expense.create({
    data: {
      expenseNumber: 'RV-EXP-2026-0001',
      category: ExpenseCategory.RENT,
      title: 'Facility Floor Lease — October 2026',
      description: 'Monthly commercial rental payment for Datta Mandir road premises',
      amountPaisa: 2500000n, // ₹25,000.00
      expenseDate: new Date(),
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: 'NEFT/SBI/992010',
      recordedBy: admin.id,
    },
  });

  await prisma.expense.create({
    data: {
      expenseNumber: 'RV-EXP-2026-0002',
      category: ExpenseCategory.ELECTRICITY,
      title: 'Commercial MSEDCL Power Bill',
      description: 'Electricity charges for AC units, lighting, and sound system',
      amountPaisa: 840000n, // ₹8,400.00
      expenseDate: new Date(),
      paymentMethod: 'UPI',
      referenceNumber: 'UPI/MSEDCL/10293',
      recordedBy: admin.id,
    },
  });

  // Events
  await prisma.gymEvent.create({
    data: {
      title: 'RV Fitness Narsobawadi Bench Press Challenge 2026',
      slug: 'bench-press-challenge-2026',
      description: 'Open strength competition across weight categories with trophies and free supplements for winners.',
      eventDate: new Date(Date.now() + 14 * 86400000),
      location: 'RV Fitness Heavy Iron Zone, Narsobawadi',
      isPublished: true,
    },
  });

  // Gallery
  await prisma.galleryPost.createMany({
    data: [
      {
        title: 'Heavy Iron Free Weights Zone',
        category: GalleryCategory.EQUIPMENT,
        imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop',
        caption: 'Full rack of Olympic barbells, calibrated steel plates, and custom dumbbells up to 50kg.',
        displayOrder: 1,
        isPublished: true,
      },
      {
        title: 'Cardio Theater & Treadmills',
        category: GalleryCategory.FACILITY,
        imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=800&auto=format&fit=crop',
        caption: 'High-end commercial treadmills, cross-trainers, and spin bikes with heart-rate telemetry.',
        displayOrder: 2,
        isPublished: true,
      },
      {
        title: 'Dedicated Squat & Deadlift Platforms',
        category: GalleryCategory.EQUIPMENT,
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        caption: 'Shock-absorbing deadlift platforms built for safe powerlifting and heavy pulls.',
        displayOrder: 3,
        isPublished: true,
      },
    ],
  });

  // Offers
  await prisma.offerCoupon.create({
    data: {
      code: 'DIWALI2026',
      title: 'Diwali Fitness Festival — Flat 15% Off',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 86400000),
      usageLimit: 50,
      isActive: true,
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      title: 'Welcome to RV Fitness Narsobawadi',
      message: 'Your member account is active. Use your personal QR code at the desk for seamless turnstile check-in.',
      type: 'GENERAL',
      targetType: 'ALL',
      isRead: false,
    },
  });

  // Settings
  await prisma.gymSetting.upsert({
    where: { key: 'GYM_NAME' },
    update: { value: 'RV Fitness' },
    create: { key: 'GYM_NAME', value: 'RV Fitness', description: 'Facility brand name' },
  });

  await prisma.gymSetting.upsert({
    where: { key: 'GYM_ADDRESS' },
    update: { value: 'Near Datta Mandir, Narsobawadi, Taluka Shirol, Kolhapur, Maharashtra 416104' },
    create: { key: 'GYM_ADDRESS', value: 'Near Datta Mandir, Narsobawadi, Taluka Shirol, Kolhapur, Maharashtra 416104' },
  });

  await prisma.gymSetting.upsert({
    where: { key: 'GSTIN' },
    update: { value: '27AABCR1234F1Z9' },
    create: { key: 'GSTIN', value: '27AABCR1234F1Z9' },
  });

  console.log('✨ Comprehensive RV Fitness platform seed successfully completed!');
}

seedData()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
