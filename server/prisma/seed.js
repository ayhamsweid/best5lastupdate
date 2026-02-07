const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'ayham@best5.com.tr';
  const password = '12345@Ayham';
  const passwordHash = await bcrypt.hash(password, 10);

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
