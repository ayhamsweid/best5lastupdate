const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'ayham@best5.com.tr';
  const password = '12345@Ayham';
  const passwordHash = await bcrypt.hash(password, 10);

  const email2 = 'kusayswed@gmail.com';
  const password2 = '123456';
  const passwordHash2 = await bcrypt.hash(password2, 10);

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

  const user2 = await prisma.user.upsert({
    where: { email: email2 },
    update: {
      full_name: 'Kusay Swed',
      role: UserRole.ADMIN,
      is_active: true,
      password_hash: passwordHash2
    },
    create: {
      full_name: 'Kusay Swed',
      email: email2,
      role: UserRole.ADMIN,
      is_active: true,
      password_hash: passwordHash2
    }
  });

  console.log('Seeded admin user:', user.email);
  console.log('Seeded admin user:', user2.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
