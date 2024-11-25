'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { CreditScore } from '@prisma/client';
import { CreditScoreApiResponse } from '@/app/api/loan/[id]/credit-score/get';

interface CalculateCreditScoreProps {
  accessToken: string | null;
}

export default function CalculateCreditScore(props: CalculateCreditScoreProps) {
  const [apiError, setApiError] = useState<any | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [loanApplicationId, setLoanApplicationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(props.accessToken);

  useEffect(() => {
    setLoanApplicationId(localStorage.getItem('loan_application_id'));
  }, []);

  useEffect(() => {
    if (1) {
      /*
          FIXME: add access token
          FIXME: add loan application id
          */
      fetch(`/api/loan/cm3shrx7z000161x6vt3mpezc/credit-score?access_token=access_token`)
        .then(response => response.json())
        .then((data: CreditScoreApiResponse) => {
          if (data.status === 'error') {
            setApiError(data.message);
          } else {
            setCreditScore(data.data?.creditScore ?? null);
          }
        })
        .catch(() => setApiError('Error fetching credit score'));
    }
  }, []);
  // FIXME: add access token and loan application id

  if (apiError) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
        <XCircle className="h-5 w-5" />
        <span>Failed to calculate credit score: {apiError}</span>
      </div>
    );
  }

  if (creditScore) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-600">
        <p>Score: {creditScore.score}</p>
        <p>
          Score Range: {creditScore.scoreRangeMin} - {creditScore.scoreRangeMax}
        </p>
        <p>Score Type: {creditScore.scoreType}</p>
        <p>Credit Bureau: {creditScore.creditBureau}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-600">
      <span>Calculating credit score...</span>
    </div>
  );
}
