import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create super admin
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@shram.com' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'superadmin@shram.com',
      phone: '9999999999',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create districts
  const district1 = await prisma.district.upsert({
    where: { code: 'MP001' },
    update: {},
    create: {
      stateName: 'Madhya Pradesh',
      districtName: 'Bhopal',
      code: 'MP001',
    },
  });

  const district2 = await prisma.district.upsert({
    where: { code: 'MP002' },
    update: {},
    create: {
      stateName: 'Madhya Pradesh',
      districtName: 'Indore',
      code: 'MP002',
    },
  });

  // Create questionnaire tiers
  await prisma.questionnaireTier.upsert({
    where: { tierCode: 'TIER_0' },
    update: {},
    create: {
      tierCode: 'TIER_0',
      title: 'Rural / Interior',
      locationType: 'Rural',
      description: 'Questionnaire for rural areas',
      isActive: true,
    },
  });

  await prisma.questionnaireTier.upsert({
    where: { tierCode: 'TIER_1' },
    update: {},
    create: {
      tierCode: 'TIER_1',
      title: 'Mid Region / City',
      locationType: 'Mid Region',
      description: 'Questionnaire for mid regions',
      isActive: true,
    },
  });

  await prisma.questionnaireTier.upsert({
    where: { tierCode: 'TIER_2' },
    update: {},
    create: {
      tierCode: 'TIER_2',
      title: 'Metro City',
      locationType: 'Metro',
      description: 'Questionnaire for metro cities',
      isActive: true,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });