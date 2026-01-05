/*
  Warnings:

  - The values [UNFULFILLED,FULFILLED] on the enum `FulfillmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `email` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `imageSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `nameSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `priceCentsSnapshot` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `featured` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `priceCents` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `stripePaymentIntentId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `priceCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `productId` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `images` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `options` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterEnum
BEGIN;
CREATE TYPE "FulfillmentStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED');
ALTER TABLE "public"."Order" ALTER COLUMN "fulfillmentStatus" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "fulfillmentStatus" TYPE "FulfillmentStatus_new" USING ("fulfillmentStatus"::text::"FulfillmentStatus_new");
ALTER TYPE "FulfillmentStatus" RENAME TO "FulfillmentStatus_old";
ALTER TYPE "FulfillmentStatus_new" RENAME TO "FulfillmentStatus";
DROP TYPE "public"."FulfillmentStatus_old";
ALTER TABLE "Order" ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- DropIndex
DROP INDEX "Order_stripeSessionId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "email",
DROP COLUMN "orderNumber",
DROP COLUMN "status",
DROP COLUMN "stripeSessionId",
DROP COLUMN "userId",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "trackingCarrier" TEXT,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT,
ALTER COLUMN "fulfillmentStatus" SET DEFAULT 'DRAFT',
ALTER COLUMN "stripePaymentIntentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "imageSnapshot",
DROP COLUMN "nameSnapshot",
DROP COLUMN "priceCentsSnapshot",
DROP COLUMN "size",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "priceCents" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "variantId" TEXT NOT NULL,
ADD COLUMN     "variantTitle" TEXT,
ALTER COLUMN "productId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "active",
DROP COLUMN "category",
DROP COLUMN "currency",
DROP COLUMN "featured",
DROP COLUMN "name",
DROP COLUMN "priceCents",
ADD COLUMN     "images" JSONB NOT NULL,
ADD COLUMN     "options" JSONB NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProductImage";

-- DropTable
DROP TABLE "Variant";

-- DropEnum
DROP TYPE "Category";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "VariantSize";

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shippingInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "ProductVariant_productId_sku_key" ON "ProductVariant"("productId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
