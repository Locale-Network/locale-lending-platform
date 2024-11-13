import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createKycVerification = async (data: {
  user: string;
  identityVerificationId: string;
  status: string;
}) => {
  return prisma.kYCVerification.create({data});
};

export const updateKyVerification = async (data: {
  identityVerificationId: string;
  status: string;
  userAttempted?: boolean;
}) => {
  const existingRecord = await prisma.kYCVerification.findUnique({
    where: {identityVerificationId: data.identityVerificationId},
  });

  if (!existingRecord) {
    throw "KYC verification record not found";
  }

  return prisma.kYCVerification.update({
    data: {
      status: data.status,
      updatedAt: new Date(),
      attempts: data.userAttempted
        ? existingRecord.attempts + 1
        : existingRecord.attempts,
    },
    where: {
      identityVerificationId: data.identityVerificationId,
    },
  });
};

export const isKycVerifiedByUser = async (userId: string) => {
  return prisma.kYCVerification
    .findFirst({
      where: {
        user: userId,
      },
    })
    .then((result) => {
      if (!result) {
        return "No KYC verification message for specific user";
      }
      return result;
    });
};

export const isKycVerifiedBySessionId = async (
  identityVerificationId: string
) => {
  return prisma.kYCVerification.findFirst({
    where: {
      identityVerificationId,
    },
  });
};
