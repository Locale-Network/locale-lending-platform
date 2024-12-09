'use server';

import { getLoanApplicationsOfBorrower as dbGetLoanApplicationsOfBorrower } from '@/services/db/loan-applications/borrower';
import { validateRequest as validateBorrowerRequest } from '@/app/borrower/actions';
import { LoanApplicationsForTable } from './columns';

interface GetLoanApplicationsResponse {
  isError: boolean;
  errorMessage?: string;
  loanApplications?: LoanApplicationsForTable[];
}
export const getLoanApplications = async (
  accountAddress: string
): Promise<GetLoanApplicationsResponse> => {
  try {
    await validateBorrowerRequest(accountAddress);
    const loans = await dbGetLoanApplicationsOfBorrower(accountAddress);

    const loansForTable: LoanApplicationsForTable[] = loans.map(loan => ({
      id: loan.id,
      status: loan.status,
      createdDate: loan.createdAt,
      updatedDate: loan.updatedAt,
    }));

    return {
      isError: false,
      loanApplications: loansForTable,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Failed to get loan applications',
    };
  }
};
