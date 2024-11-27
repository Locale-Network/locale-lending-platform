import 'server-only';

import prisma from '@prisma/index';
import { CreditScore, LoanApplication, LoanApplicationStatus } from '@prisma/client';
import { loanApplicationFormSchema } from '@/app/borrower/loans/apply/form-schema';
import { z } from 'zod';

// needed to reference loan application id in reclaim proof. DRAFT MODE
export const initialiseLoanApplication = async (
  accountAddress: string
): Promise<LoanApplication> => {
  const result = await prisma.loanApplication.create({
    data: {
      accountAddress,
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

export const getLoanApplicationsOfBorrower = async (
  accountAddress: string
): Promise<(LoanApplication & { creditScore: CreditScore | null })[]> => {
  const result = await prisma.loanApplication.findMany({
    where: {
      accountAddress,
      isSubmitted: true,
      status: {
        not: LoanApplicationStatus.DRAFT,
      },
    },
    include: {
      creditScore: true,
    },
    orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
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
            accountAddress: formData.accountAddress,
          })),
        },
      },
      isSubmitted: true,
      status: LoanApplicationStatus.PENDING,
    },
  });

  return result;
};

export const getLatestLoanApplicationOfBorrower = async (accountAddress: string) => {
  const result = await prisma.loanApplication.findFirst({
    where: { accountAddress, isSubmitted: false, status: LoanApplicationStatus.DRAFT },
    orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
  });
  return result;
};
