/*
  Warnings:

  - You are about to drop the column `stock` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "stock",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "stockBySize" JSONB NOT NULL DEFAULT '{}';
