'use server';
import plaidClient from '@/utils/plaid';
import { CountryCode, Products, IdentityVerificationGetResponse } from 'plaid';
import { isAddress } from 'viem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';
import { Role } from '@prisma/client';
import { getKycVerification } from '@/services/db/plaid/kyc';
import {
  saveItemAccessToken as dbSavePlaidItemAccessToken,
  getItemAccessTokensForChainAccount as dbGetItemAccessTokensForChainAccount,
} from '@/services/db/plaid/item-access';
import { revalidatePath } from 'next/cache';
import { ConnectedBankAccount } from './form';
import { initialiseLoanApplication as dbInitialiseLoanApplication } from '@/services/db/loan-application';
import { redirect } from 'next/navigation';
import { ROLE_REDIRECTS } from '@/app/api/auth/auth-options';

// TODO: move to global actions
async function validateRequest(chainAccountAddress: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  if (session?.user.role !== Role.BORROWER) {
    redirect(ROLE_REDIRECTS[session.user.role]);
  }

  if (session?.address !== chainAccountAddress) {
    throw new Error('User address does not match chain account address');
  }

  if (!isAddress(chainAccountAddress)) {
    throw new Error('Invalid chain account address');
  }
}

// TODO: get KYC status from DB
interface GetKycStatusResponse {
  isError: boolean;
  errorMessage?: string;
  hasAttemptedKyc: boolean;
  identityVerificationData?: IdentityVerificationGetResponse;
}
export async function getKycStatus(chainAccountAddress: string): Promise<GetKycStatusResponse> {
  try {
    await validateRequest(chainAccountAddress);

    const kycVerification = await getKycVerification({ chainAccountAddress });

    if (!kycVerification) {
      return { isError: false, hasAttemptedKyc: false };
    }

    const identityVerificationId = kycVerification.identityVerificationId;

    const response = await plaidClient.identityVerificationGet({
      identity_verification_id: identityVerificationId,
    });

    return { isError: false, hasAttemptedKyc: true, identityVerificationData: response.data };
  } catch (error: any) {
    return { isError: true, hasAttemptedKyc: false, errorMessage: 'Error getting KYC status' };
  }
}

// exchange Plaid public token for access token for item
interface PlaidPublicTokenExchangeResponse {
  isError: boolean;
  errorMessage?: string;
  accessToken?: string;
  itemId?: string;
}
export async function plaidPublicTokenExchange(args: {
  publicToken: string;
  chainAccountAddress: string;
}): Promise<PlaidPublicTokenExchangeResponse> {
  const { publicToken, chainAccountAddress } = args;
  try {
    await validateRequest(chainAccountAddress);

    const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    return {
      isError: false,
      accessToken,
      itemId,
    };
  } catch (err) {
    return {
      isError: true,
      errorMessage: 'Error exchanging public token for access token',
    };
  }
}

// save access token and item id to DB for chain account
export async function savePlaidItemAccessToken(args: {
  accessToken: string;
  itemId: string;
  chainAccountAddress: string;
}) {
  const { accessToken, itemId, chainAccountAddress } = args;
  try {
    await validateRequest(chainAccountAddress);

    await dbSavePlaidItemAccessToken({
      accessToken,
      itemId,
      chainAccountAddress,
    });
  } catch (error) {}
}

interface GetConnectedBankAccountsResponse {
  isError: boolean;
  errorMessage?: string;
  connectedBankAccounts?: ConnectedBankAccount[];
}
export async function getConnectedBankAccounts(
  chainAccountAddress: string
): Promise<GetConnectedBankAccountsResponse> {
  console.log('getConnectedBankAccounts');
  try {
    await validateRequest(chainAccountAddress);

    const result = await dbGetItemAccessTokensForChainAccount(chainAccountAddress);

    const accessTokens = result.map(token => token.accessToken);

    const accessTokensWithTransactionsProduct: string[] = [];
    for (const accessToken of accessTokens) {
      const response = await plaidClient.itemGet({ access_token: accessToken });
      const { item } = response.data;
      const { consented_products } = item;

      if (!consented_products) {
        continue;
      }

      if (consented_products.includes(Products.Transactions)) {
        accessTokensWithTransactionsProduct.push(accessToken);
      }
    }

    const connectedBankAccounts: ConnectedBankAccount[] = [];
    for (const accessToken of accessTokensWithTransactionsProduct) {
      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      const accounts = response.data.accounts;
      const institutionId = response.data.item.institution_id || '';

      let institutionName = '';
      for (const account of accounts) {
        if (institutionId) {
          const institutionResponse = await plaidClient.institutionsGetById({
            institution_id: institutionId,
            country_codes: [CountryCode.Us],
          });
          institutionName = institutionResponse.data.institution.name;
        }

        connectedBankAccounts.push({
          institutionId: institutionId,
          instituteName: institutionName,
          accountId: account.account_id,
          accountName: account.name,
          accountMask: account.mask,
          accountType: account.type,
        });
      }
    }

    connectedBankAccounts.sort((a, b) => a.institutionId.localeCompare(b.institutionId));

    return {
      isError: false,
      connectedBankAccounts,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error getting connected bank accounts',
    };
  }
}

interface CreateLinkTokenResponse {
  isError: boolean;
  errorMessage?: string;
  linkToken?: string;
}

export async function createLinkTokenForTransactions(
  chainAccountAddress: string
): Promise<CreateLinkTokenResponse> {
  try {
    await validateRequest(chainAccountAddress);

    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: chainAccountAddress },
      products: [Products.Transactions],
      identity_verification: {
        template_id: process.env.TEMPLATE_ID || '',
      },
      country_codes: [CountryCode.Us],
      client_name: 'Locale Lending Platform',
      language: 'en',
      webhook: 'https://webhook.example.com', // TODO: change to actual webhook
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

export async function createLinkTokenForIdentityVerification(
  chainAccountAddress: string
): Promise<CreateLinkTokenResponse> {
  try {
    await validateRequest(chainAccountAddress);

    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: chainAccountAddress },
      products: [Products.IdentityVerification],
      identity_verification: {
        template_id: process.env.TEMPLATE_ID || '',
      },
      country_codes: [CountryCode.Us],
      client_name: 'Locale Lending Platform',
      language: 'en',
      webhook: 'https://webhook.example.com',
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

// return loan application id
interface InitialiseLoanApplicationResponse {
  isError: boolean;
  errorMessage?: string;
  loanApplicationId?: string;
}
export async function initialiseLoanApplication(
  chainAccountAddress: string
): Promise<InitialiseLoanApplicationResponse> {
  try {
    await validateRequest(chainAccountAddress);

    const loanApplication = await dbInitialiseLoanApplication(chainAccountAddress);

    return {
      isError: false,
      loanApplicationId: loanApplication.id,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error initiating loan application',
    };
  }
}

