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

  await prisma.loanApplication.update({
    where: {
      id: loanApplicationId,
    },
    data: {
      creditScore: {
        connectOrCreate: {
          where: {
            loanApplicationId,
          },
          create: {
            ...creditScore,
          },
        },
      },
    },
  });
};

export async function getCreditScoreOfLoanApplication(loanApplicationId: string) {
  const result = await prisma.creditScore.findUniqueOrThrow({
    where: {
      loanApplicationId,
    },
  });

  return result;
}
