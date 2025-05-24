/*
  Warnings:

  - The `status` column on the `clients` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('MAINTENANCE', 'REPAIR', 'INSTALLATION', 'INSPECTION', 'EMERGENCY', 'CLEANING', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "ServicePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'BROKEN');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "business_registration" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "is_vip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "next_service_date" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "preferred_schedule" TEXT,
ADD COLUMN     "total_services" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "client_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "type" "ServiceType" NOT NULL,
    "priority" "ServicePriority" NOT NULL DEFAULT 'MEDIUM',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "estimated_duration" INTEGER,
    "actual_duration" INTEGER,
    "equipment_ids" TEXT[],
    "address" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "emergency_contact" TEXT,
    "access_instructions" TEXT,
    "client_notes" TEXT,
    "work_performed" TEXT,
    "time_spent" INTEGER,
    "materials_used" JSONB,
    "technician_notes" TEXT,
    "client_signature" TEXT,
    "images" TEXT[],
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "brand" TEXT,
    "serial_number" TEXT,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "install_date" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "service_id" TEXT,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "valid_until" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
