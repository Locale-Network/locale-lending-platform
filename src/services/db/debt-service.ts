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
}): Promise<DebtService> => {
  const { debtService, loanApplicationId } = args;

  const loanApplication = await getLoanApplication({ loanApplicationId });

  if (!loanApplication) {
    throw new Error(`Loan application with id ${loanApplicationId} not found`);
  }

  const result = await prisma.$transaction(async tx => {
    const debtServiceResult = await tx.debtService.upsert({
      where: {
        loanApplicationId: loanApplicationId,
      },
      create: {
        ...debtService,
        loanApplication: {
          connect: {
            id: loanApplicationId,
          },
        },
      },
      update: {
        ...debtService,
      },
    });

    await tx.loanApplication.update({
      where: {
        id: loanApplicationId,
      },
      data: {
        debtServiceId: debtServiceResult.id,
      },
    });

    return debtServiceResult;
  });

  return result;
};

export async function getDebtServiceOfLoanApplication(loanApplicationId: string) {
  const result = await prisma.debtService.findUniqueOrThrow({
    where: {
      loanApplicationId,
    },
  });

  return result;
}
