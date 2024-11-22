import 'server-only';

import prisma from '@prisma/index';
import { CreditScore } from '@prisma/client';
import { getLoanApplication } from './loan-applications/borrower';

export type SmartContractCreditScoreResponse = Omit<
  CreditScore,
  'createdAt' | 'updatedAt' | 'id' | 'chainAccountAddress' | 'loanApplicationId'
>;

export const saveCreditScoreOfLoanApplication = async (args: {
  creditScore: SmartContractCreditScoreResponse;
  loanApplicationId: string;
}): Promise<CreditScore> => {
  const { creditScore, loanApplicationId } = args;

  const loanApplication = await getLoanApplication({ loanApplicationId });

  if (!loanApplication) {
    throw new Error(`Loan application with id ${loanApplicationId} not found`);
  }

  const { chainAccountAddress } = loanApplication;

  const result = await prisma.$transaction(async tx => {
    const creditScoreResult = await tx.creditScore.upsert({
      where: {
        loanApplicationId: loanApplicationId,
      },
      create: {
        ...creditScore,
        loanApplication: {
          connect: {
            id: loanApplicationId,
          },
        },
        chainAccount: {
          connect: {
            address: chainAccountAddress,
          },
        },
      },
      update: {
        ...creditScore,
      },
    });

    await tx.loanApplication.update({
      where: {
        id: loanApplicationId,
      },
      data: {
        creditScoreId: creditScoreResult.id,
      },
    });

    return creditScoreResult;
  });

  return result;
};

export async function getCreditScoreOfLoanApplication(loanApplicationId: string) {
  const result = await prisma.creditScore.findUniqueOrThrow({
    where: {
      loanApplicationId,
    },
  });

  return result;
}
