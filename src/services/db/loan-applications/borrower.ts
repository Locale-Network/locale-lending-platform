import 'server-only';

import prisma from '@prisma/index';
import {
  CreditScore,
  LoanApplication,
  LoanApplicationStatus,
  OutstandingLoan,
} from '@prisma/client';

export type BusinessInfo = Pick<
  LoanApplication,
  | 'businessLegalName'
  | 'businessAddress'
  | 'businessState'
  | 'businessCity'
  | 'businessZipCode'
  | 'ein'
  | 'businessFoundedYear'
  | 'businessLegalStructure'
  | 'businessWebsite'
  | 'businessPrimaryIndustry'
  | 'businessDescription'
>;

// DRAFT MODE
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
export const submitLoanApplication = async (data: {
  id: string;
  accountAddress: string;
  businessInfo: BusinessInfo;
  outstandingLoans: Pick<
    OutstandingLoan,
    | 'annualInterestRate'
    | 'outstandingBalance'
    | 'monthlyPayment'
    | 'remainingMonths'
    | 'lenderName'
    | 'loanType'
  >[];
}): Promise<any> => {
  const { id, accountAddress, businessInfo, outstandingLoans } = data;

  const result = await prisma.loanApplication.update({
    where: {
      id,
    },
    data: {
      ...businessInfo,
      // credit score
      hasOutstandingLoans: outstandingLoans.length > 0,
      outstandingLoans: {
        createMany: {
          data: outstandingLoans.map(outstandingLoan => ({
            ...outstandingLoan,
            accountAddress,
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
