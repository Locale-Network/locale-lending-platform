'use server';

import { getLoanApplication as dbGetLoanApplication } from '@/services/db/loan-applications';
import plaidClient from '@/utils/plaid';
import { CountryCode, Products } from 'plaid';

interface GetLoanApplicationCreatorResponse {
  isError: boolean;
  errorMessage?: string;
  account?: string;
}
export const getLoanApplicationCreator = async (
  loanApplicationId: string
): Promise<GetLoanApplicationCreatorResponse> => {
  try {
    const loanApplication = await dbGetLoanApplication({ loanApplicationId });

    if (!loanApplication) {
      return {
        isError: true,
        errorMessage: `Loan application with id ${loanApplicationId} not found`,
      };
    }

    return {
      isError: false,
      account: loanApplication.chainAccountAddress,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Failed to get loan application creator',
    };
  }
};

interface CreateLinkTokenResponse {
  isError: boolean;
  errorMessage?: string;
  linkToken?: string;
}
export async function createLinkTokenForTransactions(
  chainAccountAddress: string
): Promise<CreateLinkTokenResponse> {
  try {
    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: chainAccountAddress },
      products: [Products.Transactions],
      transactions: {
        days_requested: 730,
      },
      country_codes: [CountryCode.Us],
      client_name: 'Locale Lending Platform',
      language: 'en',
      redirect_uri: 'https://locale-reclaim.vercel.app/data/loan/credit-score', // FIXME: cannot have query
    });

    return {
      isError: false,
      linkToken: response.data.link_token,
    };
  } catch (error) {
    console.log('error : ', error);
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
export async function plaidPublicTokenExchange(publicToken: string): Promise<PlaidPublicTokenExchangeResponse> {
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