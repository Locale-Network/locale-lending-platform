'use server';
import { CreditScore, DebtService } from '@prisma/client';
import { loanApplicationFormSchema, LoanApplicationForm } from './form-schema';
import {
  initialiseLoanApplication as dbInitialiseLoanApplication,
  submitLoanApplication as dbSubmitLoanApplication,
} from '@/services/db/loan-applications/borrower';
import { getCreditScoreOfLoanApplication as dbGetCreditScoreOfLoanApplication } from '@/services/db/credit-scores';
import { getDebtServiceOfLoanApplication as dbGetDebtServiceOfLoanApplication } from '@/services/db/debt-service';
import { validateRequest as validateBorrowerRequest } from '@/app/borrower/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// return loan application id
interface InitialiseLoanApplicationResponse {
  isError: boolean;
  errorMessage?: string;
  loanApplicationId?: string;
}
export async function initialiseLoanApplication(
  accountAddress: string
): Promise<InitialiseLoanApplicationResponse> {
  try {
    await validateBorrowerRequest(accountAddress);

    const loanApplication = await dbInitialiseLoanApplication(accountAddress);

    return {
      isError: false,
      loanApplicationId: loanApplication.id,
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error initiating loan application',
    };
  }
}

interface GetCreditScoreOfLoanApplicationResponse {
  isError: boolean;
  errorMessage?: string;
  creditScore?: Pick<CreditScore, 'id'>;
}
export async function getCreditScoreOfLoanApplication(
  loanApplicationId: string
): Promise<GetCreditScoreOfLoanApplicationResponse> {
  try {
    const result = await dbGetCreditScoreOfLoanApplication(loanApplicationId);

    return {
      isError: false,
      creditScore: {
        id: result.id,
      },
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error getting credit score of loan application',
    };
  }
}

interface GetDebtServiceOfLoanApplicationResponse {
  isError: boolean;
  errorMessage?: string;
  debtService?: Pick<DebtService, 'id'>;
}
export async function getDebtServiceOfLoanApplication(
  loanApplicationId: string
): Promise<GetDebtServiceOfLoanApplicationResponse> {
  try {
    const result = await dbGetDebtServiceOfLoanApplication(loanApplicationId);

    return {
      isError: false,
      debtService: {
        id: result.id,
      },
    };
  } catch (error) {
    return {
      isError: true,
      errorMessage: 'Error getting debt service of loan application',
    };
  }
}

export async function submitLoanApplication(args: {
  formData: LoanApplicationForm;
  accountAddress: string;
}): Promise<void> {
  const { formData, accountAddress } = args;
  await validateBorrowerRequest(accountAddress);

  if (formData.accountAddress !== accountAddress) {
    throw new Error('Unauthorized creator of loan application');
  }

  const result = loanApplicationFormSchema.safeParse(formData);

  if (!result.success) {
    throw new Error('Invalid form data');
  }

  await dbSubmitLoanApplication({
    id: formData.applicationId,
    creditScoreId: formData.creditScoreId || '',
    debtServiceId: formData.debtServiceId || '',
    accountAddress,
    businessInfo: {
      businessLegalName: formData.businessLegalName,
      businessAddress: formData.businessAddress,
      businessState: formData.businessState,
      businessCity: formData.businessCity,
      businessZipCode: formData.businessZipCode,
      businessWebsite: formData.businessWebsite || null,
      ein: formData.ein,
      businessFoundedYear: formData.businessFoundedYear,
      businessLegalStructure: formData.businessLegalStructure,
      businessPrimaryIndustry: formData.businessPrimaryIndustry,
      businessDescription: formData.businessDescription,
    },
    outstandingLoans: formData.outstandingLoans,
  });

  redirect('/borrower/loans');
}
