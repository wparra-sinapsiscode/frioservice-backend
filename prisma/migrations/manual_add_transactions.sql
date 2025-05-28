-- Migración manual para agregar tabla de transacciones
-- Ejecutar cuando la base de datos esté disponible

-- Crear enum TransactionType
CREATE TYPE "TransactionType" AS ENUM ('QUOTE_PAYMENT', 'MATERIAL_COST', 'ADDITIONAL_COST', 'REFUND');

-- Crear tabla transactions
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- Agregar foreign key constraint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Crear índices para optimizar consultas
CREATE INDEX "transactions_service_id_idx" ON "transactions"("service_id");
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");
CREATE INDEX "transactions_type_idx" ON "transactions"("type");