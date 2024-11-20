'use server';

import {
  getLoanApplication as dbGetLoanApplication,
  saveAccessTokenOfLoanApplicationCreator as dbSaveAccessTokenOfLoanApplicationCreator,
} from '@/services/db/loan-applications';

const validateRequest = async (args: {
  loanApplicationId: string;
  accessToken: string;
  itemId: string;
}) => {
  const { loanApplicationId, accessToken, itemId } = args;

  const loanApplication = await dbGetLoanApplication({ loanApplicationId });

  if (!loanApplication) {
    throw new Error(`Loan application with id ${loanApplicationId} not found`);
  }
};

interface SaveAccessTokenOfLoanApplicationCreatorResponse {
  isError: boolean;
  errorMessage?: string;
}
export const saveAccessTokenOfLoanApplicationCreator = async (args: {
  loanApplicationId: string;
  accessToken: string;
  itemId: string;
}): Promise<SaveAccessTokenOfLoanApplicationCreatorResponse> => {
  try {
    await validateRequest(args);

    await dbSaveAccessTokenOfLoanApplicationCreator(args);

    return {
      isError: false,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Failed to save access token of loan application creator',
    };
  }
};
