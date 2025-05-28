-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('QUOTE_PAYMENT', 'MATERIAL_COST', 'ADDITIONAL_COST', 'REFUND');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "client_comment" TEXT,
ADD COLUMN     "client_rating" DOUBLE PRECISION,
ADD COLUMN     "rated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
