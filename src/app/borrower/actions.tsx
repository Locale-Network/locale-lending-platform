'use server';
import { authOptions } from '@/app/api/auth/auth-options';
import { getKycVerification } from '@/services/db/plaid/kyc';
import { isPlaidError } from '@/types/plaid';
import plaidClient from '@/utils/plaid';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { CountryCode, IdentityVerificationGetResponse, Products, Strategy } from 'plaid';
import { isAddress } from 'viem';

async function validateRequest(chainAccountAddress: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('No session found');
  }

  if (session?.user.role !== Role.BORROWER) {
    console.log('role', session?.user.role);
    throw new Error('User is not a borrower');
  }

  if (session?.address !== chainAccountAddress) {
    throw new Error('User address does not match chain account address');
  }

  if (!isAddress(chainAccountAddress)) {
    throw new Error('Invalid chain account address');
  }
}

interface GetKycStatusResponse {
  isError: boolean;
  errorMessage?: string;
  hasAttemptedKyc: boolean;
  identityVerificationData?: IdentityVerificationGetResponse;
}

export async function plaidKycStatus(identity_verification_id: string) {
  return await plaidClient.identityVerificationGet({
    identity_verification_id,
  });
}

export async function getKycStatus(chainAccountAddress: string): Promise<GetKycStatusResponse> {
  try {
    await validateRequest(chainAccountAddress);
    const kycVerification = await getKycVerification({ chainAccountAddress });

    if (!kycVerification) {
      return { isError: false, hasAttemptedKyc: false };
    }

    const response = await plaidKycStatus(kycVerification.identityVerificationId);

    return { isError: false, hasAttemptedKyc: true, identityVerificationData: response.data };
  } catch (error: any) {
    if (isPlaidError(error)) {
      return { isError: true, hasAttemptedKyc: false, errorMessage: 'Error from PLAID' };
    }
    return { isError: true, hasAttemptedKyc: false, errorMessage: 'client error' };
  }
}

export async function retryKyc(chainAccountAddress: string) {
  try {
    await validateRequest(chainAccountAddress);

    const response = await plaidClient.identityVerificationRetry({
      client_user_id: chainAccountAddress,
      template_id: process.env.TEMPLATE_ID || '',
      strategy: Strategy.Reset,
      secret: process.env.PLAID_SECRET,
    });

    return response.data;
  } catch (error) {
    console.error('Error retrying KYC:', error);
    return null;
  }
}

export async function createKycLinkToken(chainAccountAddress: string) {
  try {
    await validateRequest(chainAccountAddress);

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: chainAccountAddress },
      products: [Products.IdentityVerification],
      identity_verification: {
        template_id: process.env.TEMPLATE_ID || '',
      },
      client_name: 'Locale Lending Platform',
      language: 'en',
      country_codes: [CountryCode.Us],
    });

    return response.data;
  } catch (error) {
    console.error('Error creating KYC link token:', error);
    return null;
  }
}
