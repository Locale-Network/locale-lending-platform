import { NextRequest, NextResponse } from 'next/server';
import {
  SmartContractCreditScoreResponse,
  saveCreditScoreOfLoanApplication,
} from '@/services/db/credit-scores';
import { getLoanApplication } from '@/services/db/loan-applications/borrower';
import { CreditScore } from '@prisma/client';

/**
 * API endpoint is called automatically at the end of Reclaim flow after user's Bank Account is connected
 * Reclaim flow: src/app/data/loan/credit-score/page.tsx
 * 
 * @route GET /api/loan/[id]/credit-score
 * @param {string} id - The loan application ID
 * @param {string} access_token - Plaid access token for transaction data
 * 
 * @returns {Promise<CreditScoreApiResponse>} JSON response containing:
 * - status: 'success' or 'error'
 * - message: Description of the result
 * - data: Object containing credit score data or null
 * 
 * @throws {400} - When access token is missing
 * @throws {404} - When loan application is not found
 * @throws {500} - When credit score fetch fails
 */

export interface CreditScoreApiResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    creditScore: CreditScore;
  } | null;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const loanApplicationId = context?.params?.id;
  const { searchParams } = new URL(request.url);

  const accessToken = searchParams.get('access_token');
  /*
    TODO:
    - save accessToken in DB. Upsert by loan creator adress
  */

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
    // TODO: make call to smart contract to get credit score
    const creditScore: SmartContractCreditScoreResponse = {
      score: 700,
      scoreRangeMin: 650,
      scoreRangeMax: 750,
      scoreType: 'FICO',
      creditBureau: 'Equifax',
    };

    const result = await saveCreditScoreOfLoanApplication({
      creditScore,
      loanApplicationId,
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Credit score retrieved successfully',
        data: { creditScore: result },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error fetching credit score',
        data: null,
      },
      { status: 500 }
    );
  }
}
