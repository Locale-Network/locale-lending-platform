'use client';

// https://github.com/plaid/react-plaid-link/blob/master/examples/oauth.tsx

import { useCallback, useEffect, useState } from 'react';
import { plaidPublicTokenExchange } from './actions';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import CalculateCreditScore from './calculate-credit-score';

interface PlaidLinkProps {
  initialLinkToken: string;
  loanApplicationId: string;
}

export default function PlaidLink(props: PlaidLinkProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(props.initialLinkToken);
  const [isOAuthRedirect, setIsOAuthRedirect] = useState(false);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    const response = await plaidPublicTokenExchange(publicToken);
    if (response.isError || !response.accessToken) {
      return;
    }
    setAccessToken(response.accessToken);
    // TODO: router push
  }, []);

  useEffect(() => {
    if (isOAuthRedirect) {
      setLinkToken(localStorage.getItem('link_token'));
    }
  }, [isOAuthRedirect]);

  useEffect(() => {
    setIsOAuthRedirect(window.location.href.includes('?oauth_state_id='));
  }, []);

  useEffect(() => {
    // Set link token in localStorage when component mounts
    if (props.initialLinkToken) {
      localStorage.setItem('link_token', props.initialLinkToken);
      setLinkToken(props.initialLinkToken);
    }
  }, [props.initialLinkToken]);

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
    if (ready) {
      open();
    }
  }, [ready, open, isOAuthRedirect]);

  if (!accessToken) {
    return null;
  }

  return (
    <>
      <p>Access Token: {accessToken}</p>
      <CalculateCreditScore loanApplicationId={props.loanApplicationId} accessToken={accessToken} />
    </>
  );
}
