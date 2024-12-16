import { NextRequest, NextResponse } from 'next/server';
import { getLoanApplication } from '@/services/db/loan-applications/borrower';
import { saveDebtServiceOfLoanApplication } from '@/services/db/debt-service';

/**
 * API endpoint is called automatically at the end of Plaid Link flow after user's bank account is connected
 * The Authorization header contains the Plaid access token for transactions
 * Flow: src/app/data/loan/credit-score/page.tsx
 * 
 * @route GET /api/loan/[id]/debt-service
 * @param {string} id - The loan application ID
 * @param {string} Authorization - Bearer token containing Plaid access token for transactions
 * 
 * @returns {Promise<DebtServiceApiResponse>} JSON response containing:
 * - status: 'success' or 'error'
 * - message: Description of the result
 * - data: Object containing debt service data or null
 * 
 * @throws {400} - When Plaid access token is missing
 * @throws {404} - When loan application is not found
 * @throws {500} - When debt service fetch fails
 */


export interface SBA {
  netOperatingIncome: number;
  totalDebtService: number;
  dscr: number;
}

export interface DebtServiceApiResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    sba: SBA;
  } | null;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const loanApplicationId = context.params.id;
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]; // Bearer token

  if (!accessToken) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'No access token provided',
        data: null,
      },
      { status: 400 }
    );
  }

  const loanApplication = await getLoanApplication({
    loanApplicationId,
  });

  if (!loanApplication) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Loan application not found',
        data: null,
      },
      { status: 404 }
    );
  }

  try {
    // TODO: make a POST request to the Cartesi
    const netOperatingIncome = 100000;
    const totalDebtService = 10000;
    const dscr = netOperatingIncome / totalDebtService;
    const sba: SBA = {
      netOperatingIncome,
      totalDebtService,
      dscr,
    };

    await saveDebtServiceOfLoanApplication({
      debtService: sba,
      loanApplicationId,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Debt service retrieved successfully',
        data: { sba },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error fetching debt service',
        data: null,
      },
      { status: 500 }
    );
  }
}
