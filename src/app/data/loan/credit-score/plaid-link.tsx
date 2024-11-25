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
  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    const response = await plaidPublicTokenExchange(publicToken);
    if (response.isError || !response.accessToken) {
      return;
    }
  }, []);

  useEffect(() => {
    if (props.linkToken) {
      localStorage.setItem('link_token', props.linkToken);
    }
  }, [props.linkToken]);

  useEffect(() => {
    if (props.loanApplicationId) {
      localStorage.setItem('loan_application_id', props.loanApplicationId);
    }
  }, [props.loanApplicationId]);

  const config: PlaidLinkOptions = {
    token: props.linkToken,
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
