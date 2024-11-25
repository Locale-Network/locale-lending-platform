'use client';

// https://github.com/plaid/react-plaid-link/blob/master/examples/oauth.tsx

import { useCallback, useEffect, useState } from 'react';
import { plaidPublicTokenExchange } from './actions';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

interface PlaidLinkProps {
  linkToken: string;
  loanApplicationId: string;
}

export default function PlaidLink(props: PlaidLinkProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(props.linkToken);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    const response = await plaidPublicTokenExchange(publicToken);
    if (response.isError || !response.accessToken) {
      return;
    }
    setAccessToken(response.accessToken);
  }, []);

  useEffect(() => {
    // Set link token in localStorage when component mounts
    if (props.linkToken) {
      localStorage.setItem('link_token', props.linkToken);
      setLinkToken(props.linkToken);
    }
  }, [props.linkToken]);

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return <></>;
}
