import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSequentialAdminId } from "@/lib";

export async function POST(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    // Get the pending admin
    const pending = await prisma.pendingAdmin.findUnique({ where: { id } });

    if (!pending) {
      return NextResponse.json(
        { error: "Pending admin not found." },
        { status: 404 }
      );
    }

    const adminId = await generateSequentialAdminId();

    // Create the admin using the saved roles
    await prisma.admin.create({
      data: {
        id: adminId,
        name: pending.name,
        email: pending.email,
        phoneNumber: pending.phoneNumber,
        password: pending.password,
        dashboardRole: pending.dashboardRole,
        hierarchyRole: pending.hierarchyRole,
      },
    });

    await prisma.pendingAdmin.delete({ where: { id } });

    return NextResponse.json({
      message: "Admin approved.",
    });
  } catch (err) {
    console.error("Approval error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
