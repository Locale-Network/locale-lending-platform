-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BORROWER', 'APPROVER', 'ADMIN');

-- AlterTable
ALTER TABLE "chain_accounts" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BORROWER';
