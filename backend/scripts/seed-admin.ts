import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/config/database';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserRole } from '@prisma/client';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@rvfitness.com';
  const password = process.env.ADMIN_PASSWORD || 'RvFitnessAdmin@2024';
  const fullName = process.env.ADMIN_NAME || 'RV Fitness Super Admin';

  console.log(`Checking for existing admin user: ${email}...`);

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    console.log(`✅ Admin user with email ${email} already exists (ID: ${existing.id}).`);
    return;
  }

  console.log(`Creating initial admin user...`);
  const passwordHash = await AuthService.hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Initial Admin created successfully!`);
  console.log(`   ID:    ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name:  ${admin.fullName}`);
  console.log(`   Role:  ${admin.role}`);
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Failed to seed initial admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
