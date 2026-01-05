-- AlterEnum
ALTER TYPE "FulfillmentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "printifyOrderId" TEXT;
