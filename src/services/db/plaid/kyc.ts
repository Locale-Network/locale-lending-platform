import { KYCVerificationStatus, KYCVerification } from '@prisma/client';
import prisma from '@prisma/index';

export const createKycVerification = async (data: {
  chainAccountAddress: string;
  identityVerificationId: string;
  status: KYCVerificationStatus;
}) => {
  return prisma.kYCVerification.create({ data });
};

export const updateKyVerification = async (data: {
  identityVerificationId: string;
  status: KYCVerificationStatus;
  userAttempted?: boolean;
}) => {
  const existingRecord = await prisma.kYCVerification.findUnique({
    where: { identityVerificationId: data.identityVerificationId },
  });

  if (!existingRecord) {
    throw 'KYC verification record not found';
  }

  return prisma.kYCVerification.update({
    data: {
      status: data.status,
      updatedAt: new Date(),
      attempts: data.userAttempted ? existingRecord.attempts + 1 : existingRecord.attempts,
    },
    where: {
      identityVerificationId: data.identityVerificationId,
    },
  });
};

export const getKycVerification = async ({
  chainAccountAddress,
  identityVerificationId,
}: {
  chainAccountAddress?: string;
  identityVerificationId?: string;
}): Promise<KYCVerification | null> => {
  if (!chainAccountAddress && !identityVerificationId) {
    throw new Error('Either chainAccountAddress or identityVerificationId is required');
  }

  /*
    query by chainAccountAddress AND identityVerificationId if both are provided
    otherwise query by either chainAccountAddress or identityVerificationId
  */
  const record = await prisma.kYCVerification.findFirst({
    where: {
      OR: [
        ...(chainAccountAddress ? [{ chainAccountAddress }] : []),
        ...(identityVerificationId ? [{ identityVerificationId }] : []),
      ],
    },
  });

  return record;
};
