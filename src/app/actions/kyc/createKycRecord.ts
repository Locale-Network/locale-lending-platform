'use server';

import { createKycVerification } from '@/services/db/plaid/kyc';

export const createKycVerificationRecord = async (
  chainAccountAddress: string,
  identityVerificationId: string
) => {
  try {
    const response = await createKycVerification({
      chainAccountAddress,
      identityVerificationId,
    });
    return response;
  } catch (error: any) {
    return error
  }
};
