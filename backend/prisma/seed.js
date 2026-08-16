require('dotenv').config();

const bcrypt = require('bcrypt');
const {
  PrismaClient,
  Role,
  Gender,
  VerificationStatus,
  Category,
  Urgency,
  RequestStatus,
} = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  await prisma.volunteerVerification.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.requesterProfile.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const dummyHash = await bcrypt.hash('password123', saltRounds);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.requester@example.com',
        name: 'Alice Johnson',
        passwordHash: dummyHash,
        role: Role.REQUESTER,
        phone: '415-555-0101',
        dob: new Date('1985-04-12'),
        gender: Gender.FEMALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'bob.requester@example.com',
        name: 'Bob Martinez',
        passwordHash: dummyHash,
        role: Role.REQUESTER,
        phone: '415-555-0102',
        dob: new Date('1978-09-23'),
        gender: Gender.MALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'carol.requester@example.com',
        name: 'Carol Williams',
        passwordHash: dummyHash,
        role: Role.REQUESTER,
        phone: '415-555-0103',
        dob: new Date('1990-01-15'),
        gender: Gender.FEMALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'david.requester@example.com',
        name: 'David Lee',
        passwordHash: dummyHash,
        role: Role.REQUESTER,
        phone: '415-555-0104',
        dob: new Date('1969-07-08'),
        gender: Gender.MALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'emma.volunteer@example.com',
        name: 'Emma Garcia',
        passwordHash: dummyHash,
        role: Role.VOLUNTEER,
        phone: '415-555-0105',
        dob: new Date('1995-03-20'),
        gender: Gender.FEMALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'frank.volunteer@example.com',
        name: 'Frank Brown',
        passwordHash: dummyHash,
        role: Role.VOLUNTEER,
        phone: '415-555-0106',
        dob: new Date('1988-11-02'),
        gender: Gender.MALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'grace.volunteer@example.com',
        name: 'Grace Wilson',
        passwordHash: dummyHash,
        role: Role.VOLUNTEER,
        phone: '415-555-0107',
        dob: new Date('1992-06-17'),
        gender: Gender.FEMALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'henry.volunteer@example.com',
        name: 'Henry Davis',
        passwordHash: dummyHash,
        role: Role.VOLUNTEER,
        phone: '415-555-0108',
        dob: new Date('1983-12-30'),
        gender: Gender.MALE,
      },
    }),

    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        passwordHash: dummyHash,
        role: Role.ADMIN,
        phone: '415-555-0109',
        dob: new Date('1980-05-25'),
        gender: Gender.PREFER_NOT_TO_SAY,
      },
    }),
  ]);

  const [alice, bob, carol, david, emma, frank, grace, henry, admin] = users;

  await prisma.requesterProfile.createMany({
    data: [
      {
        userId: alice.id,
        address: '123 Main St',
        city: 'Daly City',
        bio: 'Looking for occasional help with errands.',
        emergencyContact: 'John Johnson - 415-555-0201',
      },
      {
        userId: bob.id,
        address: '456 Mission St',
        city: 'San Francisco',
        bio: 'Need occasional transportation assistance.',
        emergencyContact: 'Maria Martinez - 415-555-0202',
      },
      {
        userId: carol.id,
        address: '789 Hillside Ave',
        city: 'Daly City',
        bio: 'Could use some help around the house.',
        emergencyContact: 'Tom Williams - 415-555-0203',
      },
      {
        userId: david.id,
        address: '321 Lake Merced Blvd',
        city: 'Daly City',
        bio: 'Looking for help with errands and yard work.',
        emergencyContact: 'Susan Lee - 415-555-0204',
      },
    ],
  });

  await prisma.volunteerProfile.createMany({
    data: [
      {
        userId: emma.id,
        bio: 'Happy to help with groceries, errands, and transportation.',
        verificationStatus: VerificationStatus.APPROVED,
      },
      {
        userId: frank.id,
        bio: 'Experienced with yard work and household projects.',
        verificationStatus: VerificationStatus.APPROVED,
      },
      {
        userId: grace.id,
        bio: 'Available for companionship, meal prep, and pet care.',
        verificationStatus: VerificationStatus.APPROVED,
      },
      {
        userId: henry.id,
        bio: 'Tech enthusiast who enjoys helping people with computers.',
        verificationStatus: VerificationStatus.PENDING,
      },
    ],
  });

  await prisma.volunteerVerification.createMany({
    data: [
      {
        volunteerId: emma.id,
        status: VerificationStatus.APPROVED,
        reviewedBy: admin.id,
        reviewedAt: new Date('2026-07-20'),
        notes: 'Identity verified.',
      },
      {
        volunteerId: frank.id,
        status: VerificationStatus.APPROVED,
        reviewedBy: admin.id,
        reviewedAt: new Date('2026-07-22'),
        notes: 'Identity and references verified.',
      },
      {
        volunteerId: grace.id,
        status: VerificationStatus.APPROVED,
        reviewedBy: admin.id,
        reviewedAt: new Date('2026-07-25'),
        notes: 'Identity verified.',
      },
      {
        volunteerId: henry.id,
        status: VerificationStatus.PENDING,
        reviewedBy: null,
        notes: 'Awaiting verification.',
      },
    ],
  });

  await prisma.helpRequest.createMany({
    data: [
      {
        requesterId: alice.id,
        volunteerId: null,
        title: 'Need help picking up groceries',
        category: Category.GROCERY,
        urgency: Urgency.HIGH,
        scheduledAt: new Date('2026-08-18T10:00:00'),
        address: '123 Main St, Daly City, CA',
        latitude: 37.6879,
        longitude: -122.4702,
        description: 'Need someone to pick up groceries from the nearby store.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-15T10:30:00'),
      },

      {
        requesterId: alice.id,
        volunteerId: emma.id,
        title: 'Ride to doctor appointment',
        category: Category.TRANSPORTATION,
        urgency: Urgency.HIGH,
        scheduledAt: new Date('2026-08-19T09:00:00'),
        address: '455 Mission St, San Francisco, CA',
        latitude: 37.7897,
        longitude: -122.4009,
        description: 'Need transportation to a medical appointment.',
        status: RequestStatus.ACCEPTED,
        createdAt: new Date('2026-08-12T14:00:00'),
      },

      {
        requesterId: alice.id,
        volunteerId: frank.id,
        title: 'Help with yard work',
        category: Category.YARD_WORK,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-20T13:00:00'),
        address: '123 Main St, Daly City, CA',
        latitude: 37.6879,
        longitude: -122.4702,
        description: 'Need help trimming bushes and cleaning up the yard.',
        status: RequestStatus.ACCEPTED,
        createdAt: new Date('2026-08-10T09:15:00'),
      },

      {
        requesterId: alice.id,
        volunteerId: null,
        title: 'Computer setup assistance',
        category: Category.TECH_SUPPORT,
        urgency: Urgency.LOW,
        scheduledAt: new Date('2026-08-23T15:00:00'),
        address: '123 Main St, Daly City, CA',
        latitude: 37.6879,
        longitude: -122.4702,
        description: 'Need help setting up a new laptop.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-14T16:45:00'),
      },

      {
        requesterId: bob.id,
        volunteerId: grace.id,
        title: 'Help preparing meals',
        category: Category.MEAL_PREP,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-21T11:00:00'),
        address: '456 Mission St, San Francisco, CA',
        latitude: 37.7898,
        longitude: -122.401,
        description: 'Looking for assistance preparing several meals.',
        status: RequestStatus.ACCEPTED,
        createdAt: new Date('2026-08-09T11:20:00'),
      },

      {
        requesterId: bob.id,
        volunteerId: null,
        title: 'Dog walking assistance',
        category: Category.PET_CARE,
        urgency: Urgency.LOW,
        scheduledAt: new Date('2026-08-22T08:00:00'),
        address: '456 Mission St, San Francisco, CA',
        latitude: 37.7898,
        longitude: -122.401,
        description: 'Need someone to walk my dog.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-15T08:00:00'),
      },

      {
        requesterId: bob.id,
        volunteerId: frank.id,
        title: 'Help moving furniture',
        category: Category.HOUSEHOLD_CHORES,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-11T13:00:00'),
        address: '456 Mission St, San Francisco, CA',
        latitude: 37.7898,
        longitude: -122.401,
        description: 'Need help moving a few pieces of furniture.',
        status: RequestStatus.COMPLETED,
        createdAt: new Date('2026-07-30T10:00:00'),
        completedAt: new Date('2026-08-11T16:00:00'),
      },

      {
        requesterId: carol.id,
        volunteerId: null,
        title: 'Prescription pickup',
        category: Category.MEDICAL_ERRAND,
        urgency: Urgency.HIGH,
        scheduledAt: new Date('2026-08-17T14:00:00'),
        address: '789 Hillside Ave, Daly City, CA',
        latitude: 37.6938,
        longitude: -122.463,
        description: 'Need help picking up a prescription from the pharmacy.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-16T08:30:00'),
      },

      {
        requesterId: carol.id,
        volunteerId: grace.id,
        title: 'Someone to chat with',
        category: Category.COMPANIONSHIP,
        urgency: Urgency.LOW,
        scheduledAt: new Date('2026-08-24T16:00:00'),
        address: '789 Hillside Ave, Daly City, CA',
        latitude: 37.6938,
        longitude: -122.463,
        description: 'Looking for some friendly company and conversation.',
        status: RequestStatus.ACCEPTED,
        createdAt: new Date('2026-08-13T12:00:00'),
      },

      {
        requesterId: carol.id,
        volunteerId: null,
        title: 'Help cleaning the house',
        category: Category.HOUSEHOLD_CHORES,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-25T10:00:00'),
        address: '789 Hillside Ave, Daly City, CA',
        latitude: 37.6938,
        longitude: -122.463,
        description: 'Need help with some basic household cleaning.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-15T18:00:00'),
      },

      {
        requesterId: david.id,
        volunteerId: emma.id,
        title: 'Grocery delivery',
        category: Category.GROCERY,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-18T17:00:00'),
        address: '321 Lake Merced Blvd, Daly City, CA',
        latitude: 37.711,
        longitude: -122.485,
        description: 'Need help getting groceries delivered.',
        status: RequestStatus.ACCEPTED,
        createdAt: new Date('2026-08-13T09:00:00'),
      },

      {
        requesterId: david.id,
        volunteerId: null,
        title: 'Lawn mowing',
        category: Category.YARD_WORK,
        urgency: Urgency.LOW,
        scheduledAt: new Date('2026-08-26T09:00:00'),
        address: '321 Lake Merced Blvd, Daly City, CA',
        latitude: 37.711,
        longitude: -122.485,
        description: 'Need help mowing the lawn.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-14T13:30:00'),
      },

      {
        requesterId: david.id,
        volunteerId: frank.id,
        title: 'Assemble a bookshelf',
        category: Category.HOUSEHOLD_CHORES,
        urgency: Urgency.LOW,
        scheduledAt: new Date('2026-08-05T14:00:00'),
        address: '321 Lake Merced Blvd, Daly City, CA',
        latitude: 37.711,
        longitude: -122.485,
        description: 'Need help assembling a new bookshelf.',
        status: RequestStatus.COMPLETED,
        createdAt: new Date('2026-07-25T10:00:00'),
        completedAt: new Date('2026-08-05T16:00:00'),
      },

      {
        requesterId: alice.id,
        volunteerId: null,
        title: 'Help with meal preparation',
        category: Category.MEAL_PREP,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-27T11:30:00'),
        address: '123 Main St, Daly City, CA',
        latitude: 37.6879,
        longitude: -122.4702,
        description: 'Need help preparing meals for the week.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-16T09:15:00'),
      },

      {
        requesterId: bob.id,
        volunteerId: null,
        title: 'Help with a technology issue',
        category: Category.TECH_SUPPORT,
        urgency: Urgency.HIGH,
        scheduledAt: new Date('2026-08-17T18:00:00'),
        address: '456 Mission St, San Francisco, CA',
        latitude: 37.7898,
        longitude: -122.401,
        description: 'Having trouble connecting my computer to the internet.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-16T11:00:00'),
      },

      {
        requesterId: carol.id,
        volunteerId: null,
        title: 'Pet sitting needed',
        category: Category.PET_CARE,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-29T09:00:00'),
        address: '789 Hillside Ave, Daly City, CA',
        latitude: 37.6938,
        longitude: -122.463,
        description: 'Need someone to look after my cat for a few hours.',
        status: RequestStatus.PENDING,
        createdAt: new Date('2026-08-15T15:00:00'),
      },

      {
        requesterId: david.id,
        volunteerId: null,
        title: 'Ride to grocery store',
        category: Category.TRANSPORTATION,
        urgency: Urgency.MEDIUM,
        scheduledAt: new Date('2026-08-30T10:00:00'),
        address: '321 Lake Merced Blvd, Daly City, CA',
        latitude: 37.711,
        longitude: -122.485,
        description: 'Looking for a ride to the grocery store and back.',
        status: RequestStatus.CANCELLED,
        createdAt: new Date('2026-08-01T10:00:00'),
      },

      {
        requesterId: alice.id,
        volunteerId: emma.id,
        title: 'Help picking up household supplies',
        category: Category.OTHER,
        urgency: Urgency.LOW,
        scheduledAt: new Date('2026-08-07T12:00:00'),
        address: '123 Main St, Daly City, CA',
        latitude: 37.6879,
        longitude: -122.4702,
        description: 'Need help picking up a few household supplies.',
        status: RequestStatus.COMPLETED,
        createdAt: new Date('2026-07-28T10:00:00'),
        completedAt: new Date('2026-08-07T14:00:00'),
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
