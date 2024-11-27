'use server';
import { authOptions } from '@/app/api/auth/auth-options';
import { getKycVerification } from '@/services/db/plaid/kyc';
import { isPlaidError } from '@/types/plaid';
import plaidClient from '@/utils/plaid';
import { Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { CountryCode, IdentityVerificationGetResponse, Products, Strategy } from 'plaid';
import { isAddress } from 'viem';
import { redirect } from 'next/navigation';
import { ROLE_REDIRECTS } from '@/app/api/auth/auth-options';

export async function validateRequest(accountAddress: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  if (session?.user.role !== Role.BORROWER) {
    redirect(ROLE_REDIRECTS[session.user.role]);
  }

  if (session?.address !== accountAddress) {
    throw new Error('User address does not match chain account address');
  }

  if (!isAddress(accountAddress)) {
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

export async function getKycStatus(accountAddress: string): Promise<GetKycStatusResponse> {
  try {
    await validateRequest(accountAddress);
    const kycVerification = await getKycVerification({ accountAddress });

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

export async function retryKyc(accountAddress: string) {
  try {
    await validateRequest(accountAddress);

    const response = await plaidClient.identityVerificationRetry({
      client_user_id: accountAddress,
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

export async function createKycLinkToken(accountAddress: string) {
  try {
    await validateRequest(accountAddress);

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: accountAddress },
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
