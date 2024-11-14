'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signIn } from '@/app/signin/actions';

interface WalletConnectButtonProps {
  label?: string;
}

const WalletConnectButton = ({ label }: WalletConnectButtonProps) => {
  const { isConnecting, address, isConnected } = useAccount();
  const { status } = useSession();

  React.useEffect(() => {
    if (status === 'authenticated' && isConnected && address) {
      (async function () {
        await signIn(address);
      })();
    }
  }, [status, isConnected, address]);

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[#1A1B1F] px-3 py-[12px] font-medium text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-[#24262B]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return <ConnectButton label={label} />;
};

export default WalletConnectButton;
