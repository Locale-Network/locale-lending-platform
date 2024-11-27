import 'server-only';

import { KYCVerification, KYCVerificationStatus } from '@prisma/client';
import prisma from '@prisma/index';

export const createKycVerification = async (data: {
  accountAddress: string;
  identityVerificationId: string;
}) => {
  return prisma.kYCVerification.create({ data: { ...data, updatedAt: new Date() } });
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
  accountAddress,
  identityVerificationId,
}: {
  accountAddress?: string;
  identityVerificationId?: string;
}): Promise<KYCVerification | null> => {
  if (!accountAddress && !identityVerificationId) {
    throw new Error('Either accountAddress or identityVerificationId is required');
  }

  /*
    query by accountAddress AND identityVerificationId if both are provided
    otherwise query by either accountAddress or identityVerificationId
  */
  const record = await prisma.kYCVerification.findFirst({
    where: {
      OR: [
        ...(accountAddress ? [{ accountAddress }] : []),
        ...(identityVerificationId ? [{ identityVerificationId }] : []),
      ],
    },
  });

  return record;
};
