import 'server-only';

import client from '@/utils/plaid';
import { IdentityVerificationGetRequest, Strategy } from 'plaid';

export const getPlaidKycVerification = async (identity_verification_id: string | null) => {
  if (!identity_verification_id) {
    throw new Error('Verification ID unavailable');
  }

  const request: IdentityVerificationGetRequest = {
    identity_verification_id,
  };

  const data = await client.identityVerificationGet(request);

  return data;
};

export const retryPlaidKycVerification = async (userId: string) => {
  if (!userId) {
    throw new Error('User unavailable');
  }

  const data = await client.identityVerificationRetry({
    client_user_id: userId,
    template_id: process.env.TEMPLATE_ID || '',
    strategy: Strategy.Reset,
    secret: process.env.PLAID_SECRET,
  });

  return data;
};
