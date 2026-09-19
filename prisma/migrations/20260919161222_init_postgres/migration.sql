-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('EMERGENCY', 'URGENT', 'MODERATE', 'MINOR', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'ESCALATION_REQUESTED', 'ESCALATED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BlotterStatus" AS ENUM ('FILED', 'UNDER_MEDIATION', 'RESOLVED', 'REFERRED');

-- CreateEnum
CREATE TYPE "BlotterCategory" AS ENUM ('NOISE_COMPLAINT', 'THEFT_OR_BURGLARY', 'TRESPASSING', 'DISTURBANCE_OF_PEACE', 'ASSAULT', 'TRAFFIC_INCIDENT', 'DISORDERLY_CONDUCT', 'PROPERTY_DAMAGE', 'SUSPICIOUS_ACTIVITY', 'DOMESTIC_VIOLENCE', 'ACCIDENT', 'ANIMAL_COMPLAINT', 'DRUG_RELATED', 'FIRE', 'FRAUD', 'HARASSMENT', 'ILLEGAL_STRUCTURE', 'LOST_AND_FOUND', 'MISSING_PERSON', 'VANDALISM', 'PUBLIC_DISTURBANCE', 'VIOLATION_OF_ORDINANCE', 'WEAPONS_OFFENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "ResidencyProofType" AS ENUM ('ID', 'UTILITY_BILL');

-- CreateEnum
CREATE TYPE "DashboardRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "HierarchyRole" AS ENUM ('CAPTAIN', 'KAGAWAD', 'SK_CHAIR', 'SECRETARY', 'CLERK', 'TANOD');

-- CreateTable
CREATE TABLE "Barangay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Barangay 123',
    "logoUrl" TEXT,
    "location" TEXT NOT NULL DEFAULT 'Tondo, Manila',
    "address" TEXT NOT NULL DEFAULT 'Zone 10, District 1, Manila City',
    "hotline" TEXT NOT NULL DEFAULT '(02) 8765 4321',
    "email" TEXT NOT NULL DEFAULT 'barangay123@tondo.gov.ph',
    "officeHours" TEXT NOT NULL DEFAULT 'Monday–Friday, 8:00 AM to 5:00 PM',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barangay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dashboardRole" "DashboardRole" NOT NULL,
    "hierarchyRole" "HierarchyRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dashboardRole" "DashboardRole" NOT NULL,
    "hierarchyRole" "HierarchyRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complainant" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "otherContacts" TEXT,
    "residencyProof" "ResidencyProofType" NOT NULL,
    "attachmentIDFront" BYTEA,
    "attachmentIDBack" BYTEA,
    "attachmentUtility" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complainant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "BlotterCategory" NOT NULL,
    "incidentDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "subjectName" TEXT,
    "subjectContext" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "severity" INTEGER,
    "remarks" TEXT,
    "complainantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "escalatedAt" TIMESTAMP(3),
    "deniedAt" TIMESTAMP(3),
    "reviewedByAdminId" TEXT,
    "blotterId" TEXT,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintAttachment" (
    "id" TEXT NOT NULL,
    "file" BYTEA NOT NULL,
    "complaintId" TEXT NOT NULL,

    CONSTRAINT "ComplaintAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blotter" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "status" "BlotterStatus" NOT NULL DEFAULT 'FILED',
    "remarks" TEXT,
    "description" TEXT NOT NULL,
    "category" "BlotterCategory" NOT NULL,
    "incidentDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "subjectName" TEXT,
    "subjectContext" TEXT,
    "complainantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "updatedByAdminId" TEXT,

    CONSTRAINT "Blotter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlotterAttachment" (
    "id" TEXT NOT NULL,
    "file" BYTEA NOT NULL,
    "blotterId" TEXT NOT NULL,

    CONSTRAINT "BlotterAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintEvent" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlotterEvent" (
    "id" TEXT NOT NULL,
    "blotterId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlotterEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingAdmin_email_key" ON "PendingAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PendingAdmin_phoneNumber_key" ON "PendingAdmin"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phoneNumber_key" ON "Admin"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Complainant_phoneNumber_key" ON "Complainant"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_trackingId_key" ON "Complaint"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_blotterId_key" ON "Complaint"("blotterId");

-- CreateIndex
CREATE UNIQUE INDEX "Blotter_trackingId_key" ON "Blotter"("trackingId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_complainantId_fkey" FOREIGN KEY ("complainantId") REFERENCES "Complainant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_blotterId_fkey" FOREIGN KEY ("blotterId") REFERENCES "Blotter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintAttachment" ADD CONSTRAINT "ComplaintAttachment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blotter" ADD CONSTRAINT "Blotter_complainantId_fkey" FOREIGN KEY ("complainantId") REFERENCES "Complainant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blotter" ADD CONSTRAINT "Blotter_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterAttachment" ADD CONSTRAINT "BlotterAttachment_blotterId_fkey" FOREIGN KEY ("blotterId") REFERENCES "Blotter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintEvent" ADD CONSTRAINT "ComplaintEvent_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintEvent" ADD CONSTRAINT "ComplaintEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterEvent" ADD CONSTRAINT "BlotterEvent_blotterId_fkey" FOREIGN KEY ("blotterId") REFERENCES "Blotter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterEvent" ADD CONSTRAINT "BlotterEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
