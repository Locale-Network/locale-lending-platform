'use server';
import plaidClient from '@/utils/plaid';
import { CountryCode, Products } from 'plaid';
import { CreditScore } from '@prisma/client';
import {
  saveItemAccessToken as dbSavePlaidItemAccessToken,
  getItemAccessTokensForChainAccount as dbGetItemAccessTokensForChainAccount,
} from '@/services/db/plaid/item-access';
import {
  ConnectedBankAccount,
  loanApplicationFormSchema,
  LoanApplicationForm,
} from '../form-schema';
import {
  initialiseLoanApplication as dbInitialiseLoanApplication,
  submitLoanApplication as dbSubmitLoanApplication,
} from '@/services/db/loan-applications/borrower';
import { getCreditScoreOfLoanApplication as dbGetCreditScoreOfLoanApplication } from '@/services/db/credit-scores';
import { validateRequest as validateBorrowerRequest } from '@/app/borrower/actions';
import { revalidatePath } from 'next/cache';

// exchange Plaid public token for access token for item
interface PlaidPublicTokenExchangeResponse {
  isError: boolean;
  errorMessage?: string;
  accessToken?: string;
  itemId?: string;
}
export async function plaidPublicTokenExchange(args: {
  publicToken: string;
  accountAddress: string;
}): Promise<PlaidPublicTokenExchangeResponse> {
  const { publicToken, accountAddress } = args;
  try {
    await validateBorrowerRequest(accountAddress);

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
  accountAddress: string;
}) {
  const { accessToken, itemId, accountAddress } = args;
  try {
    await validateBorrowerRequest(accountAddress);

    await dbSavePlaidItemAccessToken({
      accessToken,
      itemId,
      accountAddress,
    });
  } catch (error) {}
}

interface GetConnectedBankAccountsResponse {
  isError: boolean;
  errorMessage?: string;
  connectedBankAccounts?: ConnectedBankAccount[];
}
export async function getConnectedBankAccounts(
  accountAddress: string
): Promise<GetConnectedBankAccountsResponse> {
  try {
    await validateBorrowerRequest(accountAddress);

    const result = await dbGetItemAccessTokensForChainAccount(accountAddress);

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
  accountAddress: string
): Promise<CreateLinkTokenResponse> {
  try {
    await validateBorrowerRequest(accountAddress);

    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      user: { client_user_id: accountAddress },
      products: [Products.Transactions],
      transactions: {
        days_requested: 730,
      },
      country_codes: [CountryCode.Us],
      client_name: 'Locale Lending',
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

// return loan application id
interface InitialiseLoanApplicationResponse {
  isError: boolean;
  errorMessage?: string;
  loanApplicationId?: string;
}
export async function initialiseLoanApplication(
  accountAddress: string
): Promise<InitialiseLoanApplicationResponse> {
  try {
    await validateBorrowerRequest(accountAddress);

    const loanApplication = await dbInitialiseLoanApplication(accountAddress);

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

interface GetCreditScoreOfLoanApplicationResponse {
  isError: boolean;
  errorMessage?: string;
  creditScore?: Omit<
    CreditScore,
    'loanApplicationId' | 'accountAddress' | 'createdAt' | 'updatedAt'
  >;
}
export async function getCreditScoreOfLoanApplication(
  loanApplicationId: string
): Promise<GetCreditScoreOfLoanApplicationResponse> {
  try {
    const result = await dbGetCreditScoreOfLoanApplication(loanApplicationId);

    return {
      isError: false,
      creditScore: {
        id: result.id,
        score: result.score,
        scoreRangeMin: result.scoreRangeMin,
        scoreRangeMax: result.scoreRangeMax,
        scoreType: result.scoreType,
        creditBureau: result.creditBureau,
      },
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error getting credit score of loan application',
    };
  }
}

export async function submitLoanApplication(args: {
  formData: LoanApplicationForm;
  accountAddress: string;
}): Promise<void> {
  const { formData, accountAddress } = args;
  await validateBorrowerRequest(accountAddress);

  if (formData.accountAddress !== accountAddress) {
    throw new Error('Unauthorized creator of loan application');
  }

  const result = loanApplicationFormSchema.safeParse(formData);

  if (!result.success) {
    throw new Error('Invalid form data');
  }

  await dbSubmitLoanApplication({
    id: formData.applicationId,
    accountAddress,
    businessInfo: {
      businessLegalName: formData.businessLegalName,
      businessAddress: formData.businessAddress,
      businessState: formData.businessState,
      businessCity: formData.businessCity,
      businessZipCode: formData.businessZipCode,
      businessWebsite: formData.businessWebsite || null,
      ein: formData.ein,
      businessFoundedYear: formData.businessFoundedYear,
      businessLegalStructure: formData.businessLegalStructure,
      businessPrimaryIndustry: formData.businessPrimaryIndustry,
      businessDescription: formData.businessDescription,
    },
    outstandingLoans: formData.outstandingLoans,
  });

  revalidatePath('/borrower/loans');
}
