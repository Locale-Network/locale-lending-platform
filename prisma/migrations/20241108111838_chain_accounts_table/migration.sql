-- CreateTable
CREATE TABLE "chain_accounts" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chain_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chain_accounts_address_key" ON "chain_accounts"("address");
