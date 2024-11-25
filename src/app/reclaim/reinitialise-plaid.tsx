'use client';

// https://github.com/plaid/react-plaid-link/blob/master/examples/oauth.tsx

import { useCallback, useEffect, useState } from 'react';
import { plaidPublicTokenExchange } from '@/app/data/loan/credit-score/actions';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import CalculateCreditScore from './calculate-credit-score';

export default function ReinitialisePlaid() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isOAuthRedirect, setIsOAuthRedirect] = useState(false);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    const response = await plaidPublicTokenExchange(publicToken);
    if (response.isError || !response.accessToken) {
      return;
    }
    setAccessToken(response.accessToken);
  }, []);

  useEffect(() => {
    if (isOAuthRedirect) {
      setLinkToken(localStorage.getItem('link_token'));
    }
  }, [isOAuthRedirect]);

  useEffect(() => {
    setIsOAuthRedirect(window.location.href.includes('?oauth_state_id='));
  }, []);

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess,
  };

  if (isOAuthRedirect) {
    // receivedRedirectUri must include the query params
    config.receivedRedirectUri = window.location.href;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOAuthRedirect && ready) {
      open();
    }
  }, [ready, open, isOAuthRedirect]);

  if (!accessToken) {
    return null;
  }

  return (
    <>
      <p>Access Token: {accessToken}</p>
      {/* <CalculateCreditScore loanApplicationId={props.loanApplicationId} accessToken={accessToken} /> */}
    </>
  );
}
