'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { CreditScore } from '@prisma/client';
import { CreditScoreApiResponse } from '@/app/api/loan/[id]/credit-score/get';
export default function CalculateCreditScore({
  accessToken,
  loanApplicationId,
}: {
  accessToken: string;
  loanApplicationId: string;
}) {
  const [apiError, setApiError] = useState<any | null>(null);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);

  useEffect(() => {
    if (accessToken) {
      // TODO: change to debt-service api
      fetch(`/api/loan/${loanApplicationId}/credit-score?access_token=${accessToken}`)
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
  }, [loanApplicationId, accessToken]);

  if (apiError) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
        <XCircle className="h-5 w-5" />
        <span>We were not able to prequalify you at this time</span>
      </div>
    );
  }

  if (creditScore) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-600">
        <p>You’ve been prequalified</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-600">
      <span>Calculating debt service...</span>
    </div>
  );
}
