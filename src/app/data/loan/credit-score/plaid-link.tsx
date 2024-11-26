'use client';

// https://github.com/plaid/react-plaid-link/blob/master/examples/oauth.tsx

import { useCallback, useEffect, useState } from 'react';
import { plaidPublicTokenExchange } from './actions';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import CalculateCreditScore from './calculate-credit-score';

interface PlaidLinkProps {
  linkToken: string;
  loanApplicationId: string;
}

export default function PlaidLink(props: PlaidLinkProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    const response = await plaidPublicTokenExchange(publicToken);
    if (response.isError || !response.accessToken) {
      return;
    }

    setAccessToken(response.accessToken);
  }, []);

  const config: PlaidLinkOptions = {
    token: props.linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    setTimeout(() => {
      setAccessToken('access-sandbox-9439bf2c-d0c1-4c3e-9a0d-029938544d1c');
    }, 1000);
  }, []);

  // useEffect(() => {
  //   if (ready) {
  //     open();
  //   }
  // }, [ready, open]);

  if (!accessToken) {
    return null;
  }

  console.log('accessToken', accessToken);

  return (
    <>
      <p>Acces s Token: {accessToken}</p>
      <CalculateCreditScore accessToken={accessToken} loanApplicationId={props.loanApplicationId} />
    </>
  );
}
