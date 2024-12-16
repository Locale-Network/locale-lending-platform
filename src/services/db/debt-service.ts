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

  await prisma.loanApplication.update({
    where: {
      id: loanApplicationId,
    },
    data: {
      debtService: {
        connectOrCreate: {
          where: {
            loanApplicationId,
          },
          create: {
            ...debtService,
          },
        },
      },
    },
  });
};

export async function getDebtServiceOfLoanApplication(loanApplicationId: string) {
  const result = await prisma.debtService.findUniqueOrThrow({
    where: {
      loanApplicationId,
    },
  });

  return result;
}
