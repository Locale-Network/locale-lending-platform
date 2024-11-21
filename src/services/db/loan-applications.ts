import 'server-only';

import prisma from '@prisma/index';
import { LoanApplication, LoanApplicationStatus, PlaidItemAccessToken } from '@prisma/client';
import { loanApplicationFormSchema } from '@/app/borrower/loans/apply/form-schema';
import { z } from 'zod';

// needed to reference loan application id in reclaim proof. DRAFT MODE
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

export const getLoanApplication = async (args: {
  loanApplicationId: string;
}): Promise<LoanApplication | null> => {
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

  const result = await prisma.plaidItemAccessToken.upsert({
    where: {
      itemId: itemId,
    },
    create: {
      accessToken: accessToken,
      itemId: itemId,
      chainAccount: {
        connect: {
          address: chainAccountAddress,
        },
      },
    },
    update: {
      accessToken: accessToken,
    },
  });

  return result;
};

// PENDING MODE
export const submitLoanApplication = async (
  formData: z.infer<typeof loanApplicationFormSchema>
): Promise<LoanApplication> => {
  const { outstandingLoans } = formData;

  const result = await prisma.loanApplication.update({
    where: {
      id: formData.applicationId,
    },
    data: {
      businessLegalName: formData.businessLegalName,
      businessAddress: formData.businessAddress,
      businessState: formData.businessState,
      businessCity: formData.businessCity,
      businessZipCode: formData.businessZipCode,
      ein: formData.ein,
      businessFoundedYear: formData.businessFoundedYear,
      businessLegalStructure: formData.businessLegalStructure,
      businessWebsite: formData.businessWebsite,
      businessPrimaryIndustry: formData.businessPrimaryIndustry,
      businessDescription: formData.businessDescription,
      // credit score
      hasOutstandingLoans: formData.hasOutstandingLoans,
      outstandingLoans: {
        createMany: {
          data: outstandingLoans.map(outstandingLoan => ({
            ...outstandingLoan,
            chainAccountAddress: formData.chainAccountAddress,
          })),
        },
      },
      isSubmitted: true,
      status: LoanApplicationStatus.PENDING,
    },
  });

  return result;
};
