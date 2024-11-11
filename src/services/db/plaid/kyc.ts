import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createKycVerification = async (data: {
  user: string;
  plaidSessionId: string;
  status: string;
}) => {
  return prisma.kYCVerification.create({data});
};

export const updateKyVerification = async (data: {
  plaidSessionId: string;
  status: string;
}) => {
  return prisma.kYCVerification.update({
    data: {
      status: data.status,
      updatedAt: new Date(),
    },
    where: {
      plaidSessionId: data.plaidSessionId,
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

export const isKycVerifiedBySessionId = async (plaidSessionId: string) => {
  return prisma.kYCVerification.findFirst({
    where: {
      plaidSessionId,
    },
  });
};
