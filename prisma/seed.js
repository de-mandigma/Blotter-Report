const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@Barangay123";

function trackingId(prefix) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${date}-${hex}`;
}

const ADMINS = [
  {
    num: 1001,
    name: "Ramon Villanueva",
    email: "captain@barangay123-demo.ph",
    phoneNumber: "09171234501",
    dashboardRole: "ADMIN",
    hierarchyRole: "CAPTAIN",
  },
  {
    num: 1002,
    name: "Corazon Santos",
    email: "secretary@barangay123-demo.ph",
    phoneNumber: "09171234502",
    dashboardRole: "ADMIN",
    hierarchyRole: "SECRETARY",
  },
  {
    num: 1003,
    name: "Bienvenido Cruz",
    email: "kagawad@barangay123-demo.ph",
    phoneNumber: "09171234503",
    dashboardRole: "STAFF",
    hierarchyRole: "KAGAWAD",
  },
  {
    num: 1004,
    name: "Liza Manalo",
    email: "skchair@barangay123-demo.ph",
    phoneNumber: "09171234504",
    dashboardRole: "STAFF",
    hierarchyRole: "SK_CHAIR",
  },
  {
    num: 1005,
    name: "Ferdinand Reyes",
    email: "clerk@barangay123-demo.ph",
    phoneNumber: "09171234505",
    dashboardRole: "STAFF",
    hierarchyRole: "CLERK",
  },
  {
    num: 1006,
    name: "Marites Aquino",
    email: "tanod@barangay123-demo.ph",
    phoneNumber: "09171234506",
    dashboardRole: "STAFF",
    hierarchyRole: "TANOD",
  },
];

const COMPLAINANTS = [
  {
    firstName: "Nestor",
    lastName: "Ramirez",
    fullAddress: "123 Sampaguita St., Zone 3, Barangay 123",
    phoneNumber: "09281110001",
    residencyProof: "UTILITY_BILL",
  },
  {
    firstName: "Aling",
    lastName: "Fely",
    fullAddress: "45 Ilang-Ilang St., Zone 1, Barangay 123",
    phoneNumber: "09281110002",
    residencyProof: "ID",
  },
  {
    firstName: "Jomar",
    lastName: "Dizon",
    fullAddress: "78 Rosal St., Zone 2, Barangay 123",
    phoneNumber: "09281110003",
    residencyProof: "ID",
  },
  {
    firstName: "Divina",
    lastName: "Bautista",
    fullAddress: "12 Kalachuchi St., Zone 4, Barangay 123",
    phoneNumber: "09281110004",
    residencyProof: "UTILITY_BILL",
  },
];

async function main() {
  await prisma.barangay.upsert({
    where: { id: "barangay-demo" },
    update: {},
    create: {
      id: "barangay-demo",
      name: "Barangay 123 (Demo)",
      location: "Tondo, Manila",
      address: "Zone 10, District 1, Manila City",
      hotline: "(02) 8765 4321",
      email: "barangay123@tondo.gov.ph",
      officeHours: "Monday–Friday, 8:00 AM to 5:00 PM",
    },
  });

  const admins = [];
  for (const a of ADMINS) {
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    const admin = await prisma.admin.upsert({
      where: { id: `ADM${a.num}` },
      update: {},
      create: {
        id: `ADM${a.num}`,
        name: a.name,
        email: a.email,
        phoneNumber: a.phoneNumber,
        password,
        dashboardRole: a.dashboardRole,
        hierarchyRole: a.hierarchyRole,
      },
    });
    admins.push(admin);
  }

  const complainants = [];
  for (const c of COMPLAINANTS) {
    const complainant = await prisma.complainant.upsert({
      where: { phoneNumber: c.phoneNumber },
      update: {},
      create: c,
    });
    complainants.push(complainant);
  }

  const complaintSeeds = [
    {
      complainant: complainants[0],
      category: "NOISE_COMPLAINT",
      description:
        "Videoke noise from a neighboring house past midnight on weekdays, ongoing for two weeks.",
      status: "PENDING",
      severity: 2,
    },
    {
      complainant: complainants[1],
      category: "PROPERTY_DAMAGE",
      description:
        "Fence damaged by a delivery truck backing into the complainant's property.",
      status: "IN_PROGRESS",
      severity: 3,
      reviewedByAdmin: admins[2],
    },
    {
      complainant: complainants[2],
      category: "HARASSMENT",
      description:
        "Repeated verbal harassment from a neighbor over a shared driveway dispute.",
      status: "ESCALATED",
      severity: 4,
      reviewedByAdmin: admins[0],
      escalatedAt: new Date(),
    },
    {
      complainant: complainants[3],
      category: "VANDALISM",
      description: "Graffiti sprayed on the barangay covered court wall.",
      status: "RESOLVED",
      severity: 2,
      reviewedByAdmin: admins[1],
    },
    {
      complainant: complainants[0],
      category: "OTHER",
      description: "Duplicate report of an earlier resolved noise concern.",
      status: "REJECTED",
      severity: 1,
      reviewedByAdmin: admins[1],
      deniedAt: new Date(),
    },
  ];

  for (const c of complaintSeeds) {
    await prisma.complaint.create({
      data: {
        trackingId: trackingId("COMP"),
        description: c.description,
        category: c.category,
        incidentDateTime: new Date(),
        status: c.status,
        severity: c.severity,
        complainantId: c.complainant.id,
        escalatedAt: c.escalatedAt,
        deniedAt: c.deniedAt,
        reviewedByAdminId: c.reviewedByAdmin ? c.reviewedByAdmin.id : undefined,
        events: {
          create: [
            {
              action: `Complaint filed and set to ${c.status}`,
              adminId: c.reviewedByAdmin ? c.reviewedByAdmin.id : undefined,
            },
          ],
        },
      },
    });
  }

  const blotterSeeds = [
    {
      complainant: complainants[1],
      category: "DISTURBANCE_OF_PEACE",
      description:
        "Loud altercation between two households reported by multiple neighbors.",
      status: "FILED",
    },
    {
      complainant: complainants[2],
      category: "TRESPASSING",
      description:
        "Unknown individual repeatedly entering a residential yard at night.",
      status: "UNDER_MEDIATION",
      updatedByAdmin: admins[3],
    },
    {
      complainant: complainants[3],
      category: "THEFT_OR_BURGLARY",
      description: "Reported theft of a bicycle from an open garage.",
      status: "RESOLVED",
      updatedByAdmin: admins[0],
      resolvedAt: new Date(),
    },
    {
      complainant: complainants[0],
      category: "TRAFFIC_INCIDENT",
      description: "Minor collision between a tricycle and a parked vehicle.",
      status: "REFERRED",
      updatedByAdmin: admins[1],
    },
  ];

  for (const b of blotterSeeds) {
    await prisma.blotter.create({
      data: {
        trackingId: trackingId("BLOT"),
        description: b.description,
        category: b.category,
        incidentDateTime: new Date(),
        status: b.status,
        complainantId: b.complainant.id,
        resolvedAt: b.resolvedAt,
        updatedByAdminId: b.updatedByAdmin ? b.updatedByAdmin.id : undefined,
        events: {
          create: [
            {
              action: `Blotter filed and set to ${b.status}`,
              adminId: b.updatedByAdmin ? b.updatedByAdmin.id : admins[0].id,
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Demo password for all admin accounts: ${DEMO_PASSWORD}`);
  console.table(
    ADMINS.map((a) => ({
      adminId: `ADM${a.num}`,
      hierarchyRole: a.hierarchyRole,
      dashboardRole: a.dashboardRole,
    }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
