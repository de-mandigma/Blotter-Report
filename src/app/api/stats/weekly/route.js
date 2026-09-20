import { prisma, ensurePrismaConnected } from "@/lib";
import { NextResponse } from "next/server";

// Barangay 123 is in the Philippines (UTC+8, no DST) — day buckets must use
// Manila's calendar day, not the server's local timezone (UTC on Vercel),
// or events near midnight get attributed to the wrong day.
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

function manilaDateKey(instant) {
  return new Date(instant.getTime() + MANILA_OFFSET_MS)
    .toISOString()
    .split("T")[0];
}

export async function GET() {
  await ensurePrismaConnected();

  const now = new Date();
  const manilaNow = new Date(now.getTime() + MANILA_OFFSET_MS);
  const manilaMidnightTodayUTC = Date.UTC(
    manilaNow.getUTCFullYear(),
    manilaNow.getUTCMonth(),
    manilaNow.getUTCDate()
  );
  const todayStartInstant = manilaMidnightTodayUTC - MANILA_OFFSET_MS;

  const results = await Promise.all(
    [...Array(7)].map(async (_, i) => {
      const start = new Date(
        todayStartInstant - (6 - i) * 24 * 60 * 60 * 1000
      );
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      const [
        pendingComplaints,
        resolvedComplaints,
        resolvedBlotters,
        flaggedReports,
      ] = await Promise.all([
        prisma.complaint.count({
          where: {
            status: "PENDING",
            createdAt: { gte: start, lt: end },
          },
        }),
        prisma.complaint.count({
          where: {
            status: "RESOLVED",
            updatedAt: { gte: start, lt: end },
          },
        }),
        prisma.blotter.count({
          where: {
            status: "RESOLVED",
            updatedAt: { gte: start, lt: end },
          },
        }),
        prisma.complaint.count({
          where: {
            severity: { gte: 4 },
            status: { notIn: ["RESOLVED", "ESCALATED"] },
            createdAt: { gte: start, lt: end },
          },
        }),
      ]);

      return {
        date: manilaDateKey(start),
        pendingComplaints,
        resolvedCases: resolvedComplaints + resolvedBlotters,
        flaggedReports,
      };
    })
  );

  return NextResponse.json(results);
}
