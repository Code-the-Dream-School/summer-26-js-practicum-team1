const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const SUPPORT_CATEGORIES = [
  { name: 'Groceries', description: 'Help with grocery shopping' },
  { name: 'Errands', description: 'General errands and pickups' },
  { name: 'Transport', description: 'Rides and transportation help' },
  { name: 'Tech help', description: 'Devices, apps, and tech support' },
  { name: 'Companionship', description: 'Social visits and company' },
  { name: 'Home help', description: 'Light help around the home' },
  { name: 'Other', description: 'Other kinds of support' },
];

async function main() {
  for (const category of SUPPORT_CATEGORIES) {
    await prisma.supportCategory.upsert({
      where: { name: category.name },
      create: category,
      update: { description: category.description },
    });
  }

  console.log(`Seeded ${SUPPORT_CATEGORIES.length} support categories`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
