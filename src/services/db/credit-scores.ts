import 'server-only';

import prisma from '@prisma/index';
import { CreditScore } from '@prisma/client';
import { getLoanApplication } from './loan-applications/borrower';

export type CreditKarmaCreditScoreResponse = Pick<
  CreditScore,
  'creditScoreEquifax' | 'creditScoreTransUnion'
>;

export const saveCreditScoreOfLoanApplication = async (args: {
  creditScore: CreditKarmaCreditScoreResponse;
  loanApplicationId: string;
}): Promise<void> => {
  const { creditScore, loanApplicationId } = args;

  await prisma.creditScore.create({
    data: {
      ...creditScore,
      loanApplication: {
        connect: {
          id: loanApplicationId,
        },
      },
    },
  });
};

export async function getLatestCreditScoreOfLoanApplication(loanApplicationId: string) {
  const result = await prisma.creditScore.findFirstOrThrow({
    where: {
      loanApplicationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
}
