const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD');
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const email2 = process.env.SEED_SECOND_ADMIN_EMAIL;
  const password2 = process.env.SEED_SECOND_ADMIN_PASSWORD;
  const hasSecondAdmin = Boolean(email2 && password2);
  const passwordHash2 = hasSecondAdmin ? await bcrypt.hash(password2, 10) : null;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      full_name: 'Ayham Sweid',
      role: UserRole.ADMIN,
      is_active: true,
      password_hash: passwordHash
    },
    create: {
      full_name: 'Ayham Sweid',
      email,
      role: UserRole.ADMIN,
      is_active: true,
      password_hash: passwordHash
    }
  });

  console.log('Seeded admin user:', user.email);
  if (hasSecondAdmin) {
    const user2 = await prisma.user.upsert({
      where: { email: email2 },
      update: {
        full_name: 'Second Admin',
        role: UserRole.ADMIN,
        is_active: true,
        password_hash: passwordHash2
      },
      create: {
        full_name: 'Second Admin',
        email: email2,
        role: UserRole.ADMIN,
        is_active: true,
        password_hash: passwordHash2
      }
    });
    console.log('Seeded admin user:', user2.email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
