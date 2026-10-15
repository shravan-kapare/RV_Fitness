import { PrismaClient } from '@prisma/client';

async function migrateDb(url: string, name: string) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });
  console.log(`Checking ${name}...`);
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE members ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    console.log(`✅ Added onboarding_completed to ${name}.members`);
  } catch (err: any) {
    console.log(`${name} members note:`, err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE workout_exercises 
      ADD COLUMN target_muscle VARCHAR(50) NULL,
      ADD COLUMN required_equipment VARCHAR(100) NULL,
      ADD COLUMN alternative_exercise_name VARCHAR(255) NULL;
    `);
    console.log(`✅ Added columns to ${name}.workout_exercises`);
  } catch (err: any) {
    console.log(`${name} workout_exercises note:`, err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS equipment (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        target_muscle VARCHAR(50) NOT NULL,
        status ENUM('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_ORDER') DEFAULT 'OPERATIONAL',
        notes TEXT NULL,
        created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_eq_status (status),
        INDEX idx_eq_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(`✅ Ensured equipment table on ${name}`);
  } catch (err: any) {
    console.log(`${name} equipment note:`, err.message);
  }

  await prisma.$disconnect();
}

async function main() {
  await migrateDb('mysql://root:@localhost:3306/rvfitness_dev', 'rvfitness_dev');
  await migrateDb('mysql://root:@localhost:3306/rvfitness_test', 'rvfitness_test');
}

main().catch(console.error);
