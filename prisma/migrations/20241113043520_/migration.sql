-- CreateEnum
CREATE TYPE "KYCVerificationStatus" AS ENUM ('active', 'success', 'failed', 'expired', 'canceled', 'pending_review');

-- CreateTable
CREATE TABLE "kyc_verifications" (
    "id" SERIAL NOT NULL,
    "identityVerificationId" TEXT NOT NULL,
    "chain_account_address" VARCHAR(255) NOT NULL,
    "status" "KYCVerificationStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_identityVerificationId_key" ON "kyc_verifications"("identityVerificationId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_chain_account_address_key" ON "kyc_verifications"("chain_account_address");

-- AddForeignKey
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_chain_account_address_fkey" FOREIGN KEY ("chain_account_address") REFERENCES "chain_accounts"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
