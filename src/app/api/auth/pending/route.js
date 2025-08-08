import { NextResponse } from "next/server";
import { ensurePrismaConnected, prisma } from "@/lib";

export async function GET() {
  try {
    await ensurePrismaConnected;

    const pendingAdmins = await prisma.pendingAdmin.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: pendingAdmins,
    });
  } catch (err) {
    console.error("Error fetching pending admins:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending admins." },
      { status: 500 }
    );
  }
}
