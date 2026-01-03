-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterEnum
BEGIN;
CREATE TYPE "FulfillmentStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED');
ALTER TABLE "Order" ALTER COLUMN "fulfillmentStatus" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "fulfillmentStatus" TYPE "FulfillmentStatus_new" USING ("fulfillmentStatus"::text::"FulfillmentStatus_new");
ALTER TYPE "FulfillmentStatus" RENAME TO "FulfillmentStatus_old";
ALTER TYPE "FulfillmentStatus_new" RENAME TO "FulfillmentStatus";
DROP TYPE "FulfillmentStatus_old";
ALTER TABLE "Order" ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE "ProductImage" DROP CONSTRAINT IF EXISTS "ProductImage_productId_fkey";
ALTER TABLE "Variant" DROP CONSTRAINT IF EXISTS "Variant_productId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Order_orderNumber_key";
DROP INDEX IF EXISTS "Order_stripeSessionId_key";

-- AlterTable
ALTER TABLE "Order" 
DROP COLUMN IF EXISTS "email",
DROP COLUMN IF EXISTS "orderNumber",
DROP COLUMN IF EXISTS "status",
DROP COLUMN IF EXISTS "stripeSessionId",
DROP COLUMN IF EXISTS "userId",
ADD COLUMN "customerEmail" TEXT NOT NULL,
ADD COLUMN "customerName" TEXT,
ADD COLUMN "customerPhone" TEXT,
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "printifyOrderId" TEXT,
ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "trackingCarrier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "trackingUrl" TEXT,
ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'DRAFT',
ALTER COLUMN "stripePaymentIntentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem"
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "options" JSONB,
ADD COLUMN "priceCents" INTEGER,
ADD COLUMN "printifyProductId" TEXT,
ADD COLUMN "title" TEXT,
ADD COLUMN "variantId" TEXT,
ADD COLUMN "variantTitle" TEXT,
ALTER COLUMN "nameSnapshot" DROP NOT NULL,
ALTER COLUMN "priceCentsSnapshot" DROP NOT NULL,
DROP COLUMN IF EXISTS "size",
ADD COLUMN "size" TEXT,
ALTER COLUMN "qty" SET DEFAULT 0;

-- DropTable
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "ProductImage" CASCADE;
DROP TABLE IF EXISTS "Variant" CASCADE;

-- CreateTable
CREATE TABLE "PrintifyProductCache" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "printifyProductId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "options" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrintifyProductCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintifyVariantCache" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shippingInfo" JSONB,
    "images" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintifyVariantCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrintifyProductCache_printifyProductId_key" ON "PrintifyProductCache"("printifyProductId");

-- CreateIndex
CREATE UNIQUE INDEX "PrintifyProductCache_slug_key" ON "PrintifyProductCache"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PrintifyVariantCache_productId_variantId_key" ON "PrintifyVariantCache"("productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_printifyOrderId_key" ON "Order"("printifyOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "PrintifyVariantCache" ADD CONSTRAINT "PrintifyVariantCache_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PrintifyProductCache"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
