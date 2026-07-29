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

  const passwordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  console.log(`Admin user seeded: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
