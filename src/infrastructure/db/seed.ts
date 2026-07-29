import { prisma } from './prisma';
import argon2 from 'argon2';
import 'dotenv/config';

async function main() {
  const adminEmail = process.env['ADMIN_EMAIL'];
  const adminPassword = process.env['ADMIN_PASSWORD'];

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not provided. Skipping admin seeder.');
    return;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  const passwordHash = await argon2.hash(adminPassword);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  console.log(`Admin user created: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
