'use server';

import { createKycVerification } from '@/services/db/plaid/kyc';

export const createKycVerificationRecord = async (
  accountAddress: string,
  identityVerificationId: string
) => {
  try {
    const response = await createKycVerification({
      accountAddress,
      identityVerificationId,
    });
    return response;
  } catch (error: any) {
    return error;
  }
};
