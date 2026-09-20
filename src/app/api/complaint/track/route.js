import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decryptBuffer, bufferToBase64DataUrl } from "@/lib/complaint";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { trackingId: rawTrackingId } = await req.json();

    if (!rawTrackingId) {
      return NextResponse.json(
        { success: false, error: "Missing trackingId" },
        { status: 400 }
      );
    }

    // Tracking IDs are always displayed with a leading "#" (e.g. the
    // dashboard's Tracking ID column) — residents often copy that in too.
    const trackingId = rawTrackingId.trim().replace(/^#/, "");

    const complainantSelect = {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      phoneNumber: true,
      fullAddress: true,
      residencyProof: true,
      attachmentIDFront: true,
      attachmentIDBack: true,
      attachmentUtility: true,
    };

    let complaint = await prisma.complaint.findUnique({
      where: { trackingId },
      include: {
        complainant: { select: complainantSelect },
        attachments: { select: { id: true, file: true } },
        blotter: {
          include: {
            complainant: { select: complainantSelect },
            attachments: { select: { id: true, file: true } },
          },
        },
      },
    });

    // A complaint that's been escalated is tracked from then on as its
    // linked blotter — the resident's original tracking ID still resolves,
    // but shows the blotter's current status, not the stale complaint one.
    if (complaint?.blotter) {
      complaint = complaint.blotter;
    }

    if (!complaint) {
      complaint = await prisma.blotter.findUnique({
        where: { trackingId },
        include: {
          complainant: { select: complainantSelect },
          attachments: { select: { id: true, file: true } },
        },
      });
    }

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    const decryptedAttachments = await Promise.all(
      complaint.attachments.map(async (attachment) => {
        try {
          const buffer = await decryptBuffer(attachment.file);
          const dataUrl = await bufferToBase64DataUrl(buffer);
          return {
            id: attachment.id,
            file: dataUrl,
          };
        } catch (error) {
          console.warn("Failed to decrypt incident attachment:", error);
          return {
            id: attachment.id,
            file: null,
          };
        }
      })
    );

    const complainant = complaint.complainant || {};
    const enrichedComplainant = {
      ...complainant,
      attachmentIDFront: null,
      attachmentIDBack: null,
      attachmentUtility: null,
    };

    try {
      if (complainant.attachmentIDFront) {
        const buffer = await decryptBuffer(complainant.attachmentIDFront);
        enrichedComplainant.attachmentIDFront =
          await bufferToBase64DataUrl(buffer);
      }
    } catch (error) {
      console.warn("Failed to decrypt ID front:", error);
    }

    try {
      if (complainant.attachmentIDBack) {
        const buffer = await decryptBuffer(complainant.attachmentIDBack);
        enrichedComplainant.attachmentIDBack =
          await bufferToBase64DataUrl(buffer);
      }
    } catch (error) {
      console.warn("Failed to decrypt ID back:", error);
    }

    try {
      if (complainant.attachmentUtility) {
        const buffer = await decryptBuffer(complainant.attachmentUtility);
        enrichedComplainant.attachmentUtility =
          await bufferToBase64DataUrl(buffer);
      }
    } catch (error) {
      console.warn("Failed to decrypt utility proof:", error);
    }

    return NextResponse.json({
      success: true,
      complaint: {
        ...complaint,
        attachments: decryptedAttachments,
        complainant: enrichedComplainant,
      },
    });
  } catch (error) {
    console.error("Complaint tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
