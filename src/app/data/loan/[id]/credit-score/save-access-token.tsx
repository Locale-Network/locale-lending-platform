'use client';

import { useState, useEffect } from 'react';
import { saveAccessTokenOfLoanApplicationCreator } from './actions';
import { CheckCircle, XCircle } from 'lucide-react';

export default function SaveAccessToken({
  loanApplicationId,
  accessToken,
  itemId,
}: {
  loanApplicationId: string;
  accessToken: string;
  itemId: string;
}) {
  const [apiError, setApiError] = useState<any | null>(null);
  const [savedToken, setSavedToken] = useState(false);

  // TODO: don't save access token
  useEffect(() => {
    // Save access token once when component mounts
    saveAccessTokenOfLoanApplicationCreator({
      loanApplicationId,
      accessToken,
      itemId,
    }).then(({ isError, errorMessage }) => {
      if (isError) {
        setApiError(errorMessage);
      } else {
        setSavedToken(true);
      }
    });
  }, []);

  if (apiError) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
        <XCircle className="h-5 w-5" />
        <span>Failed to save access token: {apiError}</span>
      </div>
    );
  }

  if (savedToken) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span>Access token saved successfully</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-600">
      <span>Saving access token...</span>
    </div>
  );
}
