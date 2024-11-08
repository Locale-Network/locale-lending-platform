'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

// TODO: add link to terms and privacy

export default function CardWithForm() {
   const router = useRouter();
   const { status } = useSession();
   const { isConnected, address } = useAccount();

  React.useEffect(() => {
    if (status === 'authenticated' && isConnected && address) {
      router.replace('/borrower');
    }
  }, [status, isConnected, address, router]);


  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center">
        <div className="mb-4 h-24 w-24 overflow-hidden rounded-full">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/66c4ab9d1cc12e32b4138e7e/f4e716cf-7a6e-44c5-a8cd-24b47dec43a1/favicon.ico?format=100w"
            alt="Project icon"
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
        <CardTitle className="text-center">Locale Network</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">
          Locale is a Layer-3 Rollup Network designed for Empowering Communities through DeFi &
          Smart City Services
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <ConnectButton label="Sign in with Ethereum" />

        <div className="text-xs text-muted-foreground">
          <Link href="#" className="hover:underline">
            Terms and Conditions
          </Link>
          {' • '}
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
