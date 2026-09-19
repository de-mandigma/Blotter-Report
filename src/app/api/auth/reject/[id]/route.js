import { NextResponse } from "next/server";
import { ensurePrismaConnected, prisma } from "@/lib";

export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    await ensurePrismaConnected();

    const pending = await prisma.pendingAdmin.findUnique({ where: { id } });

    if (!pending) {
      return NextResponse.json(
        { error: "Pending admin not found." },
        { status: 404 }
      );
    }

    // Delete the pending admin
    await prisma.pendingAdmin.delete({ where: { id } });

    return NextResponse.json({ message: "Admin rejected." });
  } catch (err) {
    console.error("Rejection error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
