import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Calendar dates (due dates, viewing dates) are stored as UTC midnight,
// matching what the API saves for a "YYYY-MM-DD" input.
function calendarDate(daysFromToday: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date;
}

async function main() {
  // Deploys run the seed on every start with --if-empty, so it only fills a
  // brand-new database and never wipes real data.
  if (process.argv.includes('--if-empty') && (await prisma.user.count()) > 0) {
    console.log('Database already has data; skipping seed.');
    return;
  }

  console.log('Seeding database...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.unitPhoto.deleteMany();
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@raresidence.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+1234567890',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create sample units
  const unit1 = await prisma.unit.create({
    data: {
      name: 'Luxury Suite A',
      description:
        'A beautifully designed luxury suite with panoramic city views, modern furnishings, and premium amenities.',
      address: '123 Main Street, Suite 101, Metro City',
      priceCents: 250000, // $2,500.00
      bedrooms: 2,
      bathrooms: 2,
      area: 95.0,
      status: 'AVAILABLE',
      amenities: JSON.stringify([
        'WiFi',
        'Air Conditioning',
        'Parking',
        'Pool Access',
        'Gym',
      ]),
    },
  });
  console.log(`Created unit: ${unit1.name}`);

  const unit2 = await prisma.unit.create({
    data: {
      name: 'Garden View Studio',
      description:
        'A cozy studio apartment overlooking the community garden. Perfect for single professionals or couples.',
      address: '456 Oak Avenue, Unit 205, Metro City',
      priceCents: 150000, // $1,500.00
      bedrooms: 1,
      bathrooms: 1,
      area: 45.0,
      status: 'OCCUPIED',
      amenities: JSON.stringify([
        'WiFi',
        'Air Conditioning',
        'Laundry',
        'Garden Access',
      ]),
    },
  });
  console.log(`Created unit: ${unit2.name}`);

  // Create a sample tenant for the occupied unit
  const tenantPassword = await bcrypt.hash('tenant123', 10);
  const tenant = await prisma.user.create({
    data: {
      email: 'tenant@example.com',
      password: tenantPassword,
      name: 'John Doe',
      phone: '+0987654321',
      role: 'TENANT',
      unitId: unit2.id,
    },
  });
  console.log(`Created tenant: ${tenant.email}`);

  // Create a sample payment for the tenant
  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      unitId: unit2.id,
      amountCents: 150000, // $1,500.00
      type: 'RENT',
      status: 'PENDING',
      dueDate: calendarDate(30),
    },
  });
  console.log('Created sample payment');

  // Create a sample booking
  await prisma.booking.create({
    data: {
      unitId: unit1.id,
      guestName: 'Jane Smith',
      guestEmail: 'jane@example.com',
      guestPhone: '+1122334455',
      preferredDate: calendarDate(7),
      message: 'Interested in viewing this unit next week.',
      status: 'PENDING',
    },
  });
  console.log('Created sample booking');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
