'use server';
import { validateRequest as validateBorrowerRequest } from '@/app/borrower/actions';
import plaidClient from '@/utils/plaid';
import {
  CountryCode,
  IdentityVerificationGetResponse,
  IdentityVerificationRetryResponse,
  Products,
  Strategy,
} from 'plaid';
import {
  getKycVerification as dbGetKycVerification,
  createKycVerification as dbCreateKycVerification,
} from '@/services/db/plaid/kyc';
import { revalidatePath } from 'next/cache';

interface GetKycStatusResponse {
  isError: boolean;
  errorMessage?: string;
  hasAttemptedKyc: boolean;
  identityVerificationData?: IdentityVerificationGetResponse;
}

export async function getIdentityVerificationStatus(
  accountAddress: string
): Promise<GetKycStatusResponse> {
  try {
    await validateBorrowerRequest(accountAddress);
    const kycVerification = await dbGetKycVerification({ accountAddress });

    if (!kycVerification) {
      return { isError: false, hasAttemptedKyc: false };
    }

    const identityVerificationResponse = await plaidClient.identityVerificationGet({
      identity_verification_id: kycVerification.identityVerificationId,
    });

    return {
      isError: false,
      hasAttemptedKyc: true,
      identityVerificationData: identityVerificationResponse.data,
    };
  } catch (error: any) {
    return {
      isError: true,
      hasAttemptedKyc: false,
      errorMessage: 'error getting identity verification status',
    };
  }
}

interface CreateLinkTokenResponse {
  isError: boolean;
  errorMessage?: string;
  linkToken?: string;
}
export async function createLinkTokenForIdentityVerification(
  accountAddress: string
): Promise<CreateLinkTokenResponse> {
  try {
    await validateBorrowerRequest(accountAddress);

    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: accountAddress },
      products: [Products.IdentityVerification],
      identity_verification: {
        template_id: process.env.TEMPLATE_ID || '',
      },
      country_codes: [CountryCode.Us],
      client_name: 'Locale Lending Platform',
      language: 'en',
    });

    return {
      isError: false,
      linkToken: response.data.link_token,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error creating link token',
    };
  }
}

interface RetryIdentityVerificationResponse {
  isError: boolean;
  errorMessage?: string;
  retryIdentityVerificationData?: IdentityVerificationRetryResponse;
}
export async function retryIdentityVerification(
  accountAddress: string
): Promise<RetryIdentityVerificationResponse> {
  try {
    await validateBorrowerRequest(accountAddress);

    const response = await plaidClient.identityVerificationRetry({
      client_user_id: accountAddress,
      template_id: process.env.TEMPLATE_ID || '',
      strategy: Strategy.Reset,
      secret: process.env.PLAID_SECRET,
    });

    return {
      isError: false,
      retryIdentityVerificationData: response.data,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error retrying KYC',
    };
  }
}


export const createKycVerificationRecord = async (
  accountAddress: string,
  identityVerificationId: string
) => {
  await dbCreateKycVerification({
    accountAddress,
    identityVerificationId,
  });

  revalidatePath('/borrower/loans/apply');
};


