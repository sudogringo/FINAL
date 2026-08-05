-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'CANCELADO');

-- CreateTable: customers
CREATE TABLE "customers" (
    "id"        TEXT NOT NULL,
    "nombre"    TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "empresa"   TEXT,
    "telefono"  TEXT,
    "localidad" TEXT,
    "tipo"      TEXT NOT NULL DEFAULT 'particular',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateTable: orders
CREATE TABLE "orders" (
    "id"         TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quoteId"    TEXT,
    "estado"     "OrderStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "orders_quoteId_key" ON "orders"("quoteId");

-- CreateTable: order_items
CREATE TABLE "order_items" (
    "id"        TEXT NOT NULL,
    "orderId"   TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "nombre"    TEXT NOT NULL,
    "size"      TEXT NOT NULL,
    "cantidad"  INTEGER NOT NULL,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: web_interactions
CREATE TABLE "web_interactions" (
    "id"         TEXT NOT NULL,
    "sessionId"  TEXT NOT NULL,
    "customerId" TEXT,
    "productId"  TEXT,
    "tipo"       TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "web_interactions_pkey" PRIMARY KEY ("id")
);

-- AlterTable: quotes — add customerId
ALTER TABLE "quotes" ADD COLUMN "customerId" TEXT;

-- AddForeignKey constraints
ALTER TABLE "quotes"           ADD CONSTRAINT "quotes_customerId_fkey"           FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orders"           ADD CONSTRAINT "orders_customerId_fkey"           FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders"           ADD CONSTRAINT "orders_quoteId_fkey"              FOREIGN KEY ("quoteId")    REFERENCES "quotes"("id")    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items"      ADD CONSTRAINT "order_items_orderId_fkey"         FOREIGN KEY ("orderId")    REFERENCES "orders"("id")    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items"      ADD CONSTRAINT "order_items_productId_fkey"       FOREIGN KEY ("productId")  REFERENCES "products"("id")  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "web_interactions" ADD CONSTRAINT "web_interactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "web_interactions" ADD CONSTRAINT "web_interactions_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "products"("id")  ON DELETE SET NULL ON UPDATE CASCADE;
