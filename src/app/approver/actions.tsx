'use server';

import {
  getSubmittedLoanApplications as dbGetSubmittedLoanApplications,
  updateLoanApplication as dbUpdateLoanApplication,
} from '@/services/db/loan-applications/approver';
import { formatAddress } from '@/utils/string';
import { LoanApplicationsForTable } from './columns';
import { authOptions, ROLE_REDIRECTS } from '@/app/api/auth/auth-options';
import { LoanApplicationStatus, Role } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Address, isAddress } from 'viem';
import { revalidatePath } from 'next/cache';

export async function validateRequest(chainAccountAddress: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== Role.APPROVER && session.user.role !== Role.ADMIN) {
    redirect(ROLE_REDIRECTS[session.user.role]);
  }

  if (session?.address !== chainAccountAddress) {
    throw new Error('User address does not match chain account address');
  }

  if (!isAddress(chainAccountAddress)) {
    throw new Error('Invalid chain account address');
  }
}

interface GetSubmittedLoanApplicationsResponse {
  isError: boolean;
  errorMessage?: string;
  loanApplications?: LoanApplicationsForTable[];
}
export const getSubmittedLoanApplications = async (
  chainAccountAddress: string
): Promise<GetSubmittedLoanApplicationsResponse> => {
  try {
    await validateRequest(chainAccountAddress);

    const loanApplications = await dbGetSubmittedLoanApplications();

    const loanApplicationsForTable: LoanApplicationsForTable[] = loanApplications.map(loan => ({
      id: loan.id,
      creatorAddress: formatAddress(loan.account.address as Address),
      creditScore: loan.creditScore?.score ?? 0,
      status: loan.status,
      createdDate: loan.createdAt,
      updatedDate: loan.updatedAt,
    }));

    return {
      isError: false,
      loanApplications: loanApplicationsForTable,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Failed to fetch loan applications',
    };
  }
};

export const updateLoanApplicationStatus = async (
  loanApplicationId: string,
  status: LoanApplicationStatus
) => {
  await dbUpdateLoanApplication({ loanApplicationId, loanApplication: { status } });

  revalidatePath('/approver');
};
