import 'server-only';

import prisma from '@prisma/index';
import { DebtService } from '@prisma/client';
import { getLoanApplication } from './loan-applications/borrower';

export type CartesiDebtServiceResponse = Pick<
  DebtService,
  'netOperatingIncome' | 'totalDebtService' | 'dscr'
>;

export const saveDebtServiceOfLoanApplication = async (args: {
  debtService: CartesiDebtServiceResponse;
  loanApplicationId: string;
}): Promise<void> => {
  const { debtService, loanApplicationId } = args;

  await prisma.debtService.create({
    data: {
      ...debtService,
      loanApplication: {
        connect: {
          id: loanApplicationId,
        },
      },
    },
  });
};

export async function getLatestDebtServiceOfLoanApplication(loanApplicationId: string) {
  const result = await prisma.debtService.findFirstOrThrow({
    where: {
      loanApplicationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
}
