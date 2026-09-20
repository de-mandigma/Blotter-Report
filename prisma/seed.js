const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo@Barangay123";

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

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

  // Complaints that stay complaints — never escalated into a blotter.
  const standaloneComplaintSeeds = [
    {
      complainant: complainants[0],
      category: "NOISE_COMPLAINT",
      description:
        "Sobrang lakas ng videoke ng kapitbahay hanggang madaling araw kahit weekdays, ilang beses na po ito sa loob ng dalawang linggo.",
      status: "PENDING",
      severity: 2,
      incidentDateTime: daysAgo(1),
    },
    {
      complainant: complainants[1],
      category: "PROPERTY_DAMAGE",
      description:
        "Fence damaged by a delivery truck backing into the complainant's property.",
      status: "IN_PROGRESS",
      severity: 3,
      reviewedByAdmin: admins[2],
      incidentDateTime: daysAgo(4),
    },
    {
      complainant: complainants[3],
      category: "VANDALISM",
      description: "Graffiti sprayed on the barangay covered court wall.",
      status: "RESOLVED",
      severity: 2,
      reviewedByAdmin: admins[1],
      incidentDateTime: daysAgo(21),
    },
    {
      complainant: complainants[0],
      category: "OTHER",
      description:
        "Same report lang po na dati nang na-resolve, na-double file lang po ng aming kapitbahay.",
      status: "REJECTED",
      severity: 1,
      reviewedByAdmin: admins[1],
      incidentDateTime: daysAgo(18),
      deniedAt: daysAgo(16),
    },
  ];

  for (const c of standaloneComplaintSeeds) {
    await prisma.complaint.create({
      data: {
        trackingId: trackingId("COMP"),
        description: c.description,
        category: c.category,
        incidentDateTime: c.incidentDateTime,
        status: c.status,
        severity: c.severity,
        complainantId: c.complainant.id,
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

  // Complaints escalated into blotters — every blotter here originates from
  // one of these, linked via Complaint.blotterId / Blotter.fromComplaint.
  const escalatedSeeds = [
    {
      complainant: complainants[1],
      category: "DISTURBANCE_OF_PEACE",
      description:
        "Loud altercation between two households reported by multiple neighbors.",
      severity: 3,
      incidentDateTime: daysAgo(9),
      escalatedAt: daysAgo(7),
      reviewedByAdmin: admins[0],
      blotterStatus: "FILED",
    },
    {
      complainant: complainants[2],
      category: "TRESPASSING",
      description:
        "May lalaking hindi kilala na paulit-ulit pumapasok sa bakuran namin tuwing gabi, sobrang nakakatakot na po lalo na may mga bata sa bahay.",
      severity: 3,
      incidentDateTime: daysAgo(13),
      escalatedAt: daysAgo(11),
      reviewedByAdmin: admins[0],
      blotterStatus: "UNDER_MEDIATION",
      updatedByAdmin: admins[3],
    },
    {
      complainant: complainants[3],
      category: "THEFT_OR_BURGLARY",
      description: "Reported theft of a bicycle from an open garage.",
      severity: 4,
      incidentDateTime: daysAgo(30),
      escalatedAt: daysAgo(28),
      reviewedByAdmin: admins[1],
      blotterStatus: "RESOLVED",
      updatedByAdmin: admins[0],
      resolvedAt: daysAgo(25),
    },
    {
      complainant: complainants[0],
      category: "TRAFFIC_INCIDENT",
      description:
        "Nabangga ng tricycle ang nakaparadang sasakyan sa kanto, walang nasugatan pero may sira sa bumper.",
      severity: 2,
      incidentDateTime: daysAgo(14),
      escalatedAt: daysAgo(13),
      reviewedByAdmin: admins[2],
      blotterStatus: "REFERRED",
      updatedByAdmin: admins[1],
    },
  ];

  for (const e of escalatedSeeds) {
    const complaint = await prisma.complaint.create({
      data: {
        trackingId: trackingId("COMP"),
        description: e.description,
        category: e.category,
        incidentDateTime: e.incidentDateTime,
        status: "ESCALATED",
        severity: e.severity,
        complainantId: e.complainant.id,
        escalatedAt: e.escalatedAt,
        reviewedByAdminId: e.reviewedByAdmin.id,
        events: {
          create: [
            {
              action: "Complaint filed and set to PENDING",
            },
            {
              action: "Complaint escalated to blotter",
              adminId: e.reviewedByAdmin.id,
            },
          ],
        },
      },
    });

    const blotter = await prisma.blotter.create({
      data: {
        trackingId: trackingId("BLOT"),
        description: e.description,
        category: e.category,
        incidentDateTime: e.incidentDateTime,
        status: e.blotterStatus,
        complainantId: e.complainant.id,
        resolvedAt: e.resolvedAt,
        updatedByAdminId: e.updatedByAdmin
          ? e.updatedByAdmin.id
          : e.reviewedByAdmin.id,
        events: {
          create: [
            {
              action: `Blotter opened from escalated complaint ${complaint.trackingId}, set to ${e.blotterStatus}`,
              adminId: e.reviewedByAdmin.id,
            },
          ],
        },
      },
    });

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: { blotterId: blotter.id },
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
