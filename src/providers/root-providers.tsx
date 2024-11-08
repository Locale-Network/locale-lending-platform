'use client';

import '@rainbow-me/rainbowkit/styles.css';

import {  RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider } from 'next-auth/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { WagmiProvider, type State } from 'wagmi';
import { config } from '@/utils/wagmi';

import { arbitrum } from 'wagmi/chains';

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to MY APP',
});

const queryClient = new QueryClient();

interface RootProviderProps {
  children: React.ReactNode;
  initialState: State | undefined;
}

export default function RootProviders({
  children,
  initialState,
}: RootProviderProps) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider initialChain={arbitrum}>
              {children}
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
