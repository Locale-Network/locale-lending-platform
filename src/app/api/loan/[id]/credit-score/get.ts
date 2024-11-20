import { NextRequest, NextResponse } from 'next/server';
import {
  SmartContractCreditScoreResponse,
  saveCreditScoreOfLoanApplication,
} from '@/services/db/credit-scores';
import { getLoanApplication } from '@/services/db/loan-applications';
import { CreditScore } from '@prisma/client';

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

  const loanApplication = await getLoanApplication({ loanApplicationId });

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
