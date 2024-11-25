'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

export interface StateInterface {
  linkSuccess: boolean;
  isItemAccess: boolean;
  isPaymentInitiation: boolean;
  linkToken: string | null;
  accessToken: string | null;
  itemId: string | null;
  isError: boolean;
  backend: boolean;
  products: string[];
  linkTokenError: {
    error_message: string;
    error_code: string;
    error_type: string;
  };
}

export default function Home() {
  const [state, setState] = useState<StateInterface>({
    linkSuccess: false,
    isItemAccess: true,
    isPaymentInitiation: false,
    linkToken: '', // Don't set to null or error message will show up briefly when site loads
    accessToken: null,
    itemId: null,
    isError: false,
    backend: true,
    products: ['transactions'],
    linkTokenError: {
      error_type: '',
      error_code: '',
      error_message: '',
    },
  });

  const [user, setUser] = useState<{ name: string; officialName: string }>({
    name: '',
    officialName: '',
  });

  const getInfo = useCallback(async () => {
    const response = await fetch(`/api/info?access_token=${state.accessToken}`, { method: 'POST' });
    if (!response.ok) {
      setState(prevState => ({ ...prevState, backend: false }));
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation: boolean = data.products.includes('payment_initiation');

    setState(prevState => ({
      ...prevState,
      products: data.products,
      isPaymentInitiation: paymentInitiation,
    }));
    return { paymentInitiation };
  }, [state.accessToken]);

  const generateToken = useCallback(async (isPaymentInitiation: boolean) => {
    // Link tokens for 'payment_initiation' use a different creation flow in your backend.
    const path = isPaymentInitiation
      ? '/api/create_link_token_for_payment'
      : '/api/create_link_token';
    const response = await fetch(path, {
      method: 'POST',
    });
    if (!response.ok) {
      setState(prevState => ({ ...prevState, linkToken: null }));
      return;
    }
    const data = await response.json();
    if (data) {
      setState(prevState => ({
        ...prevState,
        linkToken: data.link_token,
      }));
    }

    // Save the link_token to be used later in the Oauth flow.
    localStorage.setItem('link_token', data.link_token);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { paymentInitiation } = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes('?oauth_state_id=')) {
        setState(prevState => ({
          ...prevState,
          linkToken: localStorage.getItem('link_token'),
        }));
        return;
      }
      generateToken(paymentInitiation);
    };
    init();
  }, [generateToken, getInfo]);

  // useEffect(() => {
  //   const init = async () => {
  //     await fetch(`/api/transactions?access_token=${state.accessToken}`, {
  //       method: 'GET',
  //     });

  //     const response = await fetch(`/api/accounts?access_token=${state.accessToken}`, {
  //       method: 'GET',
  //     });

  //     const data = await response.json();
  //     console.log(data);
  //     setUser({
  //       name: data.name,
  //       officialName: data.official_name,
  //     });
  //   };
  //   if (state.accessToken) {
  //     init();
  //   }
  // }, [state.accessToken, state.isItemAccess]);

  const { linkToken, isPaymentInitiation } = state;

  const onSuccess = useCallback(
    (public_token: string) => {
      // If the access_token is needed, send public_token to server
      const exchangePublicTokenForAccessToken = async () => {
        const response = await fetch('/api/set_access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token }),
        });
        if (!response.ok) {
          setState((prevState: StateInterface) => ({
            ...prevState,
            itemId: `no item_id retrieved`,
            accessToken: `no access_token retrieved`,
            isItemAccess: false,
          }));
          return;
        }
        const data = await response.json();
        setState((prevState: StateInterface) => ({
          ...prevState,
          itemId: data.item_id,
          accessToken: data.access_token,
          isItemAccess: true,
        }));
      };

      // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
      if (isPaymentInitiation) {
        setState((prevState: StateInterface) => ({
          ...prevState,
          isItemAccess: false,
        }));
      } else {
        exchangePublicTokenForAccessToken();
      }

      setState((prevState: StateInterface) => ({
        ...prevState,
        linkSuccess: true,
      }));
      // window.history.pushState("", "", "/");
    },
    [isPaymentInitiation, setState]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  if (typeof window !== 'undefined' && window.location.href.includes('?oauth_state_id=')) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (!state.isItemAccess || !state.accessToken) {
      open();
    }
  }, [open, state.accessToken, state.isItemAccess]);

  return (
    <main>
      <div>
        {state.isItemAccess && state.accessToken && (
          <div>
            <div>
              <strong className="title">accessToken :</strong> {state.accessToken}
            </div>
            <div>
              <strong className="title">itemId :</strong> {state.itemId}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
