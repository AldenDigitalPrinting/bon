-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PRINTING', 'DONE');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('CETAK', 'EDIT', 'DESAIN');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('PAGI', 'SIANG', 'MALAM');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "notaId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "notes" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "jobType" "JobType" NOT NULL,
    "serviceFee" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,
    "gelondonganId" TEXT,
    "printedAt" TIMESTAMP(3),
    "printedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gelondongan" (
    "id" TEXT NOT NULL,
    "rollNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" "Shift" NOT NULL,
    "revenue" INTEGER NOT NULL,
    "dailyTotal" INTEGER NOT NULL,
    "rollTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gelondongan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_notaId_key" ON "Order"("notaId");

-- CreateIndex
CREATE UNIQUE INDEX "Gelondongan_rollNumber_key" ON "Gelondongan"("rollNumber");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_gelondonganId_fkey" FOREIGN KEY ("gelondonganId") REFERENCES "Gelondongan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
