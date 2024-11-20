import 'server-only';

import prisma from '@prisma/index';
import { LoanApplication, PlaidItemAccessToken } from '@prisma/client';

// needed to reference loan application id in reclaim proof
export const initialiseLoanApplication = async (
  chainAccountAddress: string
): Promise<LoanApplication> => {
  const result = await prisma.loanApplication.create({
    data: {
      chainAccountAddress,
      businessLegalName: '',
      businessAddress: '',
      businessState: '',
      businessCity: '',
      businessZipCode: '',
      ein: '',
      businessFoundedYear: 0,
      businessLegalStructure: '',
      businessWebsite: '',
      businessPrimaryIndustry: '',
      businessDescription: '',
    },
  });
  return result;
};

export const getLoanApplication = async (args: { loanApplicationId: string }) => {
  const { loanApplicationId } = args;
  const result = await prisma.loanApplication.findUnique({
    where: { id: loanApplicationId },
  });
  return result;
};

export const saveAccessTokenOfLoanApplicationCreator = async (args: {
  loanApplicationId: string;
  accessToken: string;
  itemId: string;
}): Promise<PlaidItemAccessToken> => {
  const { loanApplicationId, accessToken, itemId } = args;

  const loanApplication = await getLoanApplication({ loanApplicationId });

  if (!loanApplication) {
    throw new Error(`Loan application with id ${loanApplicationId} not found`);
  }

  const { chainAccountAddress } = loanApplication;

  const result = await prisma.plaidItemAccessToken.create({
    data: {
      chainAccountAddress,
      itemId,
      accessToken,
    },
  });

  return result;
};
