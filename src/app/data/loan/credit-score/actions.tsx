'use server';

import {
  getLoanApplication as dbGetLoanApplication,
  getLatestLoanApplicationOfBorrower as dbGetLatestLoanApplicationOfBorrower,
} from '@/services/db/loan-applications/borrower';
import plaidClient from '@/utils/plaid';
import { CountryCode, Products } from 'plaid';

interface CreateLinkTokenResponse {
  isError: boolean;
  errorMessage?: string;
  linkToken?: string;
}
export async function createLinkTokenForTransactions(
  accountAddress: string
): Promise<CreateLinkTokenResponse> {
  try {
    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: accountAddress },
      products: [Products.Transactions],
      transactions: {
        days_requested: 730,
      },
      country_codes: [CountryCode.Us],
      client_name: 'Locale Lending Platform',
      language: 'en',
      redirect_uri: process.env.PLAID_REDIRECT_URI,
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

interface PlaidPublicTokenExchangeResponse {
  isError: boolean;
  errorMessage?: string;
  accessToken?: string;
  itemId?: string;
}
export async function plaidPublicTokenExchange(
  publicToken: string
): Promise<PlaidPublicTokenExchangeResponse> {
  try {
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

interface GetLatestLoanApplicationOfBorrowerResponse {
  isError: boolean;
  errorMessage?: string;
  loanApplicationId?: string;
}
export async function getLatestLoanApplicationOfBorrower(
  accountAddress: string
): Promise<GetLatestLoanApplicationOfBorrowerResponse> {
  try {
    const loanApplication = await dbGetLatestLoanApplicationOfBorrower(accountAddress);
    return {
      isError: false,
      loanApplicationId: loanApplication?.id,
    };
  } catch (error) {
    return { isError: true, errorMessage: 'Failed to get latest loan application of borrower' };
  }
}
