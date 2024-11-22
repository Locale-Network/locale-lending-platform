import 'server-only';

import prisma from '@prisma/index';
import { ChainAccount, CreditScore, LoanApplication, LoanApplicationStatus } from '@prisma/client';

export const getLoanApplication = async (args: {
  loanApplicationId: string;
}): Promise<LoanApplication | null> => {
  const { loanApplicationId } = args;
  const result = await prisma.loanApplication.findUnique({
    where: { id: loanApplicationId },
  });
  return result;
};

export const getSubmittedLoanApplications = async (): Promise<
  (LoanApplication & {
    creditScore: CreditScore | null;
    chainAccount: ChainAccount;
  })[]
> => {
  const result = await prisma.loanApplication.findMany({
    where: {
      isSubmitted: true,
      status: {
        not: LoanApplicationStatus.DRAFT,
      },
    },
    include: {
      creditScore: true,
      chainAccount: true,
    },
    orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
  });
  return result;
};

export const updateLoanApplication = async (args: {
  loanApplicationId: string;
  loanApplication: Partial<LoanApplication>;
}) => {
  const { loanApplicationId, loanApplication } = args;
  await prisma.loanApplication.update({
    where: { id: loanApplicationId },
    data: loanApplication,
  });
};
