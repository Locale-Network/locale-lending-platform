'use client';

import { useCallback, useEffect, useState } from 'react';
import { plaidPublicTokenExchange } from './actions';
import { usePlaidLink } from 'react-plaid-link';
import CalculateCreditScore from './calculate-credit-score';

export default function PlaidLink({
  linkToken,
  loanApplicationId,
}: {
  linkToken: string;
  loanApplicationId: string;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const onSuccess = useCallback(async (public_token: any) => {
    const response = await plaidPublicTokenExchange(public_token);
    if (response.isError || !response.accessToken) {
      return;
    }
    setAccessToken(response.accessToken);
  }, []);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken,
    receivedRedirectUri:
      'https://locale-reclaim.vercel.app/data/loan/cm3scs0ig00038qe3iiqdmw7r/credit-score',
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [open, ready]);

  if (!accessToken) {
    return null;
  }

  return (
    <>
      <p>Access Token: {accessToken}</p>
      <CalculateCreditScore loanApplicationId={loanApplicationId} accessToken={accessToken} />
    </>
  );
}
