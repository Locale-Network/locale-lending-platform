/*
  Warnings:

  - You are about to drop the column `identityVerificationId` on the `kyc_verifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identity_verification_id]` on the table `kyc_verifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identity_verification_id` to the `kyc_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "kyc_verifications_identityVerificationId_key";

-- AlterTable
ALTER TABLE "kyc_verifications" DROP COLUMN "identityVerificationId",
ADD COLUMN     "identity_verification_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_identity_verification_id_key" ON "kyc_verifications"("identity_verification_id");
